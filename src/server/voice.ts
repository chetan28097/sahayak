/** Gnani Vachana STT + TTS clients. TTS results are cached on disk to save credits. */
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { LANG_CODES, type Lang } from "@/lib/types";
import { GNANI_API_KEY, GNANI_STT_URL, GNANI_TTS_URL, liveVoiceAvailable } from "./config";
import { fetchWithRetry } from "./http";

const TTS_CACHE = path.join(process.cwd(), "data", "tts-cache");

/** Wrap raw little-endian 16-bit mono PCM in a 44-byte WAV header. */
export function pcm16ToWav(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "latin1");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "latin1");
  header.write("fmt ", 12, "latin1");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "latin1");
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** Response shape is confirmed by scripts/smoke.ts; accept the common variants. */
export function pickTranscript(json: unknown): string | null {
  if (typeof json === "string") return json;
  if (!json || typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;
  for (const key of ["transcript", "text", "transcription"]) {
    if (typeof obj[key] === "string") return obj[key] as string;
  }
  for (const key of ["data", "result", "results", "output"]) {
    const nested = obj[key];
    const inner = Array.isArray(nested) ? nested[0] : nested;
    const found = pickTranscript(inner);
    if (found !== null) return found;
  }
  return null;
}

export async function transcribe(wav: Blob, lang: Lang): Promise<string> {
  if (!liveVoiceAvailable()) throw new Error("live STT not available (MOCK_MODE or missing GNANI_API_KEY)");
  const form = new FormData();
  form.append("audio_file", wav, "audio.wav");
  form.append("model", "prisma-v3.0");
  form.append("language_code", LANG_CODES[lang]); // locked language, never auto-detect
  form.append("format", "transcribe"); // spoken numbers come back as digits
  const res = await fetchWithRetry(GNANI_STT_URL, {
    method: "POST",
    headers: { "X-API-Key-ID": GNANI_API_KEY },
    body: form,
  });
  const transcript = pickTranscript(await res.json());
  if (transcript === null) throw new Error("STT response had no transcript field");
  return transcript.trim();
}

function cachePath(text: string, lang: Lang): string {
  const hash = createHash("sha256").update(`${lang}|timbre-v3.0|Shivani|${text}`).digest("hex").slice(0, 32);
  return path.join(TTS_CACHE, lang, `${hash}.wav`);
}

export async function cachedSpeech(text: string, lang: Lang): Promise<Buffer | null> {
  try {
    return await fs.readFile(cachePath(text, lang));
  } catch {
    return null;
  }
}

/** Cached audio if present, else a live Gnani call (when allowed). Null → client uses browser TTS. */
export async function synthesize(text: string, lang: Lang, allowLive: boolean): Promise<Buffer | null> {
  const cached = await cachedSpeech(text, lang);
  if (cached) return cached;
  if (!allowLive || !liveVoiceAvailable()) return null;
  const res = await fetchWithRetry(GNANI_TTS_URL, {
    method: "POST",
    headers: { "X-API-Key-ID": GNANI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model: "timbre-v3.0",
      voice: "Shivani",
      language: LANG_CODES[lang],
      audio_config: { format: "wav", sample_rate: 24000, channels: 1, bit_depth: 16 },
    }),
  });
  const raw = Buffer.from(await res.arrayBuffer());
  if (raw.length < 100) throw new Error("TTS returned an empty body");
  // Gnani returns headerless 16-bit mono PCM at the requested 24 kHz; browsers need a WAV container.
  const audio = raw.subarray(0, 4).toString("latin1") === "RIFF" ? raw : pcm16ToWav(raw, 24000);
  const file = cachePath(text, lang);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, audio);
  return audio;
}
