import { NextResponse } from "next/server";
import { z } from "zod";
import { SERVICE_IDS } from "@/lib/types";
import { checklistFor, pendingItems, REQUEST_STATUSES } from "@/lib/workflow";
import { isStaff } from "@/server/staff";
import { repo, type RequestStatus } from "@/server/store";

const Query = z.object({
  status: z.enum(REQUEST_STATUSES as unknown as [string, ...string[]]).optional(),
  open: z.enum(["1"]).optional(),
  service: z.enum(SERVICE_IDS as unknown as [string, ...string[]]).optional(),
  q: z.string().max(40).optional(),
  since: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

/** Queue listing for the counter (polled every few seconds). Light rows only. */
export async function GET(req: Request) {
  if (!(await isStaff())) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const parsed = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "invalid filter" }, { status: 400 });
  const { open, status, ...rest } = parsed.data;
  const rows = await repo.listRequests({
    ...rest,
    status: status as RequestStatus | undefined,
    statuses: open ? ["waiting", "in_review", "needs_info", "verified"] : undefined,
  } as Parameters<typeof repo.listRequests>[0]);
  return NextResponse.json({
    requests: rows.map((r) => ({
      id: r.id, code: r.code, kind: r.kind, service: r.service, lang: r.lang, status: r.status, urgent: r.urgent,
      needsStaff: r.needsStaff, escalated: r.escalated, assignedTo: r.assignedTo, accountNumber: r.accountNumber,
      customerName: r.customerName, summary: r.summary, title: r.form.title, createdAt: r.createdAt,
      processedAt: r.processedAt, pending: pendingItems(checklistFor(r.form, r.kind), r.checklist).length,
    })),
  });
}
