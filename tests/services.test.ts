import { describe, expect, it } from "vitest";
import { buildView, createSession, currentStep, handle, markIssued, type MachineDeps, type MachineInput, type SessionState } from "@/lib/machine";
import { matchIntent } from "@/lib/options";
import { apyContribution, eligibleSchemes, isEligible, schemeDebit } from "@/lib/schemes";
import { equalShares } from "@/lib/services/nominees";
import type { Account, Lang } from "@/lib/types";

const ACCOUNTS: Account[] = [
  {
    accountNumber: "30214567891", holder: "Lakshmamma", holderLocal: { kn: "ಲಕ್ಷ್ಮಮ್ಮ" }, branch: "Hosakote",
    dob: "1958-06-02", cardLast4: "4421", balance: 18450.5, schemes: ["pmsby"],
    transactions: [{ date: "2026-11-02", desc: "Cash deposit", amount: 5000 }],
  },
  { accountNumber: "20456789012", holder: "Manjunath Gowda", holderLocal: {}, branch: "Hosakote", dob: "1995-04-12", schemes: [] },
];
const deps: MachineDeps = {
  findAccount: (n) => ACCOUNTS.find((a) => a.accountNumber === n),
  now: () => "2026-11-10T10:00:00.000Z",
};
const start = (lang: Lang = "en") => createSession("s1", lang, "mock", deps.now());
function run(state: SessionState, inputs: (string | MachineInput)[]) {
  let s = state;
  let say = "";
  let done: boolean | undefined;
  for (const input of inputs) {
    const r = handle(s, typeof input === "string" ? { type: "text", text: input } : input, deps);
    s = r.state;
    say = r.say;
    done = r.done;
  }
  return { state: s, say, done };
}
const stepId = (s: SessionState) => currentStep(s)?.id;

describe("intent router", () => {
  it.each([
    ["mera ATM card kho gaya", "service_request", { requestType: "block_card" }],
    ["ನನ್ನ ಕಾರ್ಡ್ ಕಳೆದುಹೋಗಿದೆ", "service_request", { requestType: "block_card" }],
    ["cheque book chahiye", "service_request", { requestType: "cheque_book" }],
    ["passbook entry karni hai", "service_request", { requestType: "passbook" }],
    ["mera balance kitna hai", "service_request", { requestType: "balance" }],
    ["shikayat darj karni hai", "service_request", { requestType: "complaint" }],
    ["jeevan jyoti bima chahiye", "scheme_enroll", { scheme: "pmjjby" }],
    ["accident insurance", "scheme_enroll", { scheme: "pmsby" }],
    ["atal pension", "scheme_enroll", { scheme: "apy" }],
    ["nominee badalna hai", "update_details", { updateWhat: ["nominee"] }],
    ["naya number dena hai", "update_details", { updateWhat: ["mobile"] }],
    ["kyc update", "update_details", { updateWhat: ["rekyc"] }],
    ["paise jama karne hai", "deposit", undefined],
    ["ಹಣ ಜಮಾ ಮಾಡಬೇಕು", "deposit", undefined],
    ["naya khata kholna hai", "account_open", undefined],
    ["ವಿಮೆ ಬೇಕು", "scheme_enroll", undefined],
    ["I want to complain", "service_request", { requestType: "complaint" }],
    ["ATM debited 2000 rupees but no cash came out", "service_request", { requestType: "complaint" }],
    ["open new account", "account_open", undefined],
  ])("%s → %s", (text, service, preset) => {
    const intent = matchIntent(text);
    expect(intent?.service).toBe(service);
    expect(intent?.preset).toEqual(preset);
  });
});

