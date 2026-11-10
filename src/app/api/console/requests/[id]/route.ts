import { NextResponse } from "next/server";
import { z } from "zod";
import { applyAction, checklistFor, nextAction } from "@/lib/workflow";
import { currentStaff } from "@/server/staff";
import { isValidId, repo } from "@/server/store";

const Action = z.object({
  action: z.enum(["claim", "verify", "unverify", "request_info", "escalate", "deescalate", "complete", "reject", "reopen", "note"]),
  item: z.string().max(80).optional(),
  note: z.string().max(500).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

async function load(id: string) {
  const record = isValidId(id) ? await repo.getRequest(id) : null;
  if (!record) return null;
  const items = checklistFor(record.form, record.kind);
  const events = await repo.listEvents({ requestId: id, limit: 200 });
  return { record, items, events, next: nextAction(record, items, record.urgent) };
}

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await currentStaff())) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const data = await load((await params).id);
  return data ? NextResponse.json(data) : NextResponse.json({ error: "not found" }, { status: 404 });
}

/** Every staff action goes through the workflow rules and is written to the audit log. */
export async function POST(req: Request, { params }: Ctx) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const { id } = await params;
  const parsed = Action.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid action" }, { status: 400 });
  const data = await load(id);
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });

  const now = new Date().toISOString();
  const result = applyAction(data.record, data.items, parsed.data, staff.name, now);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });

  const patch = { ...result.patch, ...(parsed.data.action === "note" || parsed.data.note ? { staffNote: parsed.data.note ?? null } : {}) };
  if (Object.keys(patch).length) await repo.updateRequest(id, patch);
  await repo.addEvent({ requestId: id, at: now, actor: staff.name, action: result.event.action, note: result.event.note });
  return NextResponse.json(await load(id));
}
