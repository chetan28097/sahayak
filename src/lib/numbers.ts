/**
 * Indian spoken-number parsing for Hindi, Kannada and English (incl. Hinglish).
 * Pure functions, no LLM. Handles digits, number words, multipliers
 * (sau/hazaar/lakh/crore, nooru/saavira/laksha/koti) and fractions
 * (dedh, dhai, sava, saade, paune, onduvare).
 */
import type { Lang } from "./types";

type Vocab = Record<string, number>;

const EN_NUM: Vocab = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fourty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const EN_MULT: Vocab = {
  hundred: 100, thousand: 1000, k: 1000, lakh: 1e5, lakhs: 1e5, lac: 1e5, lacs: 1e5,
  crore: 1e7, crores: 1e7,
};

const HI_NUM: Vocab = {
  ek: 1, do: 2, teen: 3, tin: 3, char: 4, chaar: 4, paanch: 5, panch: 5, paach: 5, chhe: 6, chhah: 6,
  che: 6, chah: 6, saat: 7, aath: 8, aat: 8, nau: 9, das: 10, dus: 10, gyarah: 11, gyaarah: 11,
  barah: 12, baarah: 12, bara: 12, baara: 12, terah: 13, chaudah: 14, chodah: 14, pandrah: 15,
  pandra: 15, solah: 16, sola: 16, satrah: 17, atharah: 18, athara: 18, unnis: 19, unnees: 19,
  bees: 20, bis: 20, pachis: 25, pachees: 25, tees: 30, tis: 30, paintis: 35, chalis: 40,
  chaalis: 40, paintalis: 45, pachas: 50, pachaas: 50, pachpan: 55, saath: 60, sattar: 70,
  pachhattar: 75, assi: 80, nabbe: 90,
  एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, छः: 6, छे: 6, सात: 7, आठ: 8, नौ: 9,
  दस: 10, ग्यारह: 11, बारह: 12, तेरह: 13, चौदह: 14, पंद्रह: 15, पन्द्रह: 15, सोलह: 16,
  सत्रह: 17, अठारह: 18, उन्नीस: 19, बीस: 20, पच्चीस: 25, तीस: 30, पैंतीस: 35, चालीस: 40,
  पैंतालीस: 45, पचास: 50, पचपन: 55, साठ: 60, सत्तर: 70, पचहत्तर: 75, अस्सी: 80, नब्बे: 90,
  // fractions that act as whole numbers
  dedh: 1.5, derh: 1.5, डेढ़: 1.5, डेढ: 1.5, dhai: 2.5, dhaai: 2.5, ढाई: 2.5,
};
const HI_MULT: Vocab = {
  sau: 100, सौ: 100, hazaar: 1000, hazar: 1000, hajar: 1000, hajaar: 1000, हज़ार: 1000,
  हजार: 1000, lakh: 1e5, लाख: 1e5, crore: 1e7, karod: 1e7, karor: 1e7, करोड़: 1e7, करोड: 1e7,
};
/** Additive modifiers applied to the next number: sava = +¼, saade = +½, paune = −¼. */
const HI_MOD: Vocab = {
  sava: 0.25, savaa: 0.25, सवा: 0.25, saade: 0.5, sade: 0.5, saadhe: 0.5, sadhe: 0.5,
  साढ़े: 0.5, साढे: 0.5, paune: -0.25, पौने: -0.25,
};

