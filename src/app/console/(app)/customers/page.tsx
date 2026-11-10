import Link from "next/link";
import { formatINR, groupDigits } from "@/lib/numbers";
import { ensureAccounts } from "@/server/store";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const accounts = (await ensureAccounts()).filter(
    (a) => !needle || a.holder.toLowerCase().includes(needle) || a.accountNumber.includes(needle) || (a.mobile ?? "").includes(needle),
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted">Demo account records (fake data) used for lookups and pre-fill.</p>
        </div>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Name, account or mobile" aria-label="Search customers" className="rounded-xl border border-line bg-card px-3 py-2 text-sm" />
          <button className="rounded-xl bg-ink px-4 text-sm font-semibold text-white">Search</button>
        </form>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-paper text-left text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Account</th>
              <th className="px-4 py-2 font-medium">Mobile</th>
              <th className="px-4 py-2 font-medium">Schemes</th>
              <th className="px-4 py-2 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {accounts.map((a) => (
              <tr key={a.accountNumber} className="hover:bg-paper">
                <td className="px-4 py-2.5">
                  <Link href={`/console/customers/${a.accountNumber}`} className="font-semibold text-brand">{a.holder}</Link>
                  <span className="block text-xs text-muted">{a.holderLocal.kn ?? a.holderLocal.hi}</span>
                </td>
                <td className="px-4 py-2.5 font-mono">{groupDigits(a.accountNumber)}</td>
                <td className="px-4 py-2.5 font-mono">{a.mobile ? `XXXXXX${a.mobile.slice(-4)}` : "—"}</td>
                <td className="px-4 py-2.5 uppercase">{a.schemes?.join(", ") || "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(a.balance ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
