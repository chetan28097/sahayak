import { Banknote, CreditCard, Landmark, ShieldCheck, UserRoundPen, type LucideIcon } from "lucide-react";
import type { ServiceId } from "@/lib/types";

/** One SVG pictogram + plain label per service (pictures matter for low-literacy users). */
export const SERVICE_META: Record<ServiceId, { icon: LucideIcon; label: string; tone: string }> = {
  deposit: { icon: Banknote, label: "Cash deposit", tone: "bg-ok-soft text-ok" },
  account_open: { icon: Landmark, label: "Account opening", tone: "bg-brand-soft text-brand" },
  scheme_enroll: { icon: ShieldCheck, label: "Insurance & pension", tone: "bg-saffron-soft text-saffron-dark" },
  update_details: { icon: UserRoundPen, label: "Update details", tone: "bg-[#efe9fb] text-[#5b3aa6]" },
  service_request: { icon: CreditCard, label: "Card, cheque, complaint", tone: "bg-[#e3f1f8] text-[#155e86]" },
};

export const STATUS_META: Record<string, { label: string; tone: string }> = {
  waiting: { label: "Waiting", tone: "bg-saffron-soft text-saffron-dark" },
  in_review: { label: "In review", tone: "bg-brand-soft text-brand" },
  needs_info: { label: "Needs info", tone: "bg-[#efe9fb] text-[#5b3aa6]" },
  verified: { label: "Verified", tone: "bg-[#e3f1f8] text-[#155e86]" },
  completed: { label: "Completed", tone: "bg-ok-soft text-ok" },
  rejected: { label: "Rejected", tone: "bg-danger-soft text-danger" },
};

const SIZES = {
  sm: { box: "size-9 rounded-lg", icon: 18 },
  md: { box: "size-12 rounded-xl", icon: 24 },
  lg: { box: "size-16 rounded-2xl", icon: 34 },
} as const;

export function ServiceIcon({ service, size = "md" }: { service: ServiceId; size?: keyof typeof SIZES }) {
  const meta = SERVICE_META[service];
  const s = SIZES[size];
  const Icon = meta.icon;
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center ${s.box} ${meta.tone}`}>
      <Icon size={s.icon} strokeWidth={2} />
    </span>
  );
}