describe("scheme rules", () => {
  it("applies age limits", () => {
    expect(isEligible("pmjjby", 50)).toBe(true);
    expect(isEligible("pmjjby", 51)).toBe(false);
    expect(isEligible("pmsby", 70)).toBe(true);
    expect(isEligible("apy", 41)).toBe(false);
    expect(eligibleSchemes(68, ["pmsby"])).toEqual([]);
    expect(eligibleSchemes(31)).toEqual(["pmjjby", "pmsby", "apy"]);
  });
  it("reads the APY chart and debits", () => {
    expect(apyContribution(18, 1000)).toBe(42);
    expect(apyContribution(40, 5000)).toBe(1454);
    expect(apyContribution(30, 2000)).toBe(231);
    expect(apyContribution(41, 1000)).toBeNull();
    expect(schemeDebit("pmjjby", 30, undefined, new Date("2026-07-01"))).toEqual({ amount: 436, freq: "year" });
    expect(schemeDebit("pmjjby", 30, undefined, new Date("2026-11-10"))).toEqual({ amount: 342, freq: "year" });
    expect(schemeDebit("pmjjby", 30, undefined, new Date("2027-01-10"))).toEqual({ amount: 228, freq: "year" });
    expect(schemeDebit("pmjjby", 30, undefined, new Date("2027-04-10"))).toEqual({ amount: 114, freq: "year" });
    expect(schemeDebit("apy", 30, 2000)).toEqual({ amount: 231, freq: "month" });
  });
  it("splits nominee shares equally to 100", () => {
    expect(equalShares(3)).toEqual([34, 33, 33]);
    expect(equalShares(4)).toEqual([25, 25, 25, 25]);
  });
});

describe("scheme enrolment flow", () => {
  it("routes a deep link, checks age from the account record, offers eligible schemes", () => {
    let r = run(start(), ["atal pension yojana", "30214567891", "yes"]);
    // Lakshmamma is 68: APY (18–40) not allowed, PMSBY already held → nothing left.
    expect(stepId(r.state)).toBe("scheme");
    expect(r.say).toContain("18 to 40");
    r = run(r.state, ["life insurance"]);
    expect(r.say).toContain("18 to 50");
  });

  it("enrols APY with contribution read-back, nominee and consent", () => {
    const r = run(start(), [
      "pension", "20456789012", "yes", "atal pension", "no", "2000", "yes", "no", "Kavya", "yes", "wife", "15-08-1996", "yes", "yes",
    ]);
    expect(r.state.values.scheme).toBe("apy");
    expect(r.state.values.taxPayer).toBe(false);
    expect(r.state.values.pensionSlab).toBe(2000);
    expect(r.state.values.autoDebitConsent).toBe(true);
    expect(stepId(r.state)).toBe("review");
  });

  it("turns away income-tax payers from APY and lets them pick another scheme", () => {
    const r = run(start(), ["atal pension", "20456789012", "yes", "yes"]);
    expect(r.say).toContain("not open to income-tax payers");
    expect(r.state.values.scheme).toBeUndefined();
    expect(stepId(r.state)).toBe("scheme");
    const again = run(r.state, ["atal pension"]);
    expect(again.say).toContain("not open to income-tax payers");
    const pmsby = run(r.state, ["accident insurance"]);
    expect(pmsby.state.values.scheme).toBe("pmsby");
  });

  it("charges the pro-rata PMJJBY premium for November and flags enrolment elsewhere", () => {
    const r = run(start(), ["jeevan jyoti", "20456789012", "yes", "yes", "yes", "Kavya", "yes", "wife", { type: "skip" }]);
    expect(r.state.values.schemeElsewhere).toBe(true);
    expect(stepId(r.state)).toBe("autoDebitConsent");
    const month = new Date().getMonth() + 1;
    if (month >= 9 && month <= 11) expect(r.say).toContain("342");
  });

  it("does not proceed without auto-debit consent", () => {
    const r = run(start(), ["accident insurance", "20456789012", "yes", "no", "Kavya", "yes", "wife", { type: "skip" }, "no"]);
    expect(stepId(r.state)).toBe("autoDebitConsent");
    expect(r.say).toContain("permission");
  });
});

