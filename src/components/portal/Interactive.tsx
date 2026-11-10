"use client";
import { ChevronDown, Minus, Plus, Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PortalCopy } from "@/lib/portal/content";

/** A real, working note counter (the same idea as in the deposit flow) inside the services bento. */
export function NoteCounterMini({ target = 12500 }: { target?: number }) {
  const [counts, setCounts] = useState<Record<number, number>>({ 500: 20, 100: 20 });
  const total = Object.entries(counts).reduce((s, [d, c]) => s + Number(d) * c, 0);
  const diff = target - total;
  const set = (d: number, n: number) => setCounts((c) => ({ ...c, [d]: Math.max(0, n) }));
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      {[500, 100].map((d) => (
        <div key={d} className="flex items-center gap-3 py-1.5">
          <span className="w-14 rounded-md bg-ok-soft px-2 py-1 text-center text-sm font-semibold text-ok">₹{d}</span>
          <button type="button" aria-label={`Fewer ₹${d} notes`} onClick={() => set(d, counts[d] - 1)} className="grid size-8 place-items-center rounded-full border border-line hover:border-brand/40">
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums">{counts[d]}</span>
          <button type="button" aria-label={`More ₹${d} notes`} onClick={() => set(d, counts[d] + 1)} className="grid size-8 place-items-center rounded-full bg-brand text-white">
            <Plus size={14} />
          </button>
        </div>
      ))}
      <p
        aria-live="polite"
        className={`mt-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${diff === 0 ? "bg-ok-soft text-ok" : "bg-saffron-soft text-saffron-dark"}`}
      >
        ₹{total.toLocaleString("en-IN")} of ₹{target.toLocaleString("en-IN")}
        {diff === 0 ? ", counts match" : diff > 0 ? `, ₹${diff.toLocaleString("en-IN")} short` : `, ₹${(-diff).toLocaleString("en-IN")} extra`}
      </p>
    </div>
  );
}

/** Tap a banking word to see it explained in plain language. */
export function WordExplorer({ words }: { words: PortalCopy["words"] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const term = words.terms[active];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <div className="flex flex-wrap gap-2.5" role="tablist" aria-label={words.title}>
        {words.terms.map((t, i) => (
          <button
            key={t.term}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full border px-5 py-2.5 text-lg font-medium transition-colors duration-200 ${
              i === active ? "border-brand bg-brand text-white" : "border-line bg-card text-ink hover:border-brand/40"
            }`}
          >
            {t.term}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="min-h-44 rounded-3xl bg-brand p-7 text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={term.term}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-display text-3xl font-semibold">{term.term}</p>
            <p className="mt-3 text-xl leading-relaxed text-white/90">{term.plain}</p>
            <p className="mt-4 text-white/70">{term.example}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Accordion of common questions; one open at a time. */
export function Faq({ items }: { items: PortalCopy["faq"]["items"] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  return (
    <ul className="divide-y divide-line rounded-3xl border border-line bg-card">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-semibold"
            >
              {item.q}
              <ChevronDown size={20} aria-hidden className={`shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[65ch] px-6 pb-6 text-lg text-muted">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

/** Token box that opens the tracking page. */
export function TrackForm({ copy, initial = "" }: { copy: PortalCopy["track"]; initial?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) router.push(`/track?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      }}
      className="flex w-full max-w-md flex-col gap-2"
    >
      <label htmlFor="track-code" className="text-sm font-medium text-muted">{copy.label}</label>
      <div className="flex gap-2">
        <input
          id="track-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="K7Q-4M2"
          maxLength={7}
          autoComplete="off"
          className="h-14 min-w-0 flex-1 rounded-full border-2 border-line bg-card px-5 text-xl font-semibold tracking-widest text-ink placeholder:text-muted/60 focus:border-brand"
        />
        <button className="inline-flex h-14 items-center gap-2 rounded-full bg-brand px-6 font-semibold text-white hover:bg-brand-dark">
          <Search size={18} aria-hidden /> {copy.button}
        </button>
      </div>
    </form>
  );
}
