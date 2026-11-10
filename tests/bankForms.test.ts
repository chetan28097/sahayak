import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildBankForm, pendingCount, type FilledForm } from "@/lib/bankForms";
import type { Account, Values } from "@/lib/types";
import { createFileRepo } from "@/server/store/file";
import type { RequestRecord } from "@/server/store/types";

const acc: Account = {
  accountNumber: "30214567891", holder: "Lakshmamma", holderLocal: {}, branch: "Hosakote", accountType: "SB",
  dob: "1958-06-02", mobile: "9845012345", address: "14, Kote Road, Hosakote", aadhaarLast4: "7781", cardLast4: "4421",
};
const meta = { code: "K7Q-4M2", createdAt: "2026-11-10T05:00:00.000Z", readBackAt: "2026-11-10T04:59:00.000Z" };
const field = (form: FilledForm, id: string) => form.sections.flatMap((s) => s.fields).find((f) => f.id === id);

describe("bank form specs", () => {
  it("fills the pay-in slip from voice, record and system", () => {
    const v: Values = { accountNumber: "30214567891", accountHolder: "Lakshmamma", amount: 12500, notes: { "500": 20, "100": 25 }, selfDeposit: true };
    const form = buildBankForm("deposit", v, acc, meta);
    expect(field(form, "amountWords")?.value).toBe("Rupees Twelve Thousand Five Hundred Only");
    expect(field(form, "depositorMobile")).toMatchObject({ value: "9845012345", source: "record" });
    expect(field(form, "pan")?.value).toContain("Not required");
    expect(field(form, "signature")?.source).toBe("counter");
    expect(form.sections.find((s) => s.title === "Amount")?.table?.rows.at(-1)).toEqual(["Total", "", "₹12,500"]);
  });

  it("marks CKYC gaps and flags declarations for staff", () => {
    const v: Values = {
      aadhaarScanned: true, name: "Lakshmi Narayan", dob: "1962-03-14", gender: "female", marital: "married",
      address: "12 Temple Rd", aadhaarLast4: "4821", fatherOrSpouse: "Narayanappa", motherName: "Gowramma",
      livesAtAadhaarAddress: true, form60: true, mobile: "9845012345", occupation: "farmer", income: "lt1",
      declarationOk: false, accountType: "jandhan", nominees: [{ name: "Suresh", relation: "son", dob: "2015-01-01", guardian: "Ramesh" }],
    };
    const form = buildBankForm("account_open", v, undefined, meta);
    expect(field(form, "title")?.value).toBe("Smt.");
    expect(field(form, "ovdNumber")).toMatchObject({ value: "XXXX-XXXX-4821", source: "card" });
    expect(field(form, "email")?.source).toBe("counter");
    expect(field(form, "pep")?.value).toBe("Staff to verify");
    expect(form.flags.join(" ")).toContain("Form 60");
    expect(form.sections.find((s) => s.title.startsWith("Nomination"))?.table?.rows[0]).toContain("Ramesh");
    expect(pendingCount(form)).toBeGreaterThan(2);
  });

  it("builds APY with the PFRDA contribution and the hotlisting form as urgent", () => {
    const apy = buildBankForm("scheme_enroll", { accountNumber: "1", scheme: "apy", dob: "1996-01-01", pensionSlab: 2000, autoDebitConsent: true }, acc, meta);
    expect(apy.title).toContain("Atal Pension");
    expect(field(apy, "contribution")?.value).toBe("₹231");
    const block = buildBankForm("service_request", { requestType: "block_card", cardReason: "lost", cardReissue: true }, acc, meta);
    expect(block.title).toContain("URGENT");
    expect(field(block, "card")?.value).toBe("XXXX XXXX XXXX 4421");
  });
});

describe("file repository contract", () => {
  let dir: string;
  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), "sahayak-"));
    writeFileSync(path.join(dir, "accounts.json"), JSON.stringify([acc]));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("stores, finds, filters and updates requests", async () => {
    const repo = createFileRepo(dir);
    expect((await repo.listAccounts())[0].holder).toBe("Lakshmamma");
    const record: RequestRecord = {
      id: "11111111-1111-1111-1111-111111111111", code: "K7Q-4M2", sessionId: "s", service: "deposit", lang: "kn",
      kind: "application", escalated: false, assignedTo: null, checklist: {},
      status: "waiting", urgent: false, needsStaff: false, accountNumber: "30214567891", customerName: "Lakshmamma",
      summary: null, form: buildBankForm("deposit", {}, acc, meta), customer: { rows: [] }, token: "x.y",
      readBackAt: meta.readBackAt, createdAt: meta.createdAt, processedAt: null, staffNote: null,
    };
    await repo.createRequest(record);
    expect((await repo.getRequestByCode("k7q4m2"))?.id).toBe(record.id);
    expect(await repo.listRequests({ status: "completed" })).toHaveLength(0);
    expect(await repo.listRequests({ q: "laksh" })).toHaveLength(1);
    expect(await repo.listRequests({ statuses: ["waiting", "in_review"] })).toHaveLength(1);
    const done = await repo.updateRequest(record.id, { status: "completed", staffNote: "ok" });
    expect(done?.status).toBe("completed");
    expect(done?.processedAt).not.toBeNull();
    await repo.addEvent({ requestId: record.id, at: "2026-11-10T06:00:00.000Z", actor: "Asha", action: "complete", note: null });
    expect((await repo.listEvents({ requestId: record.id }))[0].actor).toBe("Asha");
    expect(await repo.getConfig()).toBeNull();
  });
});
