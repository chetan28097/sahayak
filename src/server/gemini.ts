/**
 * Gemini Flash in JSON mode: understanding messy answers and reading card photos.
 * Every response is validated with zod; one retry, then null (callers fall back to rules).
 */
import { z } from "zod";
import type { NluResult } from "@/lib/machine";
import type { CardData, CardKind, Lang } from "@/lib/types";
import { GEMINI_API_KEY, GEMINI_FALLBACK_MODEL, GEMINI_MODEL, geminiAvailable } from "./config";
import { fetchWithRetry } from "./http";

type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

/** Per-model budget: a customer is waiting, so a slow model is skipped, not waited on. */
const MODEL_TIMEOUT_MS = 7000;

/**
 * Try the primary model, then the fallback (Flash-Lite answers when Flash is overloaded),
 * one attempt each. Invalid JSON counts as a failure. Null → the caller uses rules only.
 */
async function generateJson<T>(parts: Part[], schema: z.ZodType<T>, prefer: "fast" | "quality" = "quality"): Promise<T | null> {
  if (!geminiAvailable()) return null;
  // Short understanding tasks go to Flash-Lite first (fast, rarely overloaded); card reading to Flash first.
  const models = [...new Set(prefer === "fast" ? [GEMINI_FALLBACK_MODEL, GEMINI_MODEL] : [GEMINI_MODEL, GEMINI_FALLBACK_MODEL])];
  for (const model of models) {
    try {
      const res = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: { responseMimeType: "application/json", temperature: 0 },
          }),
        },
        { retries: 0, timeoutMs: MODEL_TIMEOUT_MS },
      );
      const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
      const parsed = schema.safeParse(JSON.parse(text));
      if (parsed.success) return parsed.data;
    } catch {
      // 503 / timeout / invalid JSON → next model
    }
  }
  return null;
}

const optionalString = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((v) => (v === null || v === undefined || v === "" ? undefined : String(v)));

const NluSchema = z.object({
  intent: z.enum(["answer", "yes", "no", "correct", "question", "repeat", "skip", "staff", "unclear"]),
  field: optionalString,
  value: optionalString,
});

const LANG_NAMES: Record<Lang, string> = { hi: "Hindi", kn: "Kannada", en: "English (Indian)" };

export interface NluContext {
  lang: Lang;
  question: string;
  stepId: string;
  input: string;
  options: string[];
  confirming: string | null;
  reviewFields: string[];
}

const FORMAT_RULES = `Normalise "value":
- amounts and counts: plain digits (e.g. "12500"); "dedh lakh" → "150000"
- account / phone numbers: digits only
- dates: YYYY-MM-DD
- PAN: 10 uppercase characters, or "no pan"
- notes: "<denomination> ke <count>" pairs, comma separated, e.g. "500 ke 20, 100 ke 25"
- choices: exactly one of the option values
- names / addresses: as spoken, without filler words like "my name is"`;

export async function understand(ctx: NluContext, utterance: string): Promise<NluResult | null> {
  const prompt = `You help a voice assistant fill an Indian bank form for a customer speaking ${LANG_NAMES[ctx.lang]} (Hinglish / mixed language is normal).
Current question (step "${ctx.stepId}", expects ${ctx.input}): "${ctx.question}"
${ctx.options.length ? `Option values: ${ctx.options.join(", ")}` : ""}
${ctx.confirming ? `The assistant just asked the customer to confirm: "${ctx.confirming}"` : ""}
${ctx.reviewFields.length ? `This is the final read-back. Correctable field ids: ${ctx.reviewFields.join(", ")}` : ""}

Customer said: """${utterance.slice(0, 500)}"""

Return JSON {"intent": one of answer|yes|no|correct|question|repeat|skip|staff|unclear, "field"?: field id (only for "correct"), "value"?: string}.
- "answer": they answered the current question → put the normalised answer in value.
- "correct": they want to change a specific earlier field → field + new value if they gave one.
- "question": they asked something back (why / what does this mean).
- "unclear": off-topic, noise, or you are not sure. Never guess numbers.
${FORMAT_RULES}`;
  return generateJson([{ text: prompt }], NluSchema, "fast");
}

const SummarySchema = z.object({ summary: z.string().min(3).max(200) });

/** One-line English summary of a spoken complaint, for the counter queue. */
export async function summarizeComplaint(text: string, lang: Lang): Promise<string | null> {
  const prompt = `A bank customer spoke this complaint in ${LANG_NAMES[lang]}: """${text.slice(0, 600)}"""
Return {"summary": one neutral English sentence (max 20 words) a bank officer can act on. No names, no account numbers.}`;
  const result = await generateJson([{ text: prompt }], SummarySchema, "fast");
  return result?.summary ?? null;
}

const CardSchema = z.object({
  name: optionalString,
  dob: optionalString,
  gender: optionalString,
  address: optionalString,
  aadhaarLast4: optionalString,
  pan: optionalString,
  accountNumber: optionalString,
  readable: z.boolean().optional(),
});

const CARD_PROMPTS: Record<CardKind, string> = {
  aadhaar: `This is a photo of the FRONT of an Indian Aadhaar card. Extract:
{"name": English name as printed, "dob": "YYYY-MM-DD" (if only year is printed, use null), "gender": "male"|"female"|"other", "address": address if visible else null, "aadhaarLast4": ONLY the last 4 digits of the Aadhaar number, "readable": boolean}
PRIVACY: never output the full 12-digit Aadhaar number.`,
  pan: `This is a photo of an Indian PAN card. Extract {"pan": 10-character PAN, "name": name, "dob": "YYYY-MM-DD", "readable": boolean}.`,
  passbook: `This is a photo of the first page of an Indian bank passbook. Extract {"accountNumber": digits only, "name": account holder name, "readable": boolean}.`,
};

export async function readCard(kind: CardKind, base64: string, mimeType: string): Promise<CardData | null> {
  const prompt = `${CARD_PROMPTS[kind]}\nIf the photo is blurry or not the expected card, return {"readable": false}. Use null for anything you cannot read clearly — do not guess.`;
  const result = await generateJson(
    [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }],
    CardSchema,
  );
  if (!result || result.readable === false) return null;
  const data: CardData = {
    name: result.name,
    dob: result.dob,
    gender: result.gender,
    address: result.address,
    aadhaarLast4: result.aadhaarLast4,
    pan: result.pan,
    accountNumber: result.accountNumber?.replace(/\D/g, ""),
  };
  if (data.aadhaarLast4) data.aadhaarLast4 = data.aadhaarLast4.replace(/\D/g, "").slice(-4);
  return data;
}
