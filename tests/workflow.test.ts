import { beforeAll, describe, expect, it } from "vitest";
import { buildBankForm } from "@/lib/bankForms";
import { currentConfig, DEFAULT_CONFIG, setConfig } from "@/lib/config";
import { createSession, currentStep, handle, type MachineDeps, type MachineInput, type SessionState } from "@/lib/machine";
import { buildReport, toCsv } from "@/lib/report";
import type { Account } from "@/lib/types";
import { applyAction, checklistFor, nextAction, pendingItems, type WorkflowRecord } from "@/lib/workflow";

beforeAll(() => {
  process.env.SLIP_SIGNING_SECRET = "test-secret-0123456789abcdef";
});

const meta = { code: "K7Q-4M2", createdAt: "2026-11-10T05:00:00.000Z", readBackAt: "2026-11-10T04:59:00.000Z" };
const NOW = "2026-11-10T06:00:00.000Z";

describe("bank-side workflow", () => {
  const form = buildBankForm("deposit", { accountNumber: "30214567891", amount: 60000, notes: { "500": 120 }, form60: true, selfDeposit: true }, undefined, meta);
  const items = checklistFor(form);
  const fresh: WorkflowRecord = { status: "waiting", checklist: {}, escalated: false, assignedTo: null };

  it("builds a checklist from flags, counter fields and the read-back", () => {
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Form 60 to be signed");
    expect(labels.some((l) => /signature/i.test(l))).toBe(true);
    expect(labels.at(-1)).toMatch(/matches what they said/);
    expect(items.find((i) => /signature/i.test(i.label))?.kind).toBe("signature");
  });

  it("never completes before every item is verified", () => {
    const claimed = applyAction(fresh, items, { action: "claim" }, "Asha", NOW);
    expect(claimed.ok && claimed.patch.status).toBe("in_review");
    const early = applyAction({ ...fresh, status: "in_review" }, items, { action: "complete" }, "Asha", NOW);
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error).toMatch(/Verify \d+ more/);
  });

  it("moves to verified when the last item is ticked, then completes", () => {
    let rec: WorkflowRecord = { ...fresh, status: "in_review" };
    for (const item of items) {
      const r = applyAction(rec, items, { action: "verify", item: item.id }, "Asha", NOW);
      if (!r.ok) throw new Error(r.error);
      rec = { ...rec, ...r.patch };
    }
    expect(rec.status).toBe("verified");
    expect(pendingItems(items, rec.checklist)).toHaveLength(0);
    expect(rec.checklist[items[0].id].by).toBe("Asha");
    const done = applyAction(rec, items, { action: "complete" }, "Asha", NOW);
    expect(done.ok && done.patch.status).toBe("completed");
    const again = applyAction({ ...rec, status: "completed" }, items, { action: "verify", item: items[0].id }, "Asha", NOW);
    expect(again.ok).toBe(false);
  });

  it("requires a reason to ask for information, escalate or reject", () => {
    expect(applyAction(fresh, items, { action: "request_info" }, "Asha", NOW).ok).toBe(false);
    const asked = applyAction(fresh, items, { action: "request_info", note: "Bring PAN card" }, "Asha", NOW);
    expect(asked.ok && asked.patch.status).toBe("needs_info");
    expect(applyAction(fresh, items, { action: "reject" }, "Asha", NOW).ok).toBe(false);
    const esc = applyAction(fresh, items, { action: "escalate", note: "Suspected fraud" }, "Asha", NOW);
    expect(esc.ok && esc.patch.escalated).toBe(true);
  });

  it("re-opens closed requests and tells the officer what to do next", () => {
    const reopened = applyAction({ ...fresh, status: "rejected" }, items, { action: "reopen" }, "Meera", NOW);
    expect(reopened.ok && reopened.patch.status).toBe("in_review");
    expect(nextAction({ ...fresh, status: "in_review" }, items, false)).toMatch(/^Verify/);
    expect(nextAction(fresh, items, true)).toMatch(/Urgent/);
  });

  it("help calls have a single item", () => {
    expect(checklistFor(form, "assist")).toEqual([{ id: "helped", label: "Customer has been helped", kind: "record" }]);
  });
});

