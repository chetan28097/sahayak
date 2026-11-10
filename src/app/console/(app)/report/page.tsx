import { Download } from "lucide-react";
import Link from "next/link";
import { ServiceIcon, SERVICE_META } from "@/components/serviceMeta";
import { buildReport } from "@/lib/report";
import { repo } from "@/server/store";

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
];
const ACTION_LABEL: Record<string, string> = {
  submitted: "submitted", completed: "auto-completed", "help requested": "asked for help", claim: "started review", verify: "verified",
  unverify: "un-verified", request_info: "asked customer for info", escalate: "escalated", deescalate: "removed escalation",
  complete: "completed", reject: "rejected", reopen: "re-opened", note: "added a note",
};

function since(days: number): string {
  if (days !== 1) return new Date(Date.now() - days * 86400_000).toISOString();
  const ist = new Date(Date.now() + 5.5 * 3600_000);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - 5.5 * 3600_000).toISOString();
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const requested = (await searchParams).days;
  const days = RANGES.find((r) => String(r.days) === requested)?.days ?? 1;
  const from = since(days);
  const [rows, events] = await Promise.all([repo.listRequests({ since: from, limit: 500 }), repo.listEvents({ since: from, limit: 40 })]);
  const report = buildReport(rows);
  const maxService = Math.max(1, ...report.byService.map((s) => s.total));
  const maxDay = Math.max(1, ...report.byDay.map((d) => d.total));

  const stats = [
    { label: "Applications", value: report.total },
    { label: "Completed", value: report.completed },
    { label: "Still open", value: report.open },
    { label: "Waiting on customer", value: report.needsInfo },
    { label: "Help calls from kiosk", value: report.helpCalls },
    { label: "Median time to complete", value: report.medianMinutes === null ? "—" : `${report.medianMinutes} min` },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Branch report</h1>
          <p className="text-muted">How Sahayak requests are moving through the counter.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Period" className="flex rounded-lg border border-line bg-card p-1">
            {RANGES.map((r) => (
              <Link key={r.days} href={`/console/report?days=${r.days}`} aria-current={r.days === days ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${r.days === days ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                {r.label}
              </Link>
            ))}
          </nav>
          <a href={`/api/console/report?days=${Math.max(days, 1)}`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium hover:border-brand/50">
            <Download size={16} aria-hidden /> Export CSV
          </a>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-card p-4">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">By service</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-muted">
              <tr><th className="pb-2 font-medium">Service</th><th className="pb-2 font-medium">Volume</th><th className="pb-2 text-right font-medium">Done</th><th className="pb-2 text-right font-medium">Median</th></tr>
            </thead>
            <tbody>
              {report.byService.map((s) => (
                <tr key={s.service} className="border-t border-line">
                  <td className="py-2.5"><span className="flex items-center gap-2"><ServiceIcon service={s.service} size="sm" />{SERVICE_META[s.service].label}</span></td>
                  <td className="w-1/3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-paper"><div className="h-2 rounded-full bg-brand" style={{ width: `${(s.total / maxService) * 100}%` }} /></div>
                      <span className="w-6 text-right tabular-nums">{s.total}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{s.completed}</td>
                  <td className="py-2.5 text-right tabular-nums">{s.medianMinutes === null ? "—" : `${s.medianMinutes}m`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">{days === 1 ? "Languages used" : "Per day"}</h2>
          {days === 1 ? (
            <ul className="space-y-3">
              {(["kn", "hi", "en"] as const).map((l) => (
                <li key={l} className="flex justify-between border-b border-line pb-2">
                  <span>{{ kn: "Kannada", hi: "Hindi", en: "English" }[l]}</span>
                  <span className="font-semibold tabular-nums">{report.byLang[l] ?? 0}</span>
                </li>
              ))}
            </ul>
          ) : report.byDay.length === 0 ? (
            <p className="text-muted">No applications in this period.</p>
          ) : (
            <ul className="space-y-2">
              {report.byDay.map((d) => (
                <li key={d.day} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 text-muted">{new Date(d.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  <div className="h-2 flex-1 rounded-full bg-paper"><div className="h-2 rounded-full bg-brand" style={{ width: `${(d.total / maxDay) * 100}%` }} /></div>
                  <span className="w-16 text-right tabular-nums">{d.completed}/{d.total}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">Recent staff activity</h2>
        {events.length === 0 ? (
          <p className="text-muted">No activity in this period.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {events.map((e, i) => (
              <li key={e.id ?? i} className="flex flex-wrap items-baseline gap-x-2 py-2">
                <span className="w-28 shrink-0 text-muted">{new Date(e.at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}</span>
                <span className="font-medium">{e.actor}</span>
                <span>{ACTION_LABEL[e.action] ?? e.action}</span>
                <Link href={`/console/requests/${e.requestId}`} className="text-brand hover:underline">open</Link>
                {e.note && <span className="w-full pl-30 text-muted sm:w-auto sm:pl-0">— {e.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
