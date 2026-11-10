import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock, Info, PackageCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { Reveal } from "@/components/portal/Reveal";
import { StartButton } from "@/components/portal/StartButton";
import { ServiceIcon } from "@/components/serviceMeta";
import { portalLang } from "@/lib/portal/lang";
import { SERVICE_IDS, type ServiceId } from "@/lib/types";

/** One service, in plain words: what we ask, what to bring, how long, then start it directly. */
export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!SERVICE_IDS.includes(id as ServiceId)) notFound();
  const service = id as ServiceId;
  const { lang, copy } = await portalLang();
  const item = copy.services.items[service];
  const others = SERVICE_IDS.filter((x) => x !== service);

  return (
    <PortalShell>
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
        <Link href="/services" className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
          <ArrowLeft size={18} aria-hidden /> {copy.nav.services}
        </Link>
        <Reveal className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <ServiceIcon service={service} size="lg" />
            <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">{item.name}</h1>
            <p className="mt-4 max-w-[40ch] text-xl text-muted">{item.short}</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-lg font-medium">
              <Clock size={18} aria-hidden className="text-brand" /> {copy.services.minutes.replace("{n}", item.time)}
            </span>
            <StartButton lang={lang} label={copy.services.start} service={service} />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <Reveal className="rounded-[1.75rem] border border-line bg-card p-7">
          <h2 className="text-2xl font-semibold">{copy.services.ask}</h2>
          <ol className="mt-6 space-y-4">
            {item.asks.map((a, i) => (
              <li key={a} className="flex gap-4">
                <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand">{i + 1}</span>
                <span className="pt-0.5 text-lg">{a}</span>
              </li>
            ))}
          </ol>
        </Reveal>
        <div className="grid gap-5">
          <Reveal delay={0.05} className="rounded-[1.75rem] bg-saffron-soft p-7">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <PackageCheck size={24} aria-hidden className="text-saffron-dark" /> {copy.services.bring}
            </h2>
            <ul className="mt-5 space-y-3">
              {item.bring.map((b) => (
                <li key={b} className="flex gap-3 text-lg">
                  <CheckCircle2 size={22} aria-hidden className="mt-0.5 shrink-0 text-saffron-dark" /> {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="rounded-[1.75rem] border border-line bg-card p-7">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Info size={22} aria-hidden className="text-brand" /> {copy.services.good}
            </h2>
            <ul className="mt-5 space-y-3">
              {item.facts.map((f) => <li key={f} className="text-lg text-muted">{f}</li>)}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-muted">{copy.services.title}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <Link key={o} href={`/services/${o}`} className="group flex items-center gap-3 rounded-2xl border border-line bg-card p-4 hover:border-brand/40">
              <ServiceIcon service={o} size="sm" />
              <span className="flex-1 font-medium">{copy.services.items[o].name}</span>
              <ArrowUpRight size={18} aria-hidden className="text-muted group-hover:text-ink" />
            </Link>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
