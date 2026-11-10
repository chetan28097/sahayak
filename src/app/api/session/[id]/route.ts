import { NextResponse } from "next/server";
import { buildView } from "@/lib/machine";
import { deps } from "@/server/pipeline";
import { ensureAccounts, getSession } from "@/server/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureAccounts();
  const state = await getSession(id);
  if (!state) return NextResponse.json({ error: "session not found" }, { status: 404 });
  return NextResponse.json({ view: buildView(state, deps) });
}
