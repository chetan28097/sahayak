import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { Reveal } from "@/components/portal/Reveal";
import { ServiceIcon } from "@/components/serviceMeta";
import { portalLang } from "@/lib/portal/lang";
import { SERVICE_IDS } from "@/lib/types";

export const metadata = { title: "Services | Sahayak" };

export default async function ServicesPage() {
  const { copy } = await portalLang();
  return (
    <PortalShell>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <h1 className="text-5xl font-semibold tracking-tight">{copy.services.title}</h1>
          <p className="mt-4 max-w-[48ch] text-xl text-muted">{copy.services.sub}</p>
        </Reveal>
        <ul className="mt-12 space-y-4">
          {SERVICE_IDS.map((id, i) => {
            const item = copy.services.items[id];
            return (
              <Reveal key={id} delay={i * 0.04}>
                <li>
                  <Link
                    href={`/services/${id}`}
                    className="group flex flex-col gap-5 rounded-3xl border border-line bg-card p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center"
                  >
                    <ServiceIcon service={id} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl font-semibold">{item.name}</h2>
                      <p className="mt-1 text-lg text-muted">{item.short}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-muted">
                      <Clock size={18} aria-hidden /> {copy.services.minutes.replace("{n}", item.time)}
                    </span>
                    <ArrowUpRight size={24} aria-hidden className="hidden shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink sm:block" />
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </section>
    </PortalShell>
  );
}
