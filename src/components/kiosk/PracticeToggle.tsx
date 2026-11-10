"use client";
import { useEffect, useState } from "react";
import { MODE_KEY, readMode } from "./KioskStart";

/** Staff-facing switch in the footer: live voice (Gnani + Gemini) or practice (scripted, free). */
export function PracticeToggle() {
  const [live, setLive] = useState(true);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setLive(readMode() === "live");
    fetch("/api/config")
      .then((r) => r.json())
      .then((c: { liveVoice: boolean }) => setAvailable(c.liveVoice))
      .catch(() => setAvailable(false));
  }, []);

  function change(next: boolean) {
    setLive(next);
    try {
      window.localStorage.setItem(MODE_KEY, next ? "live" : "mock");
    } catch {
      /* storage blocked: the default applies */
    }
  }

  if (available === null) return null;
  if (!available) return <span className="text-sm text-muted">Practice mode (live voice not configured)</span>;
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
      <input type="checkbox" checked={live} onChange={(e) => change(e.target.checked)} className="size-4 accent-brand" />
      Live voice and AI (uses Gnani and Gemini credits)
    </label>
  );
}
