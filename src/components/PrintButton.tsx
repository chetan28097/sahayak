"use client";
import { Printer } from "lucide-react";

/** Browser print → "Save as PDF" renders Hindi/Kannada correctly (server PDF libs can't shape Indic scripts). */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">
      <Printer size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />Print or save as PDF
    </button>
  );
}
