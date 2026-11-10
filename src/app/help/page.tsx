import { Hand, Mic } from "lucide-react";
import { Faq } from "@/components/portal/Interactive";
import { PortalShell } from "@/components/portal/PortalShell";
import { Reveal } from "@/components/portal/Reveal";
import { StartButton } from "@/components/portal/StartButton";
import { portalLang } from "@/lib/portal/lang";

export const metadata = { title: "Help | Sahayak" };

export default async function HelpPage() {
  const { lang, copy } = await portalLang();
  return (
    <PortalShell>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <h1 className="text-5xl font-semibold tracking-tight">{copy.help.title}</h1>
          <p className="mt-4 text-xl text-muted">{copy.help.sub}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Reveal className="rounded-[1.75rem] border border-line bg-card p-7">
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <span className="grid size-10 place-items-center rounded-full bg-saffron text-white"><Mic size={20} aria-hidden /></span>
              {copy.help.mic.title}
            </h2>
            <ol className="mt-6 space-y-4">
              {copy.help.mic.steps.map((s, i) => (
                <li key={s} className="flex gap-4 text-lg">
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8"><StartButton lang={lang} label={copy.hero.cta} /></div>
          </Reveal>
          <Reveal delay={0.05} className="rounded-[1.75rem] bg-brand p-7 text-white">
            <Hand size={32} aria-hidden />
            <h2 className="mt-4 text-2xl font-semibold">{copy.help.person.title}</h2>
            <p className="mt-3 text-lg text-white/85">{copy.help.person.body}</p>
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <h2 className="text-3xl font-semibold tracking-tight">{copy.words.title}</h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {copy.words.terms.map((t) => (
              <div key={t.term} className="rounded-2xl border border-line bg-card p-6">
                <dt className="font-display text-2xl font-semibold text-brand">{t.term}</dt>
                <dd className="mt-2 text-lg">{t.plain}</dd>
                <dd className="mt-2 text-muted">{t.example}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="mt-16">
          <h2 className="text-3xl font-semibold tracking-tight">{copy.faq.title}</h2>
          <div className="mt-8"><Faq items={copy.faq.items} /></div>
        </Reveal>
      </section>
    </PortalShell>
  );
}
