"use client";
import { BarChart3, ExternalLink, FolderOpen, Landmark, LogOut, Settings, Users, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/console", label: "Counter", icon: Wallet },
  { href: "/console/applications", label: "Applications", icon: FolderOpen },
  { href: "/console/customers", label: "Customers", icon: Users },
  { href: "/console/report", label: "Report", icon: BarChart3 },
];

/** Slim top bar: the counter screen gets the full width. */
export function ConsoleShell({ children, staffName, branch }: { children: React.ReactNode; staffName: string; branch: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string) =>
    href === "/console" ? pathname === href : href === "/console/applications" ? pathname.startsWith(href) || pathname.startsWith("/console/requests") : pathname.startsWith(href);

  async function logout() {
    await fetch("/api/console/logout", { method: "POST" });
    router.push("/console/login");
  }

  return (
    <div className="min-h-dvh bg-paper">
      <header className="no-print sticky top-0 z-20 border-b border-line bg-card">
        <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
          <Link href="/console" className="mr-3 flex items-center gap-2">
            <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-brand text-white"><Landmark size={18} /></span>
            <span className="hidden font-display font-semibold md:inline">{branch}</span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  active(item.href) ? "bg-brand-soft text-brand" : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                <item.icon size={18} aria-hidden />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <span className="mr-2 hidden text-sm text-muted lg:inline">{staffName}</span>
            <Link href="/" target="_blank" aria-label="Open customer screen" title="Open customer screen" className="grid size-10 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink">
              <ExternalLink size={18} />
            </Link>
            <Link href="/console/settings" aria-label="Settings" title="Settings" className={`grid size-10 place-items-center rounded-lg hover:bg-paper ${active("/console/settings") ? "text-brand" : "text-muted"}`}>
              <Settings size={18} />
            </Link>
            <button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <div className="min-w-0 px-4 py-5 sm:px-6">{children}</div>
    </div>
  );
}
