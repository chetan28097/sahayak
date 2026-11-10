"use client";
import { ArrowLeft, CheckCircle2, CircleHelp, Hand, ReceiptText, SkipForward, Volume2 } from "lucide-react";
import { rememberSession } from "./kiosk/ResumeBanner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { t, LANG_LABELS } from "@/lib/i18n";
import type { SessionView } from "@/lib/machine";
import { MicButton } from "./MicButton";
import { StepControls } from "./StepControls";
import { useConversation } from "./useConversation";

function Progress({ view }: { view: SessionView }) {
  if (!view.form || view.progress.total === 0) return null;
  const pct = Math.round((view.progress.done / view.progress.total) * 100);
  return (
    <div className="flex min-w-32 flex-1 items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm tabular-nums text-muted">
        {t(view.lang, "ui.step", { a: view.progress.done, b: view.progress.total })}
      </span>
    </div>
  );
}

function FilledFields({ view }: { view: SessionView }) {
  if (view.fields.length === 0) return null;
  return (
    <aside className="rounded-3xl border border-line bg-card p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t(view.lang, "ui.filled")}</h2>
      <dl className="space-y-2">
        {view.fields.map((f) => (
          <div key={f.stepId + f.label}>
            <dt className="text-xs text-muted">{f.label}</dt>
            <dd className="font-semibold leading-snug">{f.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function StaffInput({ view, onSend, disabled }: { view: SessionView; onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");
  return (
    <form
      className="flex w-full gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t(view.lang, "ui.staffInput")}
        aria-label={t(view.lang, "ui.staffInput")}
        maxLength={500}
        className="min-w-0 flex-1 rounded-xl border-2 border-line bg-card px-4 py-3 text-lg"
      />
      <button type="submit" disabled={disabled} className="rounded-xl bg-ink px-5 font-semibold text-white disabled:opacity-40">
        {t(view.lang, "ui.send")}
      </button>
    </form>
  );
}

export function Conversation({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const conv = useConversation(sessionId);
  const { view, status } = conv;

  useEffect(() => {
    if (view) rememberSession(view.id, view.phase === "ended");
  }, [view]);

  useEffect(() => {
    if (view?.phase === "ended" && status === "idle") {
      const timer = setTimeout(() => router.push(`/visit/${view.id}`), 600);
      return () => clearTimeout(timer);
    }
  }, [view?.phase, view?.id, status, router]);

  if (conv.error && !view) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="mb-4 text-xl">{conv.error}</p>
          <Link href="/" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">Start again</Link>
        </div>
      </main>
    );
  }
  if (!view) return <main className="grid min-h-dvh place-items-center text-muted">…</main>;

  const busy = status === "thinking" || status === "listening";
  const showStaff = view.staffMode || view.escape;
  const canSkip = view.step?.optional || view.escape;

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
      <header className="flex flex-wrap items-center gap-3">
        <Link href="/" className="rounded-lg px-2 py-1 text-sm font-medium text-brand hover:bg-brand-soft"><ArrowLeft size={22} aria-hidden className="inline shrink-0 mr-1 -translate-y-px" />{LANG_LABELS[view.lang].native}</Link>
        <Progress view={view} />
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${view.mode === "live" ? "bg-ok-soft text-ok" : "bg-saffron-soft text-saffron-dark"}`}>
          {view.mode === "live" ? "Live voice" : "Practice"}
        </span>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_300px]">
        <section className="flex flex-col items-center gap-5">
          <div className="w-full rounded-3xl bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <p className="flex-1 text-2xl font-semibold leading-relaxed sm:text-3xl" aria-live="polite">{view.say}</p>
              <button
                type="button"
                onClick={conv.replay}
                aria-label={t(view.lang, "ui.repeat")}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-2xl text-brand"
              >
                <Volume2 size={26} aria-hidden />
              </button>
            </div>
            {view.confirm?.row && (
              <p className="mt-4 rounded-2xl bg-saffron-soft px-4 py-3 text-3xl font-bold tracking-wide tabular-nums sm:text-4xl">
                {view.confirm.row.value}
              </p>
            )}
            {conv.heard !== null && conv.heard !== "" && (
              <p className="mt-4 text-lg text-muted">
                {t(view.lang, "ui.youSaid")}: <span className="font-medium text-ink">“{conv.heard}”</span>
              </p>
            )}
            {conv.needsTapToHear && (
              <button type="button" onClick={conv.replay} className="mt-3 text-brand underline">
                <Volume2 size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.repeat")}
              </button>
            )}
          </div>

          {view.phase === "next" && view.slipIds.length > 0 && (
            <Link
              href={`/slip/${view.slipIds[view.slipIds.length - 1]}`}
              className="w-full rounded-2xl bg-ok py-4 text-center text-xl font-semibold text-white"
            >
              <ReceiptText size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.viewSlip")}
            </Link>
          )}
          {view.phase === "ended" ? (
            <Link href={`/visit/${view.id}`} className="w-full rounded-2xl bg-ok py-5 text-center text-2xl font-semibold text-white">
              <CheckCircle2 size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.visitTitle")}
            </Link>
          ) : (
            <>
              <StepControls view={view} disabled={busy} sendAction={conv.sendAction} sendCard={conv.sendCard} />
              <MicButton lang={view.lang} mode={view.mode} status={status} onStatus={conv.setStatus} onAudio={conv.sendAudio} />
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={conv.replay} className="rounded-full border border-line bg-card px-4 py-2 font-medium">
                  <Volume2 size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.repeat")}
                </button>
                {view.phase === "collect" && view.form && (
                  <button type="button" disabled={busy} onClick={() => conv.sendAction({ type: "help" })} className="rounded-full border border-line bg-card px-4 py-2 font-medium">
                    <CircleHelp size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.whatMeans")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy || view.staffMode}
                  onClick={() => conv.sendAction({ type: "staff" })}
                  className={`rounded-full border px-4 py-2 font-medium ${view.staffMode ? "border-ok bg-ok-soft text-ok" : "border-line bg-card"}`}
                >
                  <Hand size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.callStaff")}
                </button>
                {canSkip && view.form && view.phase === "collect" && (
                  <button type="button" disabled={busy} onClick={() => conv.sendAction({ type: "skip" })} className="rounded-full border border-line bg-card px-4 py-2 font-medium">
                    <SkipForward size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.skip")}
                  </button>
                )}
              </div>
              {showStaff && <StaffInput view={view} onSend={conv.sendText} disabled={busy} />}
            </>
          )}
          {conv.error && <p role="alert" className="text-danger">{conv.error}</p>}
        </section>
        <FilledFields view={view} />
      </div>
    </main>
  );
}
