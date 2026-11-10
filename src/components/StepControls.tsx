"use client";
import { Camera, Check, CheckSquare, MessageCircle, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import type { SessionView } from "@/lib/machine";
import { formatINR } from "@/lib/numbers";
import type { CardKind, ServiceId } from "@/lib/types";
import { CameraCapture } from "./CameraCapture";
import { NoteCounter } from "./NoteCounter";
import { ServiceIcon } from "./serviceMeta";
import type { useConversation } from "./useConversation";

type Conv = ReturnType<typeof useConversation>;

interface Props {
  view: SessionView;
  disabled: boolean;
  sendAction: Conv["sendAction"];
  sendCard: Conv["sendCard"];
}
type ActionProps = Omit<Props, "sendCard">;

const bigBtn =
  "rounded-2xl px-5 py-4 text-xl font-semibold transition active:scale-[0.98] disabled:opacity-40 min-h-16";

function YesNo({ view, disabled, sendAction }: ActionProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <button type="button" disabled={disabled} onClick={() => sendAction({ type: "yes" })} className={`${bigBtn} bg-ok text-white`}>
        <Check size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.yes")}
      </button>
      <button type="button" disabled={disabled} onClick={() => sendAction({ type: "no" })} className={`${bigBtn} border-2 border-line bg-card text-ink`}>
        <X size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.no")}
      </button>
    </div>
  );
}

