import { z } from "zod";
import { LIMITS } from "@/server/config";
import { getSession } from "@/server/store";
import { synthesize } from "@/server/voice";

const Body = z.object({
  text: z.string().min(1).max(LIMITS.ttsChars),
  sessionId: z.string().max(64),
});

/**
 * 200 + WAV when cached or live; 204 tells the client to use browser speech instead.
 * Live (credit-spending) synthesis only for an existing session in live mode.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const session = await getSession(parsed.data.sessionId);
  if (!session) return new Response(null, { status: 404 });
  try {
    const audio = await synthesize(parsed.data.text, session.lang, session.mode === "live");
    if (!audio) return new Response(null, { status: 204 });
    return new Response(new Uint8Array(audio), {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "private, max-age=86400" },
    });
  } catch {
    return new Response(null, { status: 204 });
  }
}
