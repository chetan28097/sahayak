import { NextResponse } from "next/server";
import { z } from "zod";
import { currentConfig } from "@/lib/config";
import { STAFF_COOKIE, checkPin, staffToken } from "@/server/staff";
import { ensureAccounts } from "@/server/store";

const Body = z.object({ pin: z.string().min(4).max(12), staffId: z.string().min(2).max(20) });

/** Staff list for the sign-in screen (names and roles only). */
export async function GET() {
  await ensureAccounts();
  return NextResponse.json({ staff: currentConfig().staff.map(({ id, name, role }) => ({ id, name, role })) });
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose your name and enter the branch PIN" }, { status: 400 });
  await ensureAccounts();
  if (!currentConfig().staff.some((s) => s.id === parsed.data.staffId)) {
    return NextResponse.json({ error: "Unknown staff member" }, { status: 400 });
  }
  const client = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const result = checkPin(parsed.data.pin, client);
  if (result === "unconfigured") return NextResponse.json({ error: "STAFF_PIN is not set on the server" }, { status: 503 });
  if (result === "locked") return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  if (result === "wrong") return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE, staffToken(parsed.data.staffId)!, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10, // one branch day
  });
  return res;
}
