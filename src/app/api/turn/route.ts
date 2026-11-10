import { NextResponse } from "next/server";
import { z } from "zod";
import { LIMITS } from "@/server/config";
import { processTurn, type TurnInput } from "@/server/pipeline";
import { getSession } from "@/server/store";

const NoteCounts = z
  .object({
    "500": z.number().int().min(0).max(10000),
    "200": z.number().int().min(0).max(10000),
    "100": z.number().int().min(0).max(10000),
    "50": z.number().int().min(0).max(10000),
    "20": z.number().int().min(0).max(10000),
    "10": z.number().int().min(0).max(10000),
    coins: z.number().int().min(0).max(100000),
  })
  .partial();

const Action = z.discriminatedUnion("type", [
  z.object({ type: z.enum(["yes", "no", "skip", "staff", "repeat", "help", "voiceInstead", "noPan"]) }),
  z.object({ type: z.literal("choose"), value: z.string().max(40) }),
  z.object({ type: z.literal("chooseMany"), values: z.array(z.string().max(40)).min(1).max(10) }),
  z.object({ type: z.literal("edit"), stepId: z.string().max(40) }),
  z.object({ type: z.literal("notes"), notes: NoteCounts }),
]);

const JsonBody = z.union([
  z.object({ sessionId: z.string(), text: z.string().min(1).max(LIMITS.textChars) }),
  z.object({ sessionId: z.string(), action: Action }),
]);

const CARD_KINDS = ["aadhaar", "pan", "passbook"] as const;

async function parseRequest(req: Request): Promise<{ sessionId: string; input: TurnInput } | { error: string }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await req.formData();
    const sessionId = String(form.get("sessionId") ?? "");
    const audio = form.get("audio");
    const card = String(form.get("card") ?? "");
    const image = form.get("image");
    if (CARD_KINDS.includes(card as (typeof CARD_KINDS)[number])) {
      if (image instanceof Blob && image.size > LIMITS.imageBytes) return { error: "image too large" };
      return {
        sessionId,
        input: { kind: "card", cardKind: card as (typeof CARD_KINDS)[number], image: image instanceof Blob ? image : null },
      };
    }
    if (!(audio instanceof Blob)) return { error: "audio missing" };
    if (audio.size > LIMITS.audioBytes) return { error: "audio longer than 30 seconds" };
    return { sessionId, input: { kind: "audio", wav: audio } };
  }
  const parsed = JsonBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return { error: "invalid request" };
  const body = parsed.data;
  return "text" in body
    ? { sessionId: body.sessionId, input: { kind: "text", text: body.text } }
    : { sessionId: body.sessionId, input: { kind: "action", action: body.action } };
}

export async function POST(req: Request) {
  const parsed = await parseRequest(req);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const state = await getSession(parsed.sessionId);
  if (!state) return NextResponse.json({ error: "session not found" }, { status: 404 });
  if (state.visitEnded) return NextResponse.json({ error: "visit already completed" }, { status: 409 });
  try {
    return NextResponse.json(await processTurn(state, parsed.input));
  } catch {
    return NextResponse.json({ error: "something went wrong, please try again" }, { status: 500 });
  }
}
