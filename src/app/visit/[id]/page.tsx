import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { t, type MsgKey } from "@/lib/i18n";
import { AutoRefresh } from "@/components/AutoRefresh";
import { ServiceIcon, STATUS_META } from "@/components/serviceMeta";
import { getSession, repo } from "@/server/store";

/** End of visit: every token from this visit, big, with live status. */
export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) notFound();
  const requests = (await repo.listRequests({ sessionId: id })).reverse();
  const lang = session.lang;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-8">
      <AutoRefresh />
      <h1 className="text-3xl font-bold"><CheckCircle2 size={32} aria-hidden className="mr-2 inline -translate-y-1 text-ok" />{t(lang, "ui.visitTitle")}</h1>
      <p className="text-lg text-muted">{t(lang, "visitEnd")}</p>
      <ul className="grid gap-3">
        {requests.map((r) => {
          return (
            <li key={r.id}>
              <Link href={`/slip/${r.id}`} className="flex items-center gap-4 rounded-3xl border-2 border-line bg-card p-4 hover:border-brand">
                <ServiceIcon service={r.service} size="lg" />
                <span className="flex-1">
                  <span className="block text-lg font-semibold">{t(lang, `task.${r.service}` as MsgKey)}</span>
                  <span className="block text-sm text-muted">{r.form.title}</span>
                </span>
                <span className="text-right">
                  <span className="block rounded-lg bg-ink px-3 py-1 font-mono text-2xl font-bold tracking-widest text-white">{r.code}</span>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_META[r.status].tone}`}>
                    {t(lang, `ui.status.${r.status}` as MsgKey)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/" className="mt-auto rounded-2xl bg-brand py-4 text-center text-xl font-semibold text-white">
        New customer
      </Link>
    </main>
  );
}
