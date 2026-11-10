import { describe, expect, it } from "vitest";
import {
  buildView, createSession, currentStep, handle, handleNlu, type MachineDeps, type MachineInput, type SessionState,
} from "@/lib/machine";
import type { Account, Lang } from "@/lib/types";

const ACCOUNTS: Account[] = [
  { accountNumber: "30214567891", holder: "Lakshmamma", holderLocal: { kn: "ಲಕ್ಷ್ಮಮ್ಮ", hi: "लक्ष्मम्मा" }, branch: "Hosakote" },
];
const deps: MachineDeps = {
  findAccount: (n) => ACCOUNTS.find((a) => a.accountNumber === n),
  now: () => "2026-11-10T10:00:00.000Z",
};

function start(lang: Lang = "en"): SessionState {
  return createSession("s1", lang, "mock", deps.now());
}

/** Feed a list of inputs (strings are spoken text) and return the final result. */
function run(state: SessionState, inputs: (string | MachineInput)[]) {
  let s = state;
  let last = { state: s, say: "", done: false as boolean | undefined, unclear: false as boolean | undefined };
  for (const input of inputs) {
    const r = handle(s, typeof input === "string" ? { type: "text", text: input } : input, deps);
    s = r.state;
    last = { state: s, say: r.say, done: r.done, unclear: r.unclear };
  }
  return last;
}

const stepId = (s: SessionState) => currentStep(s)?.id;

describe("deposit flow", () => {
  it("completes the happy path with one combined account+name confirmation", () => {
    let r = run(start(), ["I want to deposit cash"]);
    expect(stepId(r.state)).toBe("accountNumber");
    r = run(r.state, ["3021 4567 891"]);
    expect(r.state.pending?.stepId).toBe("accountNumber");
    expect(r.say).toContain("Lakshmamma");
    expect(r.say).toContain("8 9 1");
    r = run(r.state, ["yes", "twelve thousand five hundred", "yes"]);
    expect(stepId(r.state)).toBe("notes");
    r = run(r.state, ["25 notes of 500"]);
    expect(r.say).toContain("match");
    expect(stepId(r.state)).toBe("selfDeposit");
    r = run(r.state, ["yes"]);
    expect(stepId(r.state)).toBe("review");
    expect(r.say).toContain("Lakshmamma");
    r = run(r.state, ["yes"]);
    expect(r.done).toBe(true);
    expect(r.state.values.reviewConfirmedAt).toBe(deps.now());
  });

  it("catches a note mismatch, speaks the gap, and merges a partial fix", () => {
    const base = run(start("kn"), ["ಹಣ ಜಮಾ", "30214567891", "ಹೌದು", "12500", "ಹೌದು"]).state;
    let r = run(base, ["500 ರ 20 ನೋಟು, 100 ರ 20 ನೋಟು"]);
    expect(stepId(r.state)).toBe("notes");
    expect(r.say).toContain("12000");
    expect(r.say).toContain("500");
    r = run(r.state, ["100 ರ 25 ನೋಟು"]);
    expect(r.state.values.notes).toEqual({ "500": 20, "100": 25 });
    expect(stepId(r.state)).toBe("selfDeposit");
  });

  it("rejects wrong-length and unknown account numbers", () => {
    let r = run(start(), ["deposit", "1234"]);
    expect(r.say).toContain("11 digits");
    r = run(r.state, ["99999999999"]);
    expect(r.say).toContain("couldn't find");
    expect(buildView(r.state, deps).escape).toBe(true);
  });

  it("accepts a different number instead of 'no' at confirmation", () => {
    let r = run(start(), ["deposit", "30214567891", "yes", "5000"]);
    expect(r.state.pending?.patch.amount).toBe(5000);
    r = run(r.state, ["no, 50000"]);
    expect(r.state.pending?.patch.amount).toBe(50000);
  });

  it("asks for PAN at ₹50,000+ and accepts Form 60", () => {
    let r = run(start(), ["deposit", "30214567891", "yes", "50000", "yes", "100 notes of 500"]);
    expect(stepId(r.state)).toBe("pan");
    r = run(r.state, ["I don't have PAN"]);
    expect(r.state.values.form60).toBe(true);
    expect(stepId(r.state)).toBe("selfDeposit");
  });

  it("collects depositor details when someone else deposits", () => {
    const r = run(start(), [
      "deposit", "30214567891", "yes", "1000", "yes", "2 notes of 500", "no",
      "my name is ravi kumar", "yes", "98450 12345", "yes",
    ]);
    expect(r.state.values.depositorName).toBe("Ravi Kumar");
    expect(r.state.values.depositorPhone).toBe("9845012345");
    expect(stepId(r.state)).toBe("review");
  });

  it("applies a voice correction at review and re-checks dependent notes only", () => {
    const atReview = run(start("hi"), [
      "jama", "30214567891", "haan", "12500", "haan", "500 ke 25 note", "haan",
    ]).state;
    expect(stepId(atReview)).toBe("review");
    const r = run(atReview, ["amount galat hai, 12000"]);
    expect(r.state.values.amount).toBe(12000);
    expect(r.state.values.accountNumber).toBe("30214567891");
    expect(r.state.values.selfDeposit).toBe(true);
    expect(stepId(r.state)).toBe("notes");
    const fixed = run(r.state, ["500 ke 24 note"]);
    expect(stepId(fixed.state)).toBe("review");
  });

  it("supports tap-to-edit and the visual note counter", () => {
    const atReview = run(start(), ["deposit", "30214567891", "yes", "1000", "yes", "2 notes of 500", "yes"]).state;
    let r = run(atReview, [{ type: "edit", stepId: "amount" }]);
    expect(stepId(r.state)).toBe("amount");
    r = run(r.state, ["1500", "yes"]);
    expect(stepId(r.state)).toBe("notes");
    r = run(r.state, [{ type: "notes", notes: { "500": 3 } }]);
    expect(stepId(r.state)).toBe("review");
  });

  it("refuses to skip required fields and offers escape", () => {
    const r = run(start(), ["deposit", { type: "skip" }]);
    expect(stepId(r.state)).toBe("accountNumber");
    expect(buildView(r.state, deps).escape).toBe(true);
  });

  it("answers a question with help and repeats the question", () => {
    const r = run(start("hi"), ["jama", "yeh kyon chahiye?"]);
    expect(r.unclear).toBeFalsy();
    expect(r.say).toContain("पासबुक");
  });

  it("marks unparseable answers as unclear for the LLM fallback", () => {
    const r = run(start(), ["deposit", "the one my son opened"]);
    expect(r.unclear).toBe(true);
  });
});

