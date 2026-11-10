import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/server/sign";
import { isStaff } from "@/server/staff";
import { repo } from "@/server/store";

const Body = z.union([z.object({ code: z.string().min(4).max(12) }), z.object({ token: z.string().min(10).max(8000) })]);

/**
 * Teller scan: verifies the signed QR (or looks a request up by its token code) and
 * returns the full filled bank form. The QR alone is enough — the DB is only used to
 * attach live status and link to the request page.
 */
export async function POST(req: Request) {
  if (!(await isStaff())) return NextResponse.json({ valid: false, reason: "unauthorised" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ valid: false, reason: "invalid request" }, { status: 400 });

  let token: string;
  if ("code" in parsed.data) {
    const record = await repo.getRequestByCode(parsed.data.code);
    if (!record) return NextResponse.json({ valid: false, reason: "no request with this token" }, { status: 404 });
    token = record.token;
  } else {
    token = parsed.data.token;
  }
  const result = verifyToken(token);
  if (!result.valid) return NextResponse.json(result, { status: 422 });
  const id = String(result.payload.id ?? "");
  const record = await repo.getRequest(id).catch(() => null);
  return NextResponse.json({ ...result, status: record?.status ?? null, requestId: record ? id : null });
}
