import { NextResponse } from "next/server";
import { z } from "zod";
import { repo } from "@/server/store";

const Query = z.object({ code: z.string().min(6).max(8).regex(/^[A-Za-z0-9-]+$/) });

/**
 * Public status lookup by token. Returns no personal data: only the service, status,
 * dates and the customer-facing reason if the bank asked for something.
 */
export async function GET(req: Request) {
  const parsed = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-character token from your slip." }, { status: 400 });
  const record = await repo.getRequestByCode(parsed.data.code);
  if (!record || record.kind !== "application") return NextResponse.json({ error: "No application has this token." }, { status: 404 });
  const events = await repo.listEvents({ requestId: record.id, limit: 50 });
  return NextResponse.json({
    id: record.id,
    code: record.code,
    service: record.service,
    status: record.status,
    lang: record.lang,
    createdAt: record.createdAt,
    processedAt: record.processedAt,
    askedFor: record.status === "needs_info" ? record.staffNote : null,
    timeline: events
      .filter((e) => ["submitted", "claim", "request_info", "complete", "completed", "reject", "reopen"].includes(e.action))
      .map((e) => ({ at: e.at, action: e.action })),
  });
}
