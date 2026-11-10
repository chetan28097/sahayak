import { describe, expect, it } from "vitest";
import { mergeNotes, noteTotal, notesMatch, parseNoteBreakdown } from "@/lib/notes";
import { ageOn, isMinor, parseDate } from "@/lib/dates";
import { detectFieldMention, detectGlobal, detectYesNo, isQuestion, saysNoPan } from "@/lib/intents";
import { incomeBucket, matchOption, RELATION_OPTIONS, TASK_OPTIONS } from "@/lib/options";
import { IFSC_REGEX, PAN_REGEX, BANK } from "@/lib/bankRules";

describe("note breakdown", () => {
  it("parses Hindi 'denomination ke count'", () => {
    expect(parseNoteBreakdown("500 के 20 नोट और 100 के 25 नोट", "hi")).toEqual({ "500": 20, "100": 25 });
  });
  it("parses Kannada 'ರ' joiner", () => {
    expect(parseNoteBreakdown("500 ರ 20 ನೋಟು, 100 ರ 20 ನೋಟು", "kn")).toEqual({ "500": 20, "100": 20 });
  });
  it("parses English 'count notes of denomination'", () => {
    expect(parseNoteBreakdown("20 notes of 500 and 25 notes of 100", "en")).toEqual({ "500": 20, "100": 25 });
  });
  it("parses number words", () => {
    expect(parseNoteBreakdown("paanch sau ke bees note", "hi")).toEqual({ "500": 20 });
  });
  it("rejects unpaired input", () => {
    expect(parseNoteBreakdown("500", "en")).toBeNull();
    expect(parseNoteBreakdown("3 of 7", "en")).toBeNull();
  });
  it("totals and checks against the amount", () => {
    const notes = { "500": 20, "100": 20 };
    expect(noteTotal(notes)).toBe(12000);
    expect(notesMatch(notes, 12500)).toBe(false);
    const fixed = mergeNotes(notes, { "100": 25 });
    expect(noteTotal(fixed)).toBe(12500);
    expect(notesMatch(fixed, 12500)).toBe(true);
  });
  it("counts coins as rupees", () => {
    expect(noteTotal({ "10": 2, coins: 7 })).toBe(27);
  });
});

describe("dates", () => {
  it("parses numeric dates", () => {
    expect(parseDate("15-08-1990", "en")).toBe("1990-08-15");
    expect(parseDate("15/8/1990", "en")).toBe("1990-08-15");
  });
  it("parses month names in all languages", () => {
    expect(parseDate("15 August 1990", "en")).toBe("1990-08-15");
    expect(parseDate("15 अगस्त 1990", "hi")).toBe("1990-08-15");
    expect(parseDate("15 ಆಗಸ್ಟ್ 1990", "kn")).toBe("1990-08-15");
  });
  it("rejects impossible dates", () => {
    expect(parseDate("31-02-1990", "en")).toBeNull();
    expect(parseDate("sometime", "en")).toBeNull();
  });
  it("computes age and minors", () => {
    const today = new Date("2026-11-10");
    expect(ageOn("2000-11-11", today)).toBe(25);
    expect(isMinor("2015-01-01", today)).toBe(true);
    expect(isMinor("1990-01-01", today)).toBe(false);
  });
});

describe("intents", () => {
  it("detects yes/no in three languages", () => {
    expect(detectYesNo("haan ji")).toBe("yes");
    expect(detectYesNo("ಹೌದು")).toBe("yes");
    expect(detectYesNo("नहीं")).toBe("no");
    expect(detectYesNo("sahi nahi hai")).toBe("no");
    expect(detectYesNo("ಸರಿ ಇಲ್ಲ")).toBe("no");
    expect(detectYesNo("12500")).toBeNull();
  });
  it("treats 'pata nahi' as unknown, not no", () => {
    expect(detectGlobal("pata nahi")).toBe("unknown");
    expect(detectGlobal("ಗೊತ್ತಿಲ್ಲ")).toBe("unknown");
    expect(detectGlobal("phir se boliye")).toBe("repeat");
  });
  it("spots questions", () => {
    expect(isQuestion("yeh kyon chahiye")).toBe(true);
    expect(isQuestion("why?")).toBe(true);
    expect(isQuestion("12500")).toBe(false);
  });
  it("spots field corrections", () => {
    expect(detectFieldMention("amount galat hai, 12000", ["amount", "notes"])).toBe("amount");
    expect(detectFieldMention("ಮೊತ್ತ ತಪ್ಪು", ["amount"])).toBe("amount");
    expect(detectFieldMention("nominee ka naam galat", ["name", "nominee1Name"])).toBe("nominee1Name");
    expect(detectFieldMention("naam galat hai", ["depositorName"])).toBe("depositorName");
  });
  it("detects no-PAN", () => {
    expect(saysNoPan("pan nahi hai")).toBe(true);
    expect(saysNoPan("ABCDE1234F")).toBe(false);
  });
});

describe("options", () => {
  it("matches tasks and relations by synonyms", () => {
    expect(matchOption("mujhe paise jama karne hai", TASK_OPTIONS)?.value).toBe("deposit");
    expect(matchOption("ಹೊಸ ಖಾತೆ ತೆರೆಯಬೇಕು", TASK_OPTIONS)?.value).toBe("account_open");
    expect(matchOption("mera beta", RELATION_OPTIONS)?.value).toBe("son");
    expect(matchOption("ಮಗಳು", RELATION_OPTIONS)?.value).toBe("daughter");
  });
  it("buckets income", () => {
    expect(incomeBucket(80000)).toBe("lt1");
    expect(incomeBucket(300000)).toBe("1to5");
    expect(incomeBucket(1500000)).toBe("gt10");
  });
});

describe("bank rules", () => {
  it("validates IFSC and PAN formats", () => {
    expect(IFSC_REGEX.test(BANK.ifsc)).toBe(true);
    expect(PAN_REGEX.test("ABCPL1234K")).toBe(true);
    expect(PAN_REGEX.test("ABC1234")).toBe(false);
  });
});