describe("encrypted QR tokens", () => {
  it("round-trips, hides content, and rejects tampering", async () => {
    const { signPayload, verifyToken, applicationReference } = await import("@/server/sign");
    const token = signPayload({ name: "Lakshmamma", amount: 12500 });
    expect(token.startsWith("v3.")).toBe(true);
    expect(Buffer.from(token.split(".")[1], "base64url").toString("latin1")).not.toContain("Lakshmamma");
    const ok = verifyToken(token);
    expect(ok.valid && ok.payload.name).toBe("Lakshmamma");
    const [v, body, sig] = token.split(".");
    const flipped = body.slice(0, 20) + (body[20] === "A" ? "B" : "A") + body.slice(21);
    expect(verifyToken(`${v}.${flipped}.${sig}`).valid).toBe(false);
    expect(verifyToken(`${v}.${body}.${sig.slice(0, -2)}xx`).valid).toBe(false);
    expect(applicationReference("K7Q-4M2", "2026-11-10T05:00:00Z", "Hosakote")).toBe("SGB/HOS/2026-11-10/K7Q4M2");
  });
});

describe("existing customer account opening", () => {
  const ACC: Account = {
    accountNumber: "30214567891", holder: "Lakshmamma", holderLocal: {}, branch: "Hosakote", dob: "1958-06-02",
    fatherOrSpouse: "Late Narayanappa", mobile: "9845012345", address: "14, Kote Road, Hosakote", aadhaarLast4: "7781",
  };
  const deps: MachineDeps = { findAccount: (n) => (n === ACC.accountNumber ? ACC : undefined), now: () => NOW };
  const run = (s: SessionState, inputs: (string | MachineInput)[]) =>
    inputs.reduce((st, i) => handle(st, typeof i === "string" ? { type: "text", text: i } : i, deps).state, s);

  it("reuses KYC on record and asks only what is missing", () => {
    let s = run(createSession("s", "en", "mock", NOW), ["open new account", "yes", "30214567891", "yes"]);
    expect(currentStep(s)?.id).toBe("identityConfirm");
    expect(s.lastSay).toContain("Our records");
    expect(s.values.fatherOrSpouse).toBe("Late Narayanappa");
    s = run(s, ["yes", "yes"]);
    // name, dob, address, father/spouse, mobile all came from the record → next new info is gender
    expect(currentStep(s)?.id).toBe("gender");
  });

  it("new customers go to the Aadhaar photo", () => {
    const s = run(createSession("s", "en", "mock", NOW), ["open new account", "no"]);
    expect(currentStep(s)?.id).toBe("aadhaarPhoto");
  });
});

describe("branch configuration", () => {
  it("drives the PAN threshold and offered schemes", () => {
    const deps: MachineDeps = { findAccount: () => ({ accountNumber: "30214567891", holder: "X", holderLocal: {}, branch: "H", dob: "1995-01-01" }), now: () => NOW };
    setConfig({ ...DEFAULT_CONFIG, panThreshold: 20000, schemes: ["pmsby"] });
    try {
      let s = createSession("s", "en", "mock", NOW);
      for (const t of ["deposit", "30214567891", "yes", "25000", "yes", "50 notes of 500"]) s = handle(s, { type: "text", text: t }, deps).state;
      expect(currentStep(s)?.id).toBe("pan");
      let s2 = createSession("s", "en", "mock", NOW);
      for (const t of ["insurance", "30214567891", "yes"]) s2 = handle(s2, { type: "text", text: t }, deps).state;
      expect(currentStep(s2)?.options?.map((o) => o.value)).toEqual(["pmsby"]);
    } finally {
      setConfig(DEFAULT_CONFIG);
    }
    expect(currentConfig().panThreshold).toBe(50000);
  });
});

describe("branch report", () => {
  it("aggregates and exports", () => {
    const r = buildReport([
      { service: "deposit", lang: "kn", status: "completed", kind: "application", urgent: false, needsStaff: false, createdAt: "2026-11-10T05:00:00Z", processedAt: "2026-11-10T05:06:00Z" },
      { service: "deposit", lang: "hi", status: "needs_info", kind: "application", urgent: false, needsStaff: false, createdAt: "2026-11-10T05:10:00Z", processedAt: null },
      { service: "service_request", lang: "kn", status: "waiting", kind: "assist", urgent: false, needsStaff: true, createdAt: "2026-11-10T05:12:00Z", processedAt: null },
    ]);
    expect(r.total).toBe(2);
    expect(r.helpCalls).toBe(1);
    expect(r.needsInfo).toBe(1);
    expect(r.medianMinutes).toBe(6);
    expect(r.byLang).toEqual({ kn: 1, hi: 1 });
    expect(toCsv(["a", "b"], [["x,y", null]])).toBe('a,b\n"x,y",');
  });
});
