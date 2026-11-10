import { ArrowLeft, CheckCircle2, CircleAlert, PackageCheck, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { amountInWords } from "@/lib/amountWords";
import { BANK, NOTE_DENOMS } from "@/lib/bankRules";
import { t, type MsgKey } from "@/lib/i18n";
import { formatINR } from "@/lib/numbers";
import { AutoRefresh } from "@/components/AutoRefresh";
import { PrintButton } from "@/components/PrintButton";
import { ensureAccounts, isValidId, repo } from "@/server/store";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
}

const STATUS_TONE: Record<string, string> = {
  waiting: "bg-saffron-soft text-saffron-dark",
  in_review: "bg-brand-soft text-brand",
  needs_info: "bg-[#efe9fb] text-[#5b3aa6]",
  verified: "bg-brand-soft text-brand",
  completed: "bg-ok-soft text-ok",
  rejected: "bg-danger-soft text-danger",
};

/** The customer's copy: acknowledgement with reference, QR, what to bring and what happens next. */
export default async function SlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureAccounts();
  const slip = isValidId(id) ? await repo.getRequest(id) : null;
  if (!slip || slip.kind !== "application") notFound();
  const qr = await QRCode.toDataURL(slip.token, { errorCorrectionLevel: "L", margin: 1, width: 440 });
  const lang = slip.lang;
  const local = lang !== "en";
  const notes = slip.customer.notes;
  const after = slip.customer.after;
  const open = slip.status !== "completed" && slip.status !== "rejected";

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 print:max-w-none print:p-0">
      <AutoRefresh />
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <PrintButton />
        {slip.sessionId && (
          <Link href={`/visit/${slip.sessionId}`} className="inline-flex items-center gap-1 rounded-xl border-2 border-brand px-4 py-3 font-semibold text-brand">
            <ArrowLeft size={20} aria-hidden /> {t(lang, "ui.visitTitle")}
          </Link>
        )}
        <Link href={`/track?code=${slip.code}`} className="inline-flex items-center gap-1 rounded-xl px-4 py-3 font-medium text-brand hover:underline">
          <Search size={18} aria-hidden /> {t(lang, "ui.track")}
        </Link>
      </div>

      <div className={`no-print mb-4 rounded-xl px-4 py-3 ${STATUS_TONE[slip.status]}`} role="status">
        <p className="text-lg font-semibold">{t(lang, `ui.status.${slip.status}` as MsgKey)}</p>
        {slip.status === "needs_info" && slip.staffNote && <p className="mt-1">{slip.staffNote}</p>}
      </div>

      <article className="rounded-xl border-2 border-ink bg-white p-5 print:rounded-none print:border sm:p-7">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-3">
          <div>
            <p className="font-display text-xl font-semibold">{BANK.name}</p>
            {local && <p lang={lang} className="text-sm">{BANK.nameLocal[lang]}</p>}
            <p className="text-xs text-muted">{BANK.branch} branch, IFSC {BANK.ifsc}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{slip.form.title}</p>
            {local && <p lang={lang} className="text-sm">{t(lang, `task.${slip.service}` as MsgKey)}</p>}
            <p className="text-xs text-muted">{formatTime(slip.createdAt)}</p>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row">
          <div className="min-w-0 flex-1">
            {slip.customer.reference && (
              <p className="mb-3 text-sm">
                <span className="text-muted">{t(lang, "ui.reference")}{local ? " / Application reference" : ""}: </span>
                <span className="font-semibold tracking-wide">{slip.customer.reference}</span>
              </p>
            )}
            <table className="w-full text-sm">
              <tbody>
                {slip.customer.rows.map((f) => (
                  <tr key={f.key} className="border-b border-line align-top">
                    <th scope="row" className="w-2/5 py-1.5 pr-3 text-left font-medium text-muted">
                      {local && f.labelLocal !== f.label && <span lang={lang} className="block text-ink">{f.labelLocal}</span>}
                      <span className="block text-xs">{f.label}</span>
                    </th>
                    <td className="py-1.5 font-semibold">
                      {local && f.valueLocal !== f.value ? (
                        <>
                          <span lang={lang} className="block">{f.valueLocal}</span>
                          <span className="block text-xs font-normal text-muted">{f.value}</span>
                        </>
                      ) : (
                        f.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1 sm:w-48">
            <p className="text-xs text-muted">Token</p>
            <p className="rounded-lg bg-ink px-3 py-1 font-display text-2xl font-semibold tracking-widest text-white">{slip.code}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Encrypted, signed QR code with the complete application for the counter" className="mt-2 w-44" />
            <p className="text-center text-[11px] leading-snug text-muted">Show this at the counter. The QR is encrypted and signed: only the bank can read it.</p>
          </div>
        </div>

        {slip.service === "deposit" && notes && slip.customer.amount !== undefined && (
          <section className="mt-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink text-left">
                  <th className="py-1">Denomination</th>
                  <th className="py-1 text-right">Count</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {NOTE_DENOMS.filter((d) => (notes[String(d) as "500"] ?? 0) > 0).map((d) => (
                  <tr key={d} className="border-b border-line">
                    <td className="py-1">₹{d}</td>
                    <td className="py-1 text-right">{notes[String(d) as "500"]}</td>
                    <td className="py-1 text-right">{formatINR(d * (notes[String(d) as "500"] ?? 0))}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-1.5">Total</td>
                  <td />
                  <td className="py-1.5 text-right">{formatINR(slip.customer.amount)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm font-semibold print:bg-transparent">{amountInWords(slip.customer.amount)}</p>
          </section>
        )}

        {after && open && (
          <div className="mt-6 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
            <section>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <PackageCheck size={20} aria-hidden className="text-saffron-dark" />
                <span lang={lang}>{t(lang, "ui.bring")}</span>
              </h2>
              <ul className="mt-2 space-y-2">
                {after.bring.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <CircleAlert size={18} aria-hidden className="mt-0.5 shrink-0 text-saffron-dark" />
                    <span>
                      <span lang={lang} className="block">{b[lang]}</span>
                      {local && <span className="block text-xs text-muted">{b.en}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-base font-semibold"><span lang={lang}>{t(lang, "ui.nextSteps")}</span></h2>
              <ol className="mt-2 space-y-2">
                {after.next.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-white">{i + 1}</span>
                    <span>
                      <span lang={lang} className="block">{n[lang]}</span>
                      {local && <span className="block text-xs text-muted">{n.en}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}

        <footer className="mt-6 grid gap-6 text-xs">
          <div className="grid grid-cols-2 gap-8 pt-6">
            <p className="border-t border-ink pt-1">Customer signature / thumb impression</p>
            <p className="border-t border-ink pt-1">Bank officer (name, stamp)</p>
          </div>
          <p className="text-muted">
            <CheckCircle2 size={14} aria-hidden className="mr-1 inline -translate-y-px text-ok" />
            Read back aloud to the customer and confirmed at {formatTime(slip.readBackAt)}. This acknowledges a submitted application; it
            is not proof that the bank has completed it. Card photos only pre-fill forms; KYC verification is done by the bank.
          </p>
        </footer>
      </article>
    </main>
  );
}
