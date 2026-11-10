import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/dates";
import { formatINR, groupDigits } from "@/lib/numbers";
import { ServiceIcon, STATUS_META } from "@/components/serviceMeta";
import { ensureAccounts, repo } from "@/server/store";

export default async function CustomerPage({ params }: { params: Promise<{ account: string }> }) {
  const { account } = await params;
  const acc = (await ensureAccounts()).find((a) => a.accountNumber === account);
  if (!acc) notFound();
  const requests = await repo.listRequests({ accountNumber: account, limit: 100 });

  const profile: [string, string][] = [
    ["Account", groupDigits(acc.accountNumber)],
    ["Type / branch", `${acc.accountType ?? "SB"} · ${acc.branch}`],
    ["Father / spouse", acc.fatherOrSpouse ?? "—"],
    ["Date of birth", acc.dob ? formatDate(acc.dob) : "—"],
    ["Mobile", acc.mobile ? `XXXXXX${acc.mobile.slice(-4)}` : "—"],
    ["Aadhaar", acc.aadhaarLast4 ? `XXXX-XXXX-${acc.aadhaarLast4}` : "—"],
    ["PAN", acc.pan ? `${acc.pan.slice(0, 2)}XXXXX${acc.pan.slice(-3)}` : "Not on record"],
    ["Debit card", acc.cardLast4 ? `XXXX ${acc.cardLast4}` : "—"],
    ["Schemes", acc.schemes?.length ? acc.schemes.join(", ").toUpperCase() : "None"],
    ["Address", acc.address ?? "—"],
  ];

  return (
    <div className="space-y-4">
      <Link href="/console/customers" className="text-sm font-medium text-brand"><ArrowLeft size={16} aria-hidden className="mr-1 inline -translate-y-px" />Customers</Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{acc.holder}</h1>
          <p className="text-muted"><span lang="kn">{acc.holderLocal.kn}</span>, <span lang="hi">{acc.holderLocal.hi}</span></p>
        </div>
        <div className="rounded-2xl border border-line bg-card px-4 py-2 text-right">
          <p className="text-xs text-muted">Balance (demo)</p>
          <p className="text-2xl font-bold tabular-nums">{formatINR(acc.balance ?? 0)}</p>
        </div>
      </header>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <dl className="h-fit space-y-2 rounded-2xl border border-line bg-card p-4 text-sm">
          {profile.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <section>
          <h2 className="mb-2 text-lg font-semibold">Requests</h2>
          {requests.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
              {requests.map((r) => (
                <li key={r.id}>
                  <Link href={`/console/requests/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper">
                    <ServiceIcon service={r.service} size="sm" />
                    <span className="font-mono font-bold">{r.code}</span>
                    <span className="min-w-0 flex-1 truncate">{r.form.title}</span>
                    <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_META[r.status].tone}`}>{STATUS_META[r.status].label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
