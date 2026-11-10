"use client";
import { useEffect, useState } from "react";
import { NOTE_DENOMS } from "@/lib/bankRules";
import { t } from "@/lib/i18n";
import { noteTotal } from "@/lib/notes";
import { formatINR } from "@/lib/numbers";
import type { Lang, NoteBreakdown, NoteKey } from "@/lib/types";

interface Props {
  lang: Lang;
  counts: NoteBreakdown;
  amount: number;
  disabled: boolean;
  onDone: (counts: NoteBreakdown) => void;
}

/** Visual cash counter: the gap to the amount is visible while counting, not only after. */
export function NoteCounter({ lang, counts, amount, disabled, onDone }: Props) {
  const [local, setLocal] = useState<NoteBreakdown>(counts);
  useEffect(() => setLocal(counts), [counts]);

  const total = noteTotal(local);
  const diff = amount - total;
  const setCount = (key: NoteKey, value: number) => setLocal((prev) => ({ ...prev, [key]: Math.max(0, value) }));

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {NOTE_DENOMS.map((d) => {
          const key = String(d) as NoteKey;
          const count = local[key] ?? 0;
          return (
            <div key={d} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2">
              <span className="w-20 rounded-lg bg-brand-soft px-2 py-1 text-center text-lg font-bold text-brand-dark">₹{d}</span>
              <button
                type="button"
                aria-label={`− ₹${d}`}
                disabled={disabled || count === 0}
                onClick={() => setCount(key, count - 1)}
                className="grid size-11 place-items-center rounded-full border border-line text-2xl font-semibold disabled:opacity-30"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                aria-label={`₹${d} count`}
                value={count}
                disabled={disabled}
                onChange={(e) => setCount(key, Number(e.target.value) || 0)}
                className="w-16 rounded-lg border border-line py-1.5 text-center text-xl font-semibold tabular-nums"
              />
              <button
                type="button"
                aria-label={`+ ₹${d}`}
                disabled={disabled}
                onClick={() => setCount(key, count + 1)}
                className="grid size-11 place-items-center rounded-full bg-brand text-2xl font-semibold text-white disabled:opacity-30"
              >
                +
              </button>
              <span className="ml-auto text-right text-sm tabular-nums text-muted">{formatINR(d * count)}</span>
            </div>
          );
        })}
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2">
          <span className="w-20 text-center text-sm font-semibold text-muted">{t(lang, "ui.coins")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={local.coins ?? 0}
            disabled={disabled}
            onChange={(e) => setCount("coins", Number(e.target.value) || 0)}
            className="w-24 rounded-lg border border-line py-1.5 text-center text-xl font-semibold tabular-nums"
          />
        </label>
      </div>

      <div
        className={`mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
          diff === 0 ? "bg-ok-soft text-ok" : "bg-saffron-soft text-ink"
        }`}
        aria-live="polite"
      >
        <span className="text-lg">
          {t(lang, "ui.total")}: <b className="tabular-nums">{formatINR(total)}</b>
          <span className="text-muted"> / {t(lang, "ui.target")} {formatINR(amount)}</span>
        </span>
        <span className="text-lg font-bold">
          {diff === 0
            ? `✓ ${t(lang, "ui.match")}`
            : t(lang, diff > 0 ? "ui.short" : "ui.extra", { x: formatINR(Math.abs(diff)) })}
        </span>
      </div>
      <button
        type="button"
        disabled={disabled || total === 0}
        onClick={() => onDone(local)}
        className="mt-3 w-full rounded-2xl bg-brand py-4 text-xl font-semibold text-white disabled:opacity-40"
      >
        {t(lang, "ui.notesDone")}
      </button>
    </div>
  );
}
