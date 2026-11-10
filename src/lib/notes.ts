/** Cash note breakdown: parsing ("500 ke 20 note, 100 ke 25") and the total check. */
import { NOTE_DENOMS, NOTE_KEYS } from "./bankRules";
import { parseNumberPhrases, type NumberPhrase } from "./numbers";
import type { Lang, NoteBreakdown, NoteKey } from "./types";

const DENOM_SET = new Set<number>(NOTE_DENOMS);

/** Words that mean "the denomination comes first": "500 ke 20", "500 ರ 20". */
const DENOM_FIRST = new Set(["ke", "ka", "ki", "wale", "vaale", "के", "का", "की", "वाले", "ra", "da", "ರ", "ದ", "ರೂಪಾಯಿಯ"]);
/** Words that mean "the count comes first": "20 notes of 500", "20 x 500". */
const COUNT_FIRST = new Set(["of", "notes", "note", "नोट", "ನೋಟು", "notu"]);

export function noteTotal(b: NoteBreakdown | undefined): number {
  if (!b) return 0;
  return NOTE_KEYS.reduce((sum, key) => {
    const v = b[key] ?? 0;
    return sum + (key === "coins" ? v : Number(key) * v);
  }, 0);
}

export function notesMatch(b: NoteBreakdown | undefined, amount: number | undefined): boolean {
  return amount !== undefined && b !== undefined && noteTotal(b) === amount;
}

function pairToNote(a: NumberPhrase, b: NumberPhrase): [NoteKey, number] | null {
  const aIsDenom = DENOM_SET.has(a.value);
  const bIsDenom = DENOM_SET.has(b.value);
  if (!Number.isInteger(a.value) || !Number.isInteger(b.value)) return null;
  if (aIsDenom && !bIsDenom) return [String(a.value) as NoteKey, b.value];
  if (bIsDenom && !aIsDenom) return [String(b.value) as NoteKey, a.value];
  if (!aIsDenom && !bIsDenom) return null;
  // Both look like denominations (e.g. "500 ke 20"): use the joining word, else the larger is the note.
  if (a.after && DENOM_FIRST.has(a.after)) return [String(a.value) as NoteKey, b.value];
  if (a.after && COUNT_FIRST.has(a.after)) return [String(b.value) as NoteKey, a.value];
  return a.value >= b.value ? [String(a.value) as NoteKey, b.value] : [String(b.value) as NoteKey, a.value];
}

/**
 * Parse a spoken breakdown. Phrases are paired in order (denomination + count).
 * Returns null when the utterance can't be paired cleanly.
 */
export function parseNoteBreakdown(text: string, lang: Lang): NoteBreakdown | null {
  const phrases = parseNumberPhrases(text, lang).filter((p) => p.value > 0);
  if (phrases.length < 2 || phrases.length % 2 !== 0) return null;
  const out: NoteBreakdown = {};
  for (let i = 0; i < phrases.length; i += 2) {
    const pair = pairToNote(phrases[i], phrases[i + 1]);
    if (!pair) return null;
    const [key, count] = pair;
    out[key] = (out[key] ?? 0) + count;
  }
  return out;
}

/** Later answers override the counts they mention and keep the rest. */
export function mergeNotes(base: NoteBreakdown | undefined, update: NoteBreakdown): NoteBreakdown {
  return { ...(base ?? {}), ...update };
}

export function describeNotes(b: NoteBreakdown): string {
  return NOTE_KEYS.filter((k) => (b[k] ?? 0) > 0)
    .map((k) => (k === "coins" ? `coins ₹${b[k]}` : `₹${k} × ${b[k]}`))
    .join(", ");
}
