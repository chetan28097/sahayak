/** Spoken/typed date parsing → ISO "YYYY-MM-DD". No LLM. */
import { ADULT_AGE } from "./bankRules";
import { asciiDigits, parseNumberPhrases } from "./numbers";
import type { Lang } from "./types";

const MONTHS: Record<string, number> = {};
const MONTH_NAMES: string[][] = [
  ["jan", "january", "janvari", "जनवरी", "ಜನವರಿ"],
  ["feb", "february", "farvari", "फरवरी", "फ़रवरी", "ಫೆಬ್ರವರಿ"],
  ["mar", "march", "मार्च", "ಮಾರ್ಚ್"],
  ["apr", "april", "अप्रैल", "ಏಪ್ರಿಲ್"],
  ["may", "mai", "मई", "ಮೇ"],
  ["jun", "june", "जून", "ಜೂನ್"],
  ["jul", "july", "julai", "जुलाई", "ಜುಲೈ"],
  ["aug", "august", "agast", "अगस्त", "ಆಗಸ್ಟ್"],
  ["sep", "sept", "september", "सितंबर", "सितम्बर", "ಸೆಪ್ಟೆಂಬರ್"],
  ["oct", "october", "aktubar", "अक्टूबर", "ಅಕ್ಟೋಬರ್"],
  ["nov", "november", "नवंबर", "नवम्बर", "ನವೆಂಬರ್"],
  ["dec", "december", "दिसंबर", "दिसम्बर", "ಡಿಸೆಂಬರ್"],
];
MONTH_NAMES.forEach((names, i) => names.forEach((n) => (MONTHS[n] = i + 1)));

function isoIfValid(y: number, m: number, d: number): string | null {
  if (y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseDate(text: string, lang: Lang): string | null {
  const clean = asciiDigits(text).toLowerCase();
  const numeric = clean.match(/(\d{1,2})\s*[-/. ]\s*(\d{1,2})\s*[-/. ]\s*(\d{4})/);
  if (numeric) return isoIfValid(+numeric[3], +numeric[2], +numeric[1]);
  const iso = clean.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return isoIfValid(+iso[1], +iso[2], +iso[3]);

  const tokens = clean.replace(/[,.]/g, " ").split(/\s+/).filter(Boolean);
  const monthIdx = tokens.findIndex((t) => t in MONTHS);
  if (monthIdx < 0) return null;
  const month = MONTHS[tokens[monthIdx]];
  const before = parseNumberPhrases(tokens.slice(0, monthIdx).join(" "), lang);
  const after = parseNumberPhrases(tokens.slice(monthIdx + 1).join(" "), lang);
  const year = [...after, ...before].map((p) => p.value).find((v) => v >= 1900 && v <= 2100);
  const day = [...before, ...after].map((p) => p.value).find((v) => v >= 1 && v <= 31);
  if (!year || !day) return null;
  return isoIfValid(year, month, day);
}

export function ageOn(dobIso: string, today = new Date()): number {
  const [y, m, d] = dobIso.split("-").map(Number);
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

export function isPlausibleDob(dobIso: string, today = new Date()): boolean {
  const age = ageOn(dobIso, today);
  return age >= 0 && age <= 120 && new Date(dobIso) <= today;
}

export function isMinor(dobIso: string | undefined, today = new Date()): boolean {
  return dobIso !== undefined && ageOn(dobIso, today) < ADULT_AGE;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
