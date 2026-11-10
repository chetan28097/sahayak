"use client";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import type { Lang } from "@/lib/types";
import { LangSwitcher } from "./LangSwitcher";
import { StartButton } from "./StartButton";

export function MobileNav({ links, lang, startLabel }: { links: { href: string; label: string }[]; lang: Lang; startLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid size-11 place-items-center rounded-full border border-line bg-card"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-16 border-b border-line bg-paper px-4 pb-6 pt-2 shadow-lg"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-4 text-lg font-medium">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-5 flex flex-col items-start gap-4">
              <LangSwitcher current={lang} size="lg" />
              <StartButton lang={lang} label={startLabel} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
