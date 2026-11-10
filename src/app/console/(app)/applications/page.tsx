import Link from "next/link";
import { ServiceIcon, SERVICE_META, STATUS_META } from "@/components/serviceMeta";
import { SERVICE_IDS, type ServiceId } from "@/lib/types";
import { checklistFor, pendingItems, type RequestStatus } from "@/lib/workflow";
import { repo, type RequestFilter } from "@/server/store";

const TABS: { id: string; label: string; filter: Partial<RequestFilter> }[] = [
  { id: "open", label: "Open", filter: { statuses: ["waiting", "in_review", "verified"] } },
  { id: "needs_info", label: "Needs info from customer", filter: { status: "needs_info" } },
  { id: "escalated", label: "Escalated", filter: { escalated: true } },
  { id: "completed", label: "Completed", filter: { status: "completed" } },
  { id: "rejected", label: "Rejected", filter: { status: "rejected" } },
  { id: "all", label: "All", filter: {} },
];

type Search = { tab?: string; service?: string; q?: string; sort?: string };

function href(base: Search, patch: Search) {
  const params = new URLSearchParams(Object.entries({ ...base, ...patch }).filter(([, v]) => v) as [string, string][]);
  return `/console/applications${params.size ? `?${params}` : ""}`;
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.id === sp.tab) ?? TABS[0];
  const service = SERVICE_IDS.includes(sp.service as ServiceId) ? (sp.service as ServiceId) : undefined;
  const q = sp.q?.slice(0, 40);
  const rows = (await repo.listRequests({ ...tab.filter, service, q, limit: 300 })).filter((r) => r.kind === "application");
  if (sp.sort === "oldest") rows.reverse();

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted">Every request submitted through Sahayak at this branch.</p>
        </div>
        <form className="flex flex-wrap gap-2" action="/console/applications">
          <input type="hidden" name="tab" value={tab.id} />
          <select name="service" defaultValue={service ?? ""} aria-label="Service" className="rounded-lg border border-line bg-card px-3 py-2 text-sm">
            <option value="">All services</option>
            {SERVICE_IDS.map((id) => <option key={id} value={id}>{SERVICE_META[id].label}</option>)}
          </select>
          <select name="sort" defaultValue={sp.sort ?? "newest"} aria-label="Sort" className="rounded-lg border border-line bg-card px-3 py-2 text-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <input name="q" defaultValue={q} placeholder="Token, name or account" aria-label="Search" className="w-52 rounded-lg border border-line bg-card px-3 py-2 text-sm" />
          <button className="rounded-lg bg-ink px-4 text-sm font-semibold text-white">Apply</button>
        </form>
      </header>

      <nav aria-label="Status" className="flex flex-wrap gap-1.5 border-b border-line pb-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={href(sp, { tab: t.id })}
            aria-current={t.id === tab.id ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${t.id === tab.id ? "bg-ink text-white" : "text-muted hover:bg-card hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-card p-10 text-center text-muted">
          No applications match. {q || service ? <Link href={href({ tab: tab.id }, {})} className="font-medium text-brand hover:underline">Clear filters</Link> : null}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-paper text-left text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Token</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Application</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">To verify</th>
                <th className="px-4 py-2.5 font-medium">Submitted</th>
                <th className="px-4 py-2.5 font-medium">Handled by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const pending = pendingItems(checklistFor(r.form, r.kind), r.checklist).length;
                const status = STATUS_META[r.status as RequestStatus];
                return (
                  <tr key={r.id} className="hover:bg-paper">
                    <td className="px-4 py-2.5">
                      <Link href={`/console/requests/${r.id}`} className="font-semibold tracking-wide text-brand hover:underline">{r.code}</Link>
                      {r.urgent && <span className="ml-2 rounded bg-danger px-1.5 text-xs font-semibold text-white">Urgent</span>}
                      {r.escalated && <span className="ml-1 rounded bg-[#5b3aa6] px-1.5 text-xs font-semibold text-white">Esc.</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.customerName ?? "New customer"}
                      {r.accountNumber && <span className="block text-xs text-muted">A/c ending {r.accountNumber.slice(-4)}</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2"><ServiceIcon service={r.service} size="sm" /> {r.form.title}</span>
                    </td>
                    <td className="px-4 py-2.5"><span className={`rounded px-2 py-0.5 font-medium ${status.tone}`}>{status.label}</span></td>
                    <td className="px-4 py-2.5 tabular-nums">{r.status === "completed" || r.status === "rejected" ? "—" : pending}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted">
                      {new Date(r.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{r.assignedTo ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
