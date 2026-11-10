import { ArrowUpRight, EyeOff, Lock, MessageCircle, MicOff, ShieldCheck, Ticket, Volume2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ResumeBanner } from "@/components/kiosk/ResumeBanner";
import { Faq, NoteCounterMini, TrackForm, WordExplorer } from "@/components/portal/Interactive";
import { LangSwitcher } from "@/components/portal/LangSwitcher";
import { LiveDemo } from "@/components/portal/LiveDemo";
import { PortalShell } from "@/components/portal/PortalShell";
import { Reveal } from "@/components/portal/Reveal";
import { StartButton } from "@/components/portal/StartButton";
import { ServiceIcon } from "@/components/serviceMeta";
import { portalLang } from "@/lib/portal/lang";
import type { ServiceId } from "@/lib/types";
import { ensureAccounts } from "@/server/store";

export const dynamic = "force-dynamic";

const STEP_ICONS: LucideIcon[] = [MessageCircle, Volume2, Ticket];
const PROMISE_ICONS: LucideIcon[] = [ShieldCheck, EyeOff, MicOff, Lock];

function ServiceTile({ id, name, short, className = "", children }: { id: ServiceId; name: string; short: string; className?: string; children?: React.ReactNode }) {
  return (
    <Link
      href={`/services/${id}`}
      className={`group relative flex flex-col justify-between gap-6 overflow-hidden rounded-[1.75rem] border border-line p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <ServiceIcon service={id} size="md" />
        <ArrowUpRight size={22} aria-hidden className="text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
      </div>
      {children}
      <div>
        <h3 className="text-2xl font-semibold">{name}</h3>
        <p className="mt-1.5 max-w-[42ch] text-[17px] text-muted">{short}</p>
      </div>
    </Link>
  );
}

export default async function Home() {
  await ensureAccounts();
  const { lang, copy } = await portalLang();
  const s = copy.services.items;

  return (
    <PortalShell>
      {/* Hero: value + start on the left, the product itself on the right */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-14">
        <ResumeBanner />
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <h1 className="max-w-[15ch] text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">{copy.hero.title}</h1>
            <p className="mt-6 max-w-[34ch] text-xl leading-relaxed text-muted">{copy.hero.sub}</p>
            <div className="mt-8"><LangSwitcher current={lang} size="lg" /></div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StartButton lang={lang} label={copy.hero.cta} />
              <Link href="/services" className="inline-flex h-14 items-center rounded-full px-5 text-lg font-semibold text-brand hover:bg-brand-soft">
                {copy.hero.secondary}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <LiveDemo demo={copy.demo} lang={lang} />
          </Reveal>
        </div>
      </section>

      {/* Services: asymmetric bento, one cell per service */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-4xl font-semibold tracking-tight">{copy.services.title}</h2>
          <p className="mt-3 text-xl text-muted">{copy.services.sub}</p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]">
          <Reveal className="md:col-span-3 md:row-span-2">
            <ServiceTile id="deposit" name={s.deposit.name} short={s.deposit.short} className="h-full bg-[linear-gradient(160deg,#e3f4e8_0%,#ffffff_55%)]">
              <div className="max-w-sm"><NoteCounterMini /></div>
            </ServiceTile>
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.05}>
            <ServiceTile id="account_open" name={s.account_open.name} short={s.account_open.short} className="h-full bg-[linear-gradient(160deg,#e6ecfa_0%,#ffffff_60%)]" />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.1}>
            <div className="grid h-full gap-4 sm:grid-cols-2">
              <ServiceTile id="scheme_enroll" name={s.scheme_enroll.name} short={s.scheme_enroll.short} className="bg-saffron-soft/70" />
              <ServiceTile id="update_details" name={s.update_details.name} short={s.update_details.short} className="bg-card" />
            </div>
          </Reveal>
          <Reveal className="md:col-span-6" delay={0.15}>
            <ServiceTile id="service_request" name={s.service_request.name} short={s.service_request.short} className="bg-card md:flex-row md:items-end">
              <p className="rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3 text-danger md:ml-auto md:max-w-sm">{s.service_request.facts[0]}</p>
            </ServiceTile>
          </Reveal>
        </div>
      </section>

      {/* How a visit works: a real sequence, so numbered */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal><h2 className="max-w-[20ch] text-4xl font-semibold tracking-tight">{copy.how.title}</h2></Reveal>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-3">
            <span aria-hidden className="absolute left-7 right-7 top-7 hidden h-px bg-line md:block" />
            {copy.how.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <Reveal key={step.title} delay={i * 0.08}>
                  <li className="relative">
                    <span className="relative grid size-14 place-items-center rounded-full border-2 border-brand bg-card text-brand">
                      <Icon size={24} aria-hidden />
                      <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-brand text-xs font-semibold text-white">{i + 1}</span>
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
                    <p className="mt-2 max-w-[34ch] text-lg text-muted">{step.body}</p>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Banking words explained: interactive */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-4xl font-semibold tracking-tight">{copy.words.title}</h2>
          <p className="mt-3 text-xl text-muted">{copy.words.sub}</p>
        </Reveal>
        <Reveal delay={0.05} className="mt-10"><WordExplorer words={copy.words} /></Reveal>
        <Link href="/help" className="mt-8 inline-flex items-center gap-1.5 text-lg font-semibold text-brand hover:underline">
          {copy.words.more} <ArrowUpRight size={18} aria-hidden />
        </Link>
      </section>

      {/* Promises: tinted band, 2x2 */}
      <section className="bg-brand-soft">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <Reveal><h2 className="max-w-[14ch] text-4xl font-semibold tracking-tight">{copy.promises.title}</h2></Reveal>
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {copy.promises.items.map((p, i) => {
              const Icon = PROMISE_ICONS[i];
              return (
                <Reveal key={p.title} delay={i * 0.05}>
                  <Icon size={28} aria-hidden className="text-brand" />
                  <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-lg text-muted">{p.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Questions + tracking */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div>
          <Reveal><h2 className="text-4xl font-semibold tracking-tight">{copy.faq.title}</h2></Reveal>
          <Reveal delay={0.05} className="mt-8"><Faq items={copy.faq.items} /></Reveal>
        </div>
        <Reveal delay={0.1} className="lg:pt-20">
          <div className="rounded-3xl border border-line bg-card p-7">
            <h2 className="text-2xl font-semibold">{copy.track.title}</h2>
            <p className="mt-2 text-lg text-muted">{copy.track.sub}</p>
            <div className="mt-5"><TrackForm copy={copy.track} /></div>
          </div>
        </Reveal>
      </section>

      {/* Final call to action */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-[linear-gradient(120deg,#1e3a8a_0%,#172b66_100%)] px-8 py-12 text-white md:flex-row md:items-center md:justify-between md:px-12">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">{copy.final.title}</h2>
              <p className="mt-2 text-xl text-white/80">{copy.final.sub}</p>
            </div>
            <StartButton lang={lang} label={copy.hero.cta} />
          </div>
        </Reveal>
      </section>
    </PortalShell>
  );
}
