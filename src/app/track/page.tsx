import { Check, Circle } from "lucide-react";
import { TrackForm } from "@/components/portal/Interactive";
import { PortalShell } from "@/components/portal/PortalShell";
import { Reveal } from "@/components/portal/Reveal";
import { ServiceIcon } from "@/components/serviceMeta";
import { t, type MsgKey } from "@/lib/i18n";
import { portalLang } from "@/lib/portal/lang";
import { repo } from "@/server/store";

export const metadata = { title: "Check your application | Sahayak" };

const STAGE_INDEX: Record<string, number> = { waiting: 0, in_review: 1, needs_info: 1, verified: 2, completed: 3, rejected: 3 };
const STAGE_LABEL = {
  en: ["Submitted", "Being checked", "Verified", "Completed"],
  hi: ["जमा हुआ", "जाँच हो रही", "जाँच पूरी", "पूरा हुआ"],
  kn: ["ಸಲ್ಲಿಸಲಾಗಿದೆ", "ಪರಿಶೀಲನೆ", "ಪರಿಶೀಲಿಸಲಾಗಿದೆ", "ಮುಗಿದಿದೆ"],
} as const;

/** Public status by token: service, stage and what the bank needs. No personal data. */
export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { lang, copy } = await portalLang();
  const raw = (await searchParams).code?.trim().toUpperCase() ?? "";
  const valid = /^[A-Z0-9]{3}-?[A-Z0-9]{3}$/.test(raw);
  const record = valid ? await repo.getRequestByCode(raw) : null;
  const found = record && record.kind === "application" ? record : null;
  const stage = found ? STAGE_INDEX[found.status] : -1;

  return (
    <PortalShell>
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <Reveal>
          <h1 className="text-5xl font-semibold tracking-tight">{copy.track.title}</h1>
          <p className="mt-4 text-xl text-muted">{copy.track.sub}</p>
          <div className="mt-8"><TrackForm copy={copy.track} initial={raw} /></div>
        </Reveal>

        {raw && !found && (
          <p role="alert" className="mt-8 rounded-2xl bg-danger-soft px-5 py-4 text-lg text-danger">
            {valid ? "No application has this token. Check the letters and try again, or ask at the counter." : "A token has 6 letters and numbers, like K7Q-4M2."}
          </p>
        )}

        {found && (
          <Reveal className="mt-10 rounded-[1.75rem] border border-line bg-card p-7">
            <div className="flex items-center gap-4">
              <ServiceIcon service={found.service} size="lg" />
              <div>
                <p className="text-2xl font-semibold">{copy.services.items[found.service].name}</p>
                <p className="text-muted">
                  {found.code}, {new Date(found.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
                </p>
              </div>
            </div>
            <p className="mt-6 text-2xl font-semibold">{t(lang, `ui.status.${found.status}` as MsgKey)}</p>
            {found.status === "needs_info" && found.staffNote && (
              <p className="mt-4 rounded-2xl bg-saffron-soft px-5 py-4 text-lg text-saffron-dark">{found.staffNote}</p>
            )}
            {found.status !== "rejected" && (
              <ol className="mt-8 grid grid-cols-4 gap-2 text-center">
                {STAGE_LABEL[lang].map((label, i) => (
                  <li key={label} className="flex flex-col items-center gap-2">
                    <span aria-hidden className={`grid size-10 place-items-center rounded-full ${i <= stage ? "bg-ok text-white" : "border-2 border-line text-muted"}`}>
                      {i <= stage ? <Check size={18} /> : <Circle size={10} />}
                    </span>
                    <span className={`text-sm ${i <= stage ? "font-semibold" : "text-muted"}`}>{label}</span>
                  </li>
                ))}
              </ol>
            )}
          </Reveal>
        )}
      </section>
    </PortalShell>
  );
}
