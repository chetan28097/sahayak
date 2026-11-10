"use client";
import { History, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const LAST_SESSION_KEY = "sahayak.lastSession";
const RESUME_WINDOW_MS = 2 * 60 * 60 * 1000;

export function rememberSession(id: string, ended: boolean) {
  try {
    if (ended) window.localStorage.removeItem(LAST_SESSION_KEY);
    else window.localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {
    /* storage unavailable: resume just isn't offered */
  }
}

/** "Continue where you left off" for an interrupted visit on this device (within 2 hours). */
export function ResumeBanner() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    let saved: { id: string; at: number } | null = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(LAST_SESSION_KEY) ?? "null");
    } catch {
      saved = null;
    }
    if (!saved || Date.now() - saved.at > RESUME_WINDOW_MS) return;
    fetch(`/api/session/${saved.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { view: { phase: string } } | null) => {
        if (d && d.view.phase !== "ended" && d.view.phase !== "task") setId(saved!.id);
      })
      .catch(() => undefined);
  }, []);

  if (!id) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-saffron bg-saffron-soft p-4">
      <History aria-hidden size={28} className="shrink-0 text-saffron-dark" />
      <p className="min-w-0 flex-1 leading-snug">
        <span lang="kn" className="block font-semibold">ನಿಲ್ಲಿಸಿದಲ್ಲಿಂದ ಮುಂದುವರಿಸಿ</span>
        <span lang="hi" className="block">जहाँ छोड़ा था वहीं से जारी रखें</span>
        <span className="block text-muted">Continue where you left off</span>
      </p>
      <Link href={`/session/${id}`} className="rounded-xl bg-saffron px-5 py-3 text-lg font-semibold text-white">
        Continue
      </Link>
      <button
        type="button"
        aria-label="Start a new visit instead"
        onClick={() => {
          rememberSession(id, true);
          setId(null);
        }}
        className="grid size-11 place-items-center rounded-xl text-saffron-dark hover:bg-white/60"
      >
        <X size={20} />
      </button>
    </div>
  );
}