const KN_NUM: Vocab = {
  ondu: 1, ondhu: 1, eradu: 2, yeradu: 2, mooru: 3, muru: 3, naalku: 4, nalku: 4, aidu: 5,
  aidhu: 5, aaru: 6, elu: 7, yelu: 7, entu: 8, yentu: 8, ombattu: 9, ombhattu: 9, hattu: 10,
  hannondu: 11, hanneradu: 12, hadimooru: 13, hadinaalku: 14, hadinaidu: 15, hadinaaru: 16,
  hadinelu: 17, hadinentu: 18, hattombattu: 19, ippattu: 20, ippattaidu: 25, moovattu: 30,
  muvattu: 30, nalavattu: 40, nalvattu: 40, aivattu: 50, aravattu: 60, eppattu: 70,
  embattu: 80, tombattu: 90,
  innooru: 200, munnooru: 300, naanooru: 400, ainooru: 500, aarunooru: 600, elnooru: 700,
  entunooru: 800, ombainooru: 900,
  onduvare: 1.5, ondoovare: 1.5, eraduvare: 2.5, mooruvare: 3.5,
  ಒಂದು: 1, ಎರಡು: 2, ಮೂರು: 3, ನಾಲ್ಕು: 4, ಐದು: 5, ಆರು: 6, ಏಳು: 7, ಎಂಟು: 8, ಒಂಬತ್ತು: 9,
  ಹತ್ತು: 10, ಹನ್ನೊಂದು: 11, ಹನ್ನೆರಡು: 12, ಹದಿಮೂರು: 13, ಹದಿನಾಲ್ಕು: 14, ಹದಿನೈದು: 15,
  ಹದಿನಾರು: 16, ಹದಿನೇಳು: 17, ಹದಿನೆಂಟು: 18, ಹತ್ತೊಂಬತ್ತು: 19, ಇಪ್ಪತ್ತು: 20, ಇಪ್ಪತ್ತೈದು: 25,
  ಮೂವತ್ತು: 30, ನಲವತ್ತು: 40, ಐವತ್ತು: 50, ಅರವತ್ತು: 60, ಎಪ್ಪತ್ತು: 70, ಎಂಬತ್ತು: 80,
  ತೊಂಬತ್ತು: 90, ಇನ್ನೂರು: 200, ಮುನ್ನೂರು: 300, ನಾನೂರು: 400, ಐನೂರು: 500, ಆರುನೂರು: 600,
  ಏಳುನೂರು: 700, ಎಂಟುನೂರು: 800, ಒಂಬೈನೂರು: 900, ಒಂದೂವರೆ: 1.5, ಎರಡೂವರೆ: 2.5,
};
const KN_MULT: Vocab = {
  nooru: 100, nuru: 100, ನೂರು: 100, saavira: 1000, saavirada: 1000, savira: 1000,
  ಸಾವಿರ: 1000, ಸಾವಿರದ: 1000, laksha: 1e5, lakshada: 1e5, ಲಕ್ಷ: 1e5, ಲಕ್ಷದ: 1e5,
  koti: 1e7, ಕೋಟಿ: 1e7,
};

const FILLERS = new Set([
  "and", "aur", "और", "mattu", "ಮತ್ತು", "only", "sirf", "rupees", "rupee", "rupaye", "rupaiye",
  "rupay", "rupaya", "rupaa", "rs", "inr", "रुपये", "रुपए", "रुपया", "ರೂಪಾಯಿ", "ರೂ", "rupayi",
]);

/** In Hindi "do" is also the verb "give" ("500 de do"); treat it as 2 only when it looks numeric. */
const HI_AMBIGUOUS = new Set(["do"]);
const NOTE_WORDS = new Set(["note", "notes", "ke", "ka", "ki", "नोट", "के", "का", "की"]);

function vocabFor(lang: Lang) {
  const num: Vocab = { ...EN_NUM };
  const mult: Vocab = { ...EN_MULT };
  let mod: Vocab = {};
  if (lang === "hi") {
    Object.assign(num, HI_NUM);
    Object.assign(mult, HI_MULT);
    mod = HI_MOD;
  }
  if (lang === "kn") {
    Object.assign(num, KN_NUM);
    Object.assign(mult, KN_MULT);
  }
  return { num, mult, mod };
}

const DEVANAGARI_DIGITS = "०१२३४५६७८९";
const KANNADA_DIGITS = "೦೧೨೩೪೫೬೭೮೯";

