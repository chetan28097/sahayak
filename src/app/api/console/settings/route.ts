import { NextResponse } from "next/server";
import { ConfigSchema, currentConfig } from "@/lib/config";
import { currentStaff } from "@/server/staff";
import { invalidateCaches, repo } from "@/server/store";

export async function GET() {
  if (!(await currentStaff())) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  return NextResponse.json({ config: currentConfig() });
}

/** Branch configuration — branch manager only. Validated before saving. */
export async function PUT(req: Request) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  if (staff.role !== "manager") return NextResponse.json({ error: "Only the branch manager can change settings." }, { status: 403 });
  const parsed = ConfigSchema.safeParse((await req.json().catch(() => null))?.config);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue.path.join(".") || "config"}: ${issue.message}` }, { status: 400 });
  }
  if (!parsed.data.staff.some((s) => s.role === "manager")) {
    return NextResponse.json({ error: "Keep at least one branch manager in the staff list." }, { status: 400 });
  }
  await repo.saveConfig(parsed.data, staff.name);
  invalidateCaches();
  return NextResponse.json({ ok: true, config: parsed.data });
}
