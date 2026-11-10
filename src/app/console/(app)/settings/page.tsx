import { SettingsForm } from "@/components/console/SettingsForm";
import { currentConfig } from "@/lib/config";
import { GEMINI_MODEL, geminiAvailable, liveVoiceAvailable, MOCK_FORCED } from "@/server/config";
import { currentStaff } from "@/server/staff";
import { repo } from "@/server/store";

function Row({ k, v, ok }: { k: string; v: string; ok: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-muted">{k}</dt>
      <dd className={`text-right font-medium ${ok ? "text-ok" : "text-saffron-dark"}`}>{v}</dd>
    </div>
  );
}

export default async function SettingsPage() {
  const staff = await currentStaff();
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted">Branch rules and staff. Changes apply to new customers straight away.</p>
      </header>
      <SettingsForm initial={currentConfig()} canEdit={staff?.role === "manager"} />
      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="mb-1 text-lg font-semibold">System</h2>
        <dl className="divide-y divide-line text-sm">
          <Row k="Speech (Gnani Vachana)" v={liveVoiceAvailable() ? "Connected" : MOCK_FORCED ? "Practice mode (no external calls)" : "Not configured"} ok={liveVoiceAvailable()} />
          <Row k="Understanding (Gemini)" v={geminiAvailable() ? `On, ${GEMINI_MODEL}` : "Off, rules only"} ok={geminiAvailable()} />
          <Row k="Storage" v={repo.kind === "supabase" ? "Supabase (row-level security on)" : "Local files"} ok={repo.kind === "supabase"} />
        </dl>
      </section>
    </div>
  );
}