export function asciiDigits(text: string): string {
  return text.replace(/[०-९೦-೯]/g, (ch) => {
    const d = DEVANAGARI_DIGITS.indexOf(ch);
    return String(d >= 0 ? d : KANNADA_DIGITS.indexOf(ch));
  });
}

export function normalizeForNumbers(text: string): string {
  return asciiDigits(text)
    .toLowerCase()
    .replace(/₹/g, " ")
    .replace(/\brs\.?/g, " ")
    .replace(/(\d),(?=\d)/g, "$1")
    .replace(/(\d)\s*k\b/g, "$1 k")
    .replace(/(\d)\s*(lakh|lac|crore|hazaar|hazar|sau)\b/g, "$1 $2")
    .replace(/[-–—_/]/g, " ")
    .replace(/[,!?।|;:"'()]/g, " ")
    .replace(/\.(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Tok =
  | { t: "num"; v: number; word: boolean }
  | { t: "mult"; v: number }
  | { t: "mod"; v: number }
  | { t: "filler" }
  | { t: "sep"; raw: string };

function classify(tokens: string[], lang: Lang): Tok[] {
  const { num, mult, mod } = vocabFor(lang);
  return tokens.map((raw, i): Tok => {
    if (/^\d+(\.\d+)?$/.test(raw)) return { t: "num", v: parseFloat(raw), word: false };
    if (FILLERS.has(raw)) return { t: "filler" };
    if (raw in mult) return { t: "mult", v: mult[raw] };
    if (raw in mod) return { t: "mod", v: mod[raw] };
    if (raw in num) {
      if (lang === "hi" && HI_AMBIGUOUS.has(raw)) {
        const next = tokens[i + 1];
        const numericNext =
          next !== undefined && (next in mult || next in num || /^\d/.test(next) || NOTE_WORDS.has(next));
        if (!numericNext && tokens.length > 1) return { t: "sep", raw };
      }
      return { t: "num", v: num[raw], word: true };
    }
    return { t: "sep", raw };
  });
}

export interface NumberPhrase {
  value: number;
  /** Index range in the token list, plus the separator words around it (for hints like "ke"/"of"). */
  start: number;
  end: number;
  before?: string;
  after?: string;
}

/** Split text into maximal number phrases and evaluate each one. */
export function parseNumberPhrases(text: string, lang: Lang): NumberPhrase[] {
  const tokens = normalizeForNumbers(text).split(" ").filter(Boolean);
  const toks = classify(tokens, lang);
  const phrases: NumberPhrase[] = [];

  let total = 0;
  let current = 0;
  let pendingMod: number | null = null;
  let active = false;
  let start = 0;
  let lastWasWordNum = false;
  let lastWasDigit = false;

  const flush = (endIdx: number) => {
    if (!active) return;
    if (pendingMod !== null && current === 0 && total === 0) {
      pendingMod = null;
    }
    const value = Math.round((total + current) * 100) / 100;
    const sepBefore = toks[start - 1];
    const sepAfter = toks[endIdx];
    phrases.push({
      value,
      start,
      end: endIdx,
      before: sepBefore?.t === "sep" ? sepBefore.raw : undefined,
      after: sepAfter?.t === "sep" ? sepAfter.raw : undefined,
    });
    total = 0;
    current = 0;
    pendingMod = null;
    active = false;
    lastWasWordNum = false;
    lastWasDigit = false;
  };

  toks.forEach((tok, i) => {
    if (tok.t === "sep") {
      flush(i);
      return;
    }
    if (tok.t === "filler") return;
    if (tok.t === "mod") {
      if (active && current !== 0) flush(i);
      if (!active) start = i;
      active = true;
      pendingMod = tok.v;
      lastWasWordNum = false;
      lastWasDigit = false;
      return;
    }
    if (tok.t === "num") {
      // Two numbers only compose ("twenty five") when both are words; digit runs are separate phrases.
      const composes = active && tok.word && lastWasWordNum && current % 10 === 0 && tok.v < 10;
      if (active && !composes && (lastWasWordNum || lastWasDigit)) flush(i);
      if (!active) start = i;
      active = true;
      let v = tok.v;
      if (pendingMod !== null) {
        v += pendingMod;
        pendingMod = null;
      }
      current += v;
      lastWasWordNum = tok.word;
      lastWasDigit = !tok.word;
      return;
    }
    // multiplier
    if (!active) start = i;
    active = true;
    let base = current;
    if (base === 0) base = pendingMod !== null ? 1 + pendingMod : 1;
    pendingMod = null;
    if (tok.v === 100) {
      current = base * 100;
    } else {
      total += base * tok.v;
      current = 0;
    }
    lastWasWordNum = false;
    lastWasDigit = false;
  });
  flush(toks.length);
  return phrases;
}

/**
 * Parse a spoken amount in rupees. Returns the LAST number phrase
 * (people correct themselves: "500 nahi, 5000"), rounded to whole rupees.
 */
export function parseIndianAmount(text: string, lang: Lang): number | null {
  const phrases = parseNumberPhrases(text, lang).filter((p) => p.value > 0);
  if (phrases.length === 0) return null;
  return Math.round(phrases[phrases.length - 1].value);
}

const DIGIT_WORDS: Record<Lang, Record<string, string>> = {
  en: {
    zero: "0", oh: "0", o: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
    six: "6", seven: "7", eight: "8", nine: "9",
  },
  hi: {
    shunya: "0", sunya: "0", zero: "0", ek: "1", do: "2", teen: "3", char: "4", chaar: "4",
    paanch: "5", panch: "5", chhe: "6", chhah: "6", saat: "7", aath: "8", nau: "9",
    शून्य: "0", एक: "1", दो: "2", तीन: "3", चार: "4", पांच: "5", पाँच: "5", छह: "6", छः: "6",
    सात: "7", आठ: "8", नौ: "9",
  },
  kn: {
    sonne: "0", sunna: "0", zero: "0", ondu: "1", eradu: "2", mooru: "3", naalku: "4",
    aidu: "5", aaru: "6", elu: "7", entu: "8", ombattu: "9", ಸೊನ್ನೆ: "0", ಒಂದು: "1", ಎರಡು: "2",
    ಮೂರು: "3", ನಾಲ್ಕು: "4", ಐದು: "5", ಆರು: "6", ಏಳು: "7", ಎಂಟು: "8", ಒಂಬತ್ತು: "9",
  },
};

/**
 * Extract a digit string (account/phone numbers): concatenates digit runs and
 * single-digit words, supports "double 5" / "triple 0".
 */
export function extractDigits(text: string, lang: Lang): string {
  const words = { ...DIGIT_WORDS.en, ...DIGIT_WORDS[lang] };
  const tokens = asciiDigits(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\d]+/gu, " ")
    .split(" ")
    .filter(Boolean);
  let out = "";
  let repeat = 1;
  for (const tok of tokens) {
    if (tok === "double") {
      repeat = 2;
      continue;
    }
    if (tok === "triple") {
      repeat = 3;
      continue;
    }
    let digits: string | null = null;
    if (/^\d+$/.test(tok)) digits = tok;
    else if (tok in words) digits = words[tok];
    if (digits !== null) {
      out += repeat > 1 ? digits.charAt(0).repeat(repeat) + digits.slice(1) : digits;
    }
    repeat = 1;
  }
  return out;
}

/** "12345678901" → "1234 5678 901" */
export function groupDigits(digits: string, size = 4): string {
  return digits.replace(new RegExp(`(\\d{${size}})(?=\\d)`, "g"), "$1 ");
}

/** Indian grouping: 1250000 → "12,50,000" */
export function formatINR(n: number): string {
  const [int, dec] = Math.abs(Math.round(n * 100) / 100).toString().split(".");
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return `${n < 0 ? "-" : ""}₹${grouped}${dec ? "." + dec.padEnd(2, "0") : ""}`;
}
