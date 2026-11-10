import { z } from "zod";
import { toCsv } from "@/lib/report";
import { isStaff } from "@/server/staff";
import { repo } from "@/server/store";

const Query = z.object({ days: z.coerce.number().int().min(1).max(90).default(7) });

/** CSV export of requests (no Aadhaar, no addresses — operational fields only). */
export async function GET(req: Request) {
  if (!(await isStaff())) return new Response("unauthorised", { status: 401 });
  const { days } = Query.parse(Object.fromEntries(new URL(req.url).searchParams));
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const rows = await repo.listRequests({ since, limit: 500 });
  const csv = toCsv(
    ["token", "kind", "service", "status", "language", "urgent", "needs_staff", "assigned_to", "created_at", "processed_at", "account_last4"],
    rows.map((r) => [
      r.code, r.kind, r.service, r.status, r.lang, r.urgent ? "yes" : "no", r.needsStaff ? "yes" : "no", r.assignedTo,
      r.createdAt, r.processedAt, r.accountNumber ? r.accountNumber.slice(-4) : null,
    ]),
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sahayak-requests-${days}d.csv"`,
    },
  });
}