describe("LLM fallback", () => {
  it("uses a structured answer and still validates it with rules", () => {
    const s = run(start(), ["deposit", "30214567891", "yes"]).state;
    const ok = handleNlu(s, { intent: "answer", value: "12500" }, deps);
    expect(ok?.state.pending?.patch.amount).toBe(12500);
    const bad = handleNlu(s, { intent: "answer", value: "lots" }, deps);
    expect(bad).toBeNull();
  });
  it("applies a structured correction", () => {
    const atReview = run(start(), ["deposit", "30214567891", "yes", "1000", "yes", "2 notes of 500", "yes"]).state;
    const r = handleNlu(atReview, { intent: "correct", field: "amount", value: "1500" }, deps);
    expect(r?.state.values.amount).toBe(1500);
  });
});

describe("account opening flow", () => {
  const card = {
    type: "card" as const,
    kind: "aadhaar" as const,
    data: { name: "Lakshmi Narayan", dob: "1962-03-14", gender: "Female", address: "12 Temple Street, Hosakote 562114", aadhaarLast4: "4821" },
  };

  it("prefills from Aadhaar, reads back, and skips the voice identity questions", () => {
    let r = run(start(), ["open new account", "no", card]);
    expect(stepId(r.state)).toBe("identityConfirm");
    expect(r.say).toContain("Lakshmi Narayan");
    expect(r.say).toContain("XXXX");
    r = run(r.state, ["name is wrong, Lakshmi Devi"]);
    expect(r.state.values.name).toBe("Lakshmi Devi");
    expect(stepId(r.state)).toBe("identityConfirm");
    r = run(r.state, ["yes"]);
    expect(stepId(r.state)).toBe("livesAtAadhaarAddress");
    r = run(r.state, ["no", "4th Cross, Gandhi Nagar, Hosakote 562114", "yes"]);
    expect(r.state.values.currentAddress).toContain("Gandhi Nagar");
    expect(stepId(r.state)).toBe("fatherOrSpouse");
  });

  it("falls back to voice questions when the photo is skipped", () => {
    const r = run(start(), ["open new account", "no", { type: "voiceInstead" }]);
    expect(stepId(r.state)).toBe("name");
  });

  const upToNominee: (string | MachineInput)[] = [
    "open new account", "no", card, "yes", "yes", "Narayanappa", "yes", "Gowramma", "yes", { type: "noPan" },
    "9845012345", "yes", "I am a farmer", "10 thousand a month", "yes", "yes",
  ];

  const afterDecl: (string | MachineInput)[] = ["jan dhan", "ATM card and SMS alerts", "yes"];

  it("completes CKYC + facilities + nominee with a minor guardian and income from a monthly figure", () => {
    const r = run(start(), [...upToNominee, ...afterDecl, "Suresh", "yes", "my son", "1-1-2015", "yes", "Ramesh", "yes", "no"]);
    expect(r.state.values.facilities).toEqual(["atm_card", "sms"]);
    expect(r.state.values.accountType).toBe("jandhan");
    expect(r.state.values.fatherOrSpouse).toBe("Narayanappa");
    expect(r.state.values.motherName).toBe("Gowramma");
    expect(r.state.values.form60).toBe(true);
    expect(r.state.values.occupation).toBe("farmer");
    expect(r.state.values.income).toBe("1to5");
    expect(r.state.values.marital).toBe("married");
    expect(r.state.values.declarationOk).toBe(true);
    expect(r.state.values.nominees?.[0]).toMatchObject({ name: "Suresh", relation: "son", guardian: "Ramesh" });
    expect(stepId(r.state)).toBe("review");
    const done = run(r.state, ["yes"]);
    expect(done.done).toBe(true);
  });

  it("supports several nominees with shares (DA-1, 2025 rules)", () => {
    let r = run(start(), [...upToNominee, ...afterDecl, "Suresh", "yes", "son", { type: "skip" }, "yes", "Kavya", "yes", "daughter", { type: "skip" }, "no"]);
    expect(stepId(r.state)).toBe("nomineeShares");
    r = run(r.state, ["60 and 50"]);
    expect(r.say).toContain("100");
    r = run(r.state, ["60 aur 40"]);
    expect(r.state.values.nominees?.map((n) => n.share)).toEqual([60, 40]);
    expect(stepId(r.state)).toBe("review");
  });

  it("allows declining nomination (opt-out recorded)", () => {
    const r = run(start(), [...upToNominee, "savings", "none", "no"]);
    expect(r.state.values.wantsNominee).toBe(false);
    expect(r.state.values.facilities).toEqual(["none"]);
    expect(stepId(r.state)).toBe("review");
  });

  it("splits equally and flags a declaration 'no' for staff", () => {
    const r = run(start(), [
      ...upToNominee.slice(0, -1), "no", ...afterDecl, "Suresh", "yes", "son", { type: "skip" }, "yes",
      "Kavya", "yes", "daughter", { type: "skip" }, "yes", "Anil", "yes", "brother", { type: "skip" }, "no", "equally",
    ]);
    expect(r.state.values.declarationOk).toBe(false);
    expect(r.state.values.nominees?.map((n) => n.share)).toEqual([34, 33, 33]);
  });
});

describe("view model", () => {
  it("exposes task options before a form is chosen", () => {
    const v = buildView(start("kn"), deps);
    expect(v.phase).toBe("task");
    expect(v.step?.options.map((o) => o.value)).toEqual([
      "deposit", "account_open", "scheme_enroll", "update_details", "service_request",
    ]);
  });
  it("shows the pending confirmation row", () => {
    const s = run(start(), ["deposit", "30214567891"]).state;
    const v = buildView(s, deps);
    expect(v.phase).toBe("confirm");
    expect(v.confirm?.row?.value).toContain("3021 4567 891");
  });
});