/** The 5 picture tiles — the tap fallback for "what do you need today?". */
function TaskTiles({ view, disabled, sendAction }: ActionProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
      {(view.step?.options ?? []).map((o) => {
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => sendAction({ type: "choose", value: o.value })}
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-line bg-card p-4 text-center transition hover:border-brand active:scale-[0.98] disabled:opacity-40"
          >
            <ServiceIcon service={o.value as ServiceId} size="lg" />
            <span className="text-lg font-semibold leading-tight">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Options({ view, disabled, sendAction }: ActionProps) {
  const options = view.step?.options ?? [];
  const wide = options.length <= 2;
  return (
    <div className={`grid w-full gap-3 ${wide ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          onClick={() => sendAction({ type: "choose", value: o.value })}
          className={`${bigBtn} border-2 border-line bg-card text-ink hover:border-brand ${wide ? "min-h-24 text-2xl" : ""}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MultiChoice({ view, disabled, sendAction }: ActionProps) {
  const [picked, setPicked] = useState<string[]>(view.step?.selected ?? []);
  useEffect(() => setPicked(view.step?.selected ?? []), [view.step?.selected]);
  const toggle = (v: string) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-medium text-muted">{t(view.lang, "ui.chooseMany")}</p>
      <div className="grid grid-cols-2 gap-3">
        {(view.step?.options ?? []).map((o) => {
          const on = picked.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => toggle(o.value)}
              className={`${bigBtn} border-2 ${on ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-card text-ink"}`}
            >
              {on ? <CheckSquare size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" /> : <Square size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />}{o.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={disabled || picked.length === 0}
        onClick={() => sendAction({ type: "chooseMany", values: picked })}
        className={`${bigBtn} mt-3 w-full bg-brand text-white`}
      >
        {t(view.lang, "ui.next")}
      </button>
    </div>
  );
}

/** Balance is shown, never spoken (privacy at a crowded counter). */
function BalanceCard({ view, disabled, sendAction }: ActionProps) {
  if (!view.info) return null;
  return (
    <div className="w-full rounded-3xl border-2 border-brand bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-muted">{t(view.lang, "ui.balance")}</p>
        <span className="rounded-full bg-saffron-soft px-2 py-0.5 text-xs font-semibold text-saffron-dark">{t(view.lang, "ui.demoData")}</span>
      </div>
      <p className="text-4xl font-bold tabular-nums text-brand-dark">{formatINR(view.info.balance)}</p>
      <p className="mt-4 text-sm font-semibold text-muted">{t(view.lang, "ui.lastTxns")}</p>
      <ul className="divide-y divide-line">
        {view.info.transactions.map((tx, i) => (
          <li key={i} className="flex justify-between gap-3 py-2">
            <span>
              <span className="text-sm text-muted">{tx.date}</span> · {tx.desc}
            </span>
            <span className={`font-semibold tabular-nums ${tx.amount < 0 ? "text-danger" : "text-ok"}`}>
              {tx.amount < 0 ? "−" : "+"}
              {formatINR(Math.abs(tx.amount))}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" disabled={disabled} onClick={() => sendAction({ type: "yes" })} className={`${bigBtn} mt-3 w-full bg-brand text-white`}>
        <Check size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.ok")}
      </button>
    </div>
  );
}

function ReviewList({ view, disabled, sendAction }: ActionProps) {
  const rows = view.review?.rows ?? [];
  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-medium text-muted">{t(view.lang, "ui.tapToFix")}</p>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {rows.map((row) => (
          <li key={row.stepId + row.label}>
            <button
              type="button"
              disabled={disabled || row.stepId.endsWith("Photo")}
              onClick={() => sendAction({ type: "edit", stepId: row.stepId })}
              className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left hover:bg-brand-soft disabled:hover:bg-transparent"
            >
              <span className="shrink-0 text-muted">{row.label}</span>
              <span className="text-right text-lg font-semibold">{row.value}</span>
            </button>
          </li>
        ))}
      </ul>
      {view.review?.scope === "identity" && (view.review.missing.length > 0 || view.review.rows.some((r) => r.stepId === "aadhaarPhoto")) && (
        <div className="mt-3 space-y-1 rounded-xl bg-saffron-soft px-4 py-3 text-saffron-dark">
          {view.review.missing.length > 0 && <p className="font-medium">{t(view.lang, "ui.cantRead", { list: view.review.missing.join(", ") })}</p>}
          <p className="text-sm">{t(view.lang, "ui.cardOnly")}</p>
        </div>
      )}
      <button type="button" disabled={disabled} onClick={() => sendAction({ type: "yes" })} className={`${bigBtn} mt-3 w-full bg-ok text-white`}>
        <Check size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.confirmAll")}
      </button>
    </div>
  );
}

function CardOption({ view, disabled, sendCard, kind, label }: Omit<Props, "sendAction"> & { kind: CardKind; label: string }) {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <CameraCapture
        lang={view.lang}
        mode={view.mode}
        kind={kind}
        disabled={disabled}
        onCapture={(img) => {
          setOpen(false);
          void sendCard(kind, img);
        }}
        onCancel={() => setOpen(false)}
      />
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={() => setOpen(true)} className={`${bigBtn} w-full border-2 border-brand bg-card text-brand`}>
      <Camera size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{label}
    </button>
  );
}

/** After a slip: pick another job (account carried over) or finish. */
function NextJob(props: ActionProps) {
  const { view, disabled, sendAction } = props;
  return (
    <div className="w-full space-y-3">
      <TaskTiles {...props} />
      <button type="button" disabled={disabled} onClick={() => sendAction({ type: "no" })} className={`${bigBtn} w-full border-2 border-line bg-card text-ink`}>
        <Check size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(view.lang, "ui.allDone")}
      </button>
    </div>
  );
}

export function StepControls(props: Props) {
  const { view, disabled, sendAction, sendCard } = props;
  const { lang } = view;
  if (view.phase === "ended" || !view.step) return null;
  if (view.phase === "next") return <NextJob {...props} />;
  if (view.phase === "confirm") return <YesNo {...props} />;
  if (view.phase === "review") return <ReviewList {...props} />;
  if (view.phase === "task") return <TaskTiles {...props} />;

  switch (view.step.input) {
    case "choice":
      return <Options {...props} />;
    case "multichoice":
      return <MultiChoice {...props} />;
    case "yesno":
      return <YesNo {...props} />;
    case "info":
      return <BalanceCard {...props} />;
    case "notes":
      return view.notes ? (
        <NoteCounter
          lang={lang}
          counts={view.notes.counts}
          amount={view.notes.amount}
          disabled={disabled}
          onDone={(notes) => sendAction({ type: "notes", notes })}
        />
      ) : null;
    case "photo": {
      const kind = view.step.card ?? "aadhaar";
      return (
        <div className="w-full">
          <CameraCapture lang={lang} mode={view.mode} kind={kind} disabled={disabled} onCapture={(img) => sendCard(kind, img)} />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" disabled={disabled} onClick={() => sendAction({ type: "voiceInstead" })} className={`${bigBtn} border-2 border-line bg-card text-ink`}>
              <MessageCircle size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(lang, "ui.byVoice")}
            </button>
            {view.step.id === "panPhoto" && (
              <button type="button" disabled={disabled} onClick={() => sendAction({ type: "noPan" })} className={`${bigBtn} border-2 border-line bg-card text-ink`}>
                {t(lang, "ui.noPan")}
              </button>
            )}
          </div>
        </div>
      );
    }
    case "pan":
      return (
        <div className="grid w-full gap-3">
          <CardOption view={view} disabled={disabled} sendCard={sendCard} kind="pan" label={t(lang, "ui.panCard")} />
          <button type="button" disabled={disabled} onClick={() => sendAction({ type: "noPan" })} className={`${bigBtn} border-2 border-line bg-card text-ink`}>
            {t(lang, "ui.noPan")}
          </button>
        </div>
      );
    case "digits":
      return (
        <div className="grid w-full gap-2">
          <CardOption view={view} disabled={disabled} sendCard={sendCard} kind="passbook" label={t(lang, "ui.passbook")} />
          <p className="text-center text-sm text-muted">{t(lang, "ui.privacy")}</p>
        </div>
      );
    default:
      return null;
  }
}
