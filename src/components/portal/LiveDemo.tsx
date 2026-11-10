"use client";
import { Check, Mic, RotateCcw, Volume2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PortalCopy } from "@/lib/portal/content";
import { LANG_CODES, type Lang } from "@/lib/types";

const STEP_MS = 1700;

/**
 * The hero visual is the product itself: a scripted deposit conversation that plays out
 * while the bank form fills in beside it. Users can replay, scrub with the dots, and hear it.
 */
export function LiveDemo({ demo, lang }: { demo: PortalCopy["demo"]; lang: Lang }) {
  const reduce = useReducedMotion();
  const total = demo.lines.length;
  const [shown, setShown] = useState(reduce ? total : 1);
  const [playing, setPlaying] = useState(!reduce);
  const listRef = useRef<HTMLOListElement>(null);

  // Restart when the language changes.
  useEffect(() => {
    setShown(reduce ? total : 1);
    setPlaying(!reduce);
  }, [lang, reduce, total]);

  useEffect(() => {
    if (!playing) return;
    if (shown >= total) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, shown, total]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [shown, reduce]);

  const hear = useCallback(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    synth.cancel();
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
    for (const line of demo.lines.slice(0, shown)) {
      const u = new SpeechSynthesisUtterance(line.text);
      u.lang = LANG_CODES[lang];
      if (voice) u.voice = voice;
      u.rate = 0.95;
      synth.speak(u);
    }
  }, [demo.lines, lang, shown]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const done = shown >= total;
  const progressPct = Math.round((shown / total) * 100);

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_70%_20%,rgba(30,58,138,0.14),transparent),radial-gradient(50%_50%_at_20%_90%,rgba(161,98,7,0.12),transparent)]" />
      <div className="overflow-hidden rounded-[1.75rem] border border-line bg-card shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-7 place-items-center rounded-full bg-saffron text-white"><Mic size={15} aria-hidden /></span>
            {demo.label}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={hear} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-brand hover:bg-brand-soft">
              <Volume2 size={16} aria-hidden /> {demo.hear}
            </button>
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setShown(1);
                setPlaying(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
            >
              <RotateCcw size={15} aria-hidden /> {demo.replay}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-[1.15fr_1fr]">
          <ol ref={listRef} aria-live="polite" className="flex h-80 flex-col gap-2.5 overflow-y-auto px-5 py-5 sm:h-[22rem]">
            <AnimatePresence initial={false}>
              {demo.lines.slice(0, shown).map((line, i) => (
                <motion.li
                  key={`${lang}-${i}`}
                  initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
                    line.who === "bot" ? "self-start rounded-tl-md bg-paper text-ink" : "self-end rounded-tr-md bg-brand text-white"
                  }`}
                >
                  {line.text}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          <div className="border-t border-line bg-paper/60 px-5 py-5 sm:border-l sm:border-t-0">
            <p className="text-sm font-semibold text-muted">Pay-in slip</p>
            <dl className="mt-3 space-y-3">
              {demo.fields.map((f) => {
                const filled = shown > f.after;
                return (
                  <div key={f.label}>
                    <dt className="text-xs text-muted">{f.label}</dt>
                    <dd className="relative mt-0.5 h-7 overflow-hidden rounded-md">
                      <AnimatePresence mode="wait">
                        {filled ? (
                          <motion.span
                            key="v"
                            initial={reduce ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="block truncate font-display text-lg font-semibold text-ink"
                          >
                            {f.value}
                          </motion.span>
                        ) : (
                          <motion.span key="e" exit={{ opacity: 0 }} className="block h-full rounded-md border border-dashed border-line" />
                        )}
                      </AnimatePresence>
                    </dd>
                  </div>
                );
              })}
            </dl>
            <AnimatePresence>
              {done && (
                <motion.p
                  initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2 text-sm font-semibold text-ok"
                >
                  <Check size={16} aria-hidden /> {demo.ready}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line px-5 py-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-paper">
            <motion.div className="h-full rounded-full bg-saffron" animate={{ width: `${progressPct}%` }} transition={{ duration: reduce ? 0 : 0.5 }} />
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Jump to a step">
            {demo.lines.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Step ${i + 1}`}
                onClick={() => {
                  setPlaying(false);
                  setShown(i + 1);
                }}
                className={`size-2.5 rounded-full transition-colors ${i < shown ? "bg-brand" : "bg-line hover:bg-muted/40"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