describe("update details flow", () => {
  it("handles several changes from one sentence", () => {
    let r = run(start(), ["update my details", "30214567891", "yes", "mobile aur address"]);
    expect(r.state.values.updateWhat).toEqual(["mobile", "address"]);
    expect(stepId(r.state)).toBe("newMobile");
    r = run(r.state, ["9123456789", "yes", { type: "voiceInstead" }, "22 MG Road, Hosakote 562114", "yes"]);
    expect(r.state.values.newAddress).toContain("MG Road");
    expect(stepId(r.state)).toBe("review");
  });

  it("supports tap multi-select and re-KYC by card", () => {
    let r = run(start(), ["update", "30214567891", "yes", { type: "chooseMany", values: ["rekyc"] }]);
    expect(stepId(r.state)).toBe("rekycPhoto");
    r = run(r.state, [{ type: "card", kind: "aadhaar", data: { name: "Lakshmamma", aadhaarLast4: "7781" } }, "no"]);
    expect(r.state.values.rekycLast4).toBe("7781");
    expect(stepId(r.state)).toBe("review");
  });
});

describe("service requests", () => {
  it("blocks a card quickly", () => {
    let r = run(start(), ["mera atm card kho gaya", "30214567891", "yes"]);
    expect(stepId(r.state)).toBe("cardReason");
    expect(r.say).toContain("4 4 2 1");
    r = run(r.state, ["chori ho gaya", "haan", "yes"]);
    expect(r.state.values.cardReason).toBe("stolen");
    expect(r.state.values.unauthorisedTxn).toBe(true);
    expect(r.say).toContain("Unauthorised transaction: Yes");
    expect(stepId(r.state)).toBe("review");
  });

  it("shows balance on screen only and completes without review", () => {
    let r = run(start(), ["balance", "30214567891", "yes"]);
    expect(stepId(r.state)).toBe("balanceInfo");
    const view = buildView(r.state, deps);
    expect(view.info?.balance).toBe(18450.5);
    expect(r.say).not.toContain("18450");
    r = run(r.state, ["ok"]);
    expect(r.done).toBe(true);
  });

  it("records a complaint with a read-back", () => {
    const r = run(start(), [
      "complaint", "30214567891", "yes", "atm", "5 November 2026", "yes", "2000", "yes", "ATM se paisa kata par mila nahi", "yes",
    ]);
    expect(r.state.values.complaintCategory).toBe("atm_debit");
    expect(r.state.values.complaintDate).toBe("2026-11-05");
    expect(r.state.values.complaintAmount).toBe(2000);
    expect(r.state.values.complaintText).toContain("ATM");
    expect(stepId(r.state)).toBe("review");
  });

  it("cheque book with delivery choice", () => {
    const r = run(start(), ["cheque book", "30214567891", "yes", "25", "ghar bhej do"]);
    expect(r.state.values.chequeLeaves).toBe("25");
    expect(r.state.values.chequeDelivery).toBe("home");
  });
});

describe("one visit, several jobs", () => {
  it("chains a second job and keeps the confirmed account", () => {
    const first = run(start("hi"), ["jama", "30214567891", "haan", "1000", "haan", "500 ke 2 note", "haan", "haan"]);
    expect(first.done).toBe(true);
    const issued = markIssued(first.state, "slip-1", "done", deps);
    expect(buildView(issued.state, deps).phase).toBe("next");
    const second = run(issued.state, ["cheque book bhi chahiye"]);
    expect(second.state.form).toBe("service_request");
    expect(second.state.values.accountNumber).toBe("30214567891");
    expect(second.state.values.amount).toBeUndefined();
    expect(stepId(second.state)).toBe("chequeLeaves");
  });

  it("ends the visit on 'no'", () => {
    const first = run(start(), ["balance", "30214567891", "yes", "ok"]);
    const issued = markIssued(first.state, "slip-1", "done", deps);
    const end = run(issued.state, ["no"]);
    expect(end.state.visitEnded).toBe(true);
    expect(buildView(end.state, deps).phase).toBe("ended");
    expect(buildView(end.state, deps).slipIds).toEqual(["slip-1"]);
  });
});
