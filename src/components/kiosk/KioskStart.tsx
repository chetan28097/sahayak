"use client";
import { Loader2, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang, Mode } from "@/lib/types";

export const MODE_KEY = "sahayak.mode";

export function readMode(): Mode {
  try {
    // Live by default; the server downgrades to practice when keys are missing or MOCK_MODE=true.
    return window.localStorage.getItem(MODE_KEY) === "mock" ? "mock" : "live";
  } catch {
    return "live";
  }
}

const LANGS: { lang: Lang; name: string; action: string; htmlLang: string }[] = [
  { lang: "kn", name: "ಕನ್ನಡ", action: "ಮಾತನಾಡಲು ಒತ್ತಿ", htmlLang: "kn" },
  { lang: "hi", name: "हिन्दी", action: "बोलने के लिए दबाइए", htmlLang: "hi" },
  { lang: "en", name: "English", action: "Tap to start", htmlLang: "en" },
];

/** The one action on the kiosk: choose a language, which starts the conversation. */
export function KioskStart({ languages = ["kn", "hi", "en"] }: { languages?: Lang[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Lang | null>(null);
  const [error, setError] = useState(false);

  async function start(lang: Lang) {
    setBusy(lang);
    setError(false);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, mode: readMode() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { id } = (await res.json()) as { id: string };
      router.push(`/session/${id}`);
    } catch {
      setError(true);
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-4">
      {LANGS.filter((l) => languages.includes(l.lang)).map((l) => (
        <button
          key={l.lang}
          type="button"
          lang={l.htmlLang}
          onClick={() => start(l.lang)}
          disabled={busy !== null}
          className="flex min-h-24 items-center gap-5 rounded-2xl bg-brand px-5 py-4 text-left text-white shadow-[0_2px_0_#172b66] transition-colors duration-200 hover:bg-brand-dark active:translate-y-px disabled:opacity-70"
        >
          <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-full bg-saffron text-white">
            {busy === l.lang ? <Loader2 size={30} className="animate-spin" /> : <Mic size={30} strokeWidth={2.2} />}
          </span>
          <span className="min-w-0">
            <span className="font-display block text-3xl font-semibold leading-tight sm:text-4xl">{l.name}</span>
            <span className="block text-lg text-white/85">{l.action}</span>
          </span>
        </button>
      ))}
      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          Could not start. Please try again or ask a staff member. · ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. · कृपया फिर से कोशिश करें।
        </p>
      )}
    </div>
  );
}
