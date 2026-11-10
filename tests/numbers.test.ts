import { describe, expect, it } from "vitest";
import { extractDigits, formatINR, groupDigits, parseIndianAmount } from "@/lib/numbers";
import { amountInWords, numberToIndianWords } from "@/lib/amountWords";
import type { Lang } from "@/lib/types";

const cases: [Lang, string, number][] = [
  // digits & formatting
  ["en", "12500", 12500],
  ["en", "12,500", 12500],
  ["en", "₹12,500", 12500],
  ["en", "Rs. 500", 500],
  ["en", "1,50,000 rupees", 150000],
  ["en", "12k", 12000],
  ["en", "1.5 lakh", 150000],
  ["hi", "१२५००", 12500],
  ["kn", "೧೨೫೦೦", 12500],
  // English words
  ["en", "twelve thousand five hundred", 12500],
  ["en", "twelve thousand, five hundred", 12500],
  ["en", "one lakh fifty thousand", 150000],
  ["en", "twenty five thousand", 25000],
  ["en", "two crore", 20000000],
  ["en", "ninety nine", 99],
  ["en", "five hundred rupees only", 500],
  // Hindi romanised
  ["hi", "baara hazaar paanch sau", 12500],
  ["hi", "dedh lakh", 150000],
  ["hi", "dhai hazaar", 2500],
  ["hi", "sava lakh", 125000],
  ["hi", "sava do lakh", 225000],
  ["hi", "saade teen hazaar", 3500],
  ["hi", "paune do lakh", 175000],
  ["hi", "dedh sau", 150],
  ["hi", "do sau pachaas", 250],
  ["hi", "ek lakh bees hazaar", 120000],
  ["hi", "das hazaar", 10000],
  ["hi", "pachaas hazaar", 50000],
  ["hi", "12 hazaar 500", 12500],
  ["hi", "1 lakh 50 hazaar", 150000],
  ["hi", "mujhe 12500 jama karna hai", 12500],
  ["hi", "500 de do", 500],
  ["hi", "500 nahi, 5000", 5000],
  // Hinglish
  ["hi", "twelve thousand paanch sau", 12500],
  ["hi", "do lakh rupaye", 200000],
  // Hindi Devanagari
  ["hi", "बारह हज़ार पाँच सौ", 12500],
  ["hi", "डेढ़ लाख", 150000],
  ["hi", "ढाई हजार", 2500],
  ["hi", "सवा लाख रुपये", 125000],
  ["hi", "साढ़े तीन हज़ार", 3500],
  ["hi", "पचास हज़ार", 50000],
  // Kannada romanised and script
  ["kn", "hanneradu saavirada ainooru", 12500],
  ["kn", "ondu laksha", 100000],
  ["kn", "onduvare laksha", 150000],
  ["kn", "ಹನ್ನೆರಡು ಸಾವಿರದ ಐನೂರು", 12500],
  ["kn", "ಐವತ್ತು ಸಾವಿರ", 50000],
  ["kn", "ಎರಡು ಲಕ್ಷ", 200000],
  ["kn", "ಒಂದೂವರೆ ಲಕ್ಷ", 150000],
  ["kn", "ಹತ್ತು ಸಾವಿರ ರೂಪಾಯಿ", 10000],
  ["kn", "ಇನ್ನೂರು", 200],
];

describe("parseIndianAmount", () => {
  it.each(cases)("[%s] %s → %d", (lang, text, expected) => {
    expect(parseIndianAmount(text, lang)).toBe(expected);
  });

  it("returns null when there is no number", () => {
    expect(parseIndianAmount("pata nahi", "hi")).toBeNull();
    expect(parseIndianAmount("", "en")).toBeNull();
  });

  it("does not read Hindi 'do' (give) as 2", () => {
    expect(parseIndianAmount("jama kar do", "hi")).toBeNull();
  });
});

describe("extractDigits", () => {
  it("reads digit runs and spaced digits", () => {
    expect(extractDigits("3021 4567 891", "en")).toBe("30214567891");
  });
  it("reads digit words in each language", () => {
    expect(extractDigits("four five two one", "en")).toBe("4521");
    expect(extractDigits("ek do teen", "hi")).toBe("123");
    expect(extractDigits("ಒಂದು ಎರಡು ಮೂರು", "kn")).toBe("123");
  });
  it("supports double and triple", () => {
    expect(extractDigits("double five triple zero", "en")).toBe("55000");
  });
});

describe("formatting", () => {
  it("formats INR with Indian grouping", () => {
    expect(formatINR(1250000)).toBe("₹12,50,000");
    expect(formatINR(500)).toBe("₹500");
  });
  it("groups digits in fours", () => {
    expect(groupDigits("30214567891")).toBe("3021 4567 891");
  });
});

describe("amountInWords", () => {
  it.each([
    [12500, "Twelve Thousand Five Hundred"],
    [150000, "One Lakh Fifty Thousand"],
    [10000001, "One Crore One"],
    [99, "Ninety Nine"],
    [100, "One Hundred"],
    [0, "Zero"],
  ])("%d → %s", (n, words) => {
    expect(numberToIndianWords(n)).toBe(words);
  });
  it("wraps in Rupees … Only", () => {
    expect(amountInWords(500)).toBe("Rupees Five Hundred Only");
  });
  it("rejects negative input", () => {
    expect(() => numberToIndianWords(-1)).toThrow();
  });
});
