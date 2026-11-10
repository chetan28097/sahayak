"use client";
import { ArrowRight, Loader2, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang, ServiceId } from "@/lib/types";
import { readMode } from "../kiosk/KioskStart";

interface Props {
  lang: Lang;
  label: string;
  service?: ServiceId;
  variant?: "primary" | "quiet";
  size?: "md" | "lg";
}

/** Starts a conversation in the portal language, optionally straight inside a service. */
export function StartButton({ lang, label, service, variant = "primary", size = "lg" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function start() {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, mode: readMode(), ...(service ? { service } : {}) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.push(`/session/${((await res.json()) as { id: string }).id}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  const base = size === "lg" ? "h-14 px-6 text-lg" : "h-11 px-5 text-base";
  const look =
    variant === "primary"
      ? "bg-saffron text-white shadow-[0_6px_20px_-8px_rgba(161,98,7,0.6)] hover:bg-saffron-dark"
      : "border border-line bg-card text-ink hover:border-brand/40";

  return (
    <span className="inline-flex flex-col gap-1.5">
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color] duration-200 active:scale-[0.98] disabled:opacity-70 ${base} ${look}`}
      >
        {busy ? <Loader2 size={20} className="animate-spin" aria-hidden /> : variant === "primary" ? <Mic size={20} aria-hidden /> : null}
        <span lang={lang}>{label}</span>
        {variant === "quiet" && !busy && <ArrowRight size={18} aria-hidden />}
      </button>
      {failed && <span role="alert" className="text-sm text-danger">Could not start. Please try again.</span>}
    </span>
  );
}
