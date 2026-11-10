import { Landmark } from "lucide-react";
import Link from "next/link";
import { BANK } from "@/lib/bankRules";
import { portalLang } from "@/lib/portal/lang";
import { PracticeToggle } from "../kiosk/PracticeToggle";
import { LangSwitcher } from "./LangSwitcher";
import { MobileNav } from "./MobileNav";
import { StartButton } from "./StartButton";

/** Shared header and footer for every customer-portal page. */
export async function PortalShell({ children }: { children: React.ReactNode }) {
  const { lang, copy } = await portalLang();
  const links = [
    { href: "/services", label: copy.nav.services },
    { href: "/#how", label: copy.nav.how },
    { href: "/help", label: copy.nav.help },
    { href: "/track", label: copy.nav.track },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-paper" lang={lang}>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-brand text-white"><Landmark size={20} /></span>
            <span className="leading-tight">
              <span className="block font-display text-base font-semibold">Sahayak</span>
              <span className="block text-xs text-muted">{BANK.name}</span>
            </span>
          </Link>
          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-[15px] font-medium text-muted transition-colors hover:bg-card hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block"><LangSwitcher current={lang} /></div>
            <div className="hidden md:block"><StartButton lang={lang} label={copy.nav.start} size="md" /></div>
            <MobileNav links={links} lang={lang} startLabel={copy.nav.start} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div>
            <p className="flex items-center gap-2 font-display font-semibold">
              <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-brand text-white"><Landmark size={16} /></span>
              Sahayak
            </p>
            <p className="mt-3 max-w-sm text-sm text-muted">{copy.footer.note}</p>
          </div>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} className="text-muted hover:text-ink">{l.label}</Link></li>
            ))}
          </ul>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="text-muted hover:text-ink">{copy.nav.about}</Link></li>
            <li><Link href="/console" className="text-muted hover:text-ink">{copy.nav.staff}</Link></li>
            <li className="text-muted">{BANK.branch} branch, IFSC {BANK.ifsc}</li>
            <li className="pt-2"><PracticeToggle /></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
