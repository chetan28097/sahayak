"use client";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LANG_COOKIE } from "@/lib/portal/content";
import type { Lang } from "@/lib/types";

const OPTIONS: { lang: Lang; label: string; aria: string }[] = [
  { lang: "kn", label: "ಕನ್ನಡ", aria: "Kannada" },
  { lang: "hi", label: "हिन्दी", aria: "Hindi" },
  { lang: "en", label: "English", aria: "English" },
];

/** The whole portal follows this choice, and the conversation starts in it. */
export function LangSwitcher({ current, size = "md" }: { current: Lang; size?: "md" | "lg" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(lang: Lang) {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  }

  return (
    <div role="radiogroup" aria-label="Language" className={`relative inline-flex rounded-full border border-line bg-card p-1 ${pending ? "opacity-70" : ""}`}>
      {OPTIONS.map((o) => {
        const active = o.lang === current;
        return (
          <button
            key={o.lang}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.aria}
            lang={o.lang}
            onClick={() => choose(o.lang)}
            className={`relative rounded-full font-medium transition-colors duration-200 ${size === "lg" ? "px-5 py-2.5 text-lg" : "px-3.5 py-1.5 text-sm"} ${
              active ? "text-white" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`lang-pill-${size}`}
                className="absolute inset-0 rounded-full bg-brand"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
