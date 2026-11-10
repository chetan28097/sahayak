/** Server configuration from environment. Secrets never live in code. */

/** MOCK_MODE defaults to ON: no external API calls unless explicitly set to "false". */
export const MOCK_FORCED = process.env.MOCK_MODE !== "false";

export const GNANI_API_KEY = process.env.GNANI_API_KEY ?? "";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
/** Used when the primary model is overloaded (503) or slow. */
export const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-3.5-flash-lite";

export const GNANI_STT_URL = "https://api.vachana.ai/stt/v3";
export const GNANI_TTS_URL = "https://api.vachana.ai/api/v1/tts/inference";

export function liveVoiceAvailable(): boolean {
  return !MOCK_FORCED && GNANI_API_KEY.length > 0;
}

export function geminiAvailable(): boolean {
  return !MOCK_FORCED && GEMINI_API_KEY.length > 0;
}

export function signingSecret(): string {
  const secret = process.env.SLIP_SIGNING_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SLIP_SIGNING_SECRET is missing or shorter than 16 characters (see .env.example)");
  }
  return secret;
}

export const LIMITS = {
  audioBytes: 1_200_000, // ~30 s of 16 kHz mono 16-bit WAV
  imageBytes: 6_000_000,
  ttsChars: 1200,
  textChars: 500,
} as const;
