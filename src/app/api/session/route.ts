import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildView, createSession, handle } from "@/lib/machine";
import { SERVICE_IDS } from "@/lib/types";
import { liveVoiceAvailable } from "@/server/config";
import { deps } from "@/server/pipeline";
import { ensureAccounts, repo } from "@/server/store";

const Body = z.object({
  lang: z.enum(["hi", "kn", "en"]),
  mode: z.enum(["mock", "live"]).default("mock"),
  /** Optional: start straight in a service (tapped on the welcome screen). */
  service: z.enum(SERVICE_IDS as unknown as [string, ...string[]]).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid request" }, { status: 400 });
  try {
    await ensureAccounts();
    const mode = parsed.data.mode === "live" && liveVoiceAvailable() ? "live" : "mock";
    let state = createSession(randomUUID(), parsed.data.lang, mode, deps.now());
    if (parsed.data.service) state = handle(state, { type: "choose", value: parsed.data.service }, deps).state;
    await repo.saveSession(state);
    return NextResponse.json({ id: state.id, view: buildView(state, deps) });
  } catch {
    return NextResponse.json({ error: "storage unavailable, please try again" }, { status: 503 });
  }
}
