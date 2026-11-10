/**
 * Day-1 smoke test: one real Gnani TTS call, one real Gnani STT call (on the TTS audio),
 * and one Gemini call. Logs latency and the raw response shapes so the clients can be
 * adjusted before building on assumptions. Costs ~3 credits.
 *   npm run smoke
 */
import { writeFileSync } from "node:fs";

process.loadEnvFile(".env.local");
const GNANI = process.env.GNANI_API_KEY;
const GEMINI = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function shape(value: unknown, depth = 0): unknown {
  if (Array.isArray(value)) return depth > 2 ? "[…]" : [shape(value[0], depth + 1)];
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, depth > 2 ? typeof v : shape(v, depth + 1)]));
  }
  return typeof value === "string" && value.length > 60 ? `${value.slice(0, 60)}…` : value;
}

async function timed<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  const t0 = performance.now();
  try {
    const out = await fn();
    process.stdout.write(`✓ ${label}: ${Math.round(performance.now() - t0)} ms\n`);
    return out;
  } catch (e) {
    process.stdout.write(`✗ ${label}: ${e instanceof Error ? e.message : String(e)}\n`);
    return null;
  }
}

async function main() {
  if (!GNANI) throw new Error("GNANI_API_KEY missing in .env.local");
  const text = "नमस्ते। आपकी रकम बारह हज़ार पाँच सौ रुपये है।";

  const audio = await timed("Gnani TTS", async () => {
    const res = await fetch("https://api.vachana.ai/api/v1/tts/inference", {
      method: "POST",
      headers: { "X-API-Key-ID": GNANI, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model: "timbre-v3.0",
        voice: "Shivani",
        language: "hi-IN",
        audio_config: { format: "wav", sample_rate: 24000, channels: 1, bit_depth: 16 },
      }),
    });
    process.stdout.write(`  status ${res.status}, content-type ${res.headers.get("content-type")}\n`);
    if (!res.ok) throw new Error(await res.text());
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync("smoke-tts.wav", buf);
    process.stdout.write(`  ${buf.length} bytes → smoke-tts.wav (header: ${buf.subarray(0, 4).toString()})\n`);
    return buf;
  });

  if (audio) {
    await timed("Gnani STT", async () => {
      const form = new FormData();
      form.append("audio_file", new Blob([new Uint8Array(audio)], { type: "audio/wav" }), "smoke.wav");
      form.append("model", "prisma-v3.0");
      form.append("language_code", "hi-IN");
      form.append("format", "transcribe");
      const res = await fetch("https://api.vachana.ai/stt/v3", {
        method: "POST",
        headers: { "X-API-Key-ID": GNANI },
        body: form,
      });
      const json: unknown = await res.json().catch(async () => res.text());
      process.stdout.write(`  status ${res.status}\n  shape: ${JSON.stringify(shape(json), null, 2)}\n`);
    });
  }

  if (GEMINI) {
    await timed(`Gemini ${MODEL}`, async () => {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: 'Return {"amount": number} for: "dedh lakh rupaye"' }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0, thinkingConfig: { thinkingBudget: 0 } },
        }),
      });
      const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      process.stdout.write(`  status ${res.status}: ${json.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(json)}\n`);
    });
  } else {
    process.stdout.write("- Gemini skipped (no GEMINI_API_KEY)\n");
  }
  process.stdout.write("\nNow check credit usage on app.gnani.ai to see how these calls were counted.\n");
}

main().catch((e) => {
  process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});
