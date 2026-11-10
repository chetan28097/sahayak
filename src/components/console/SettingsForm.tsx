"use client";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BankConfig, Staff } from "@/lib/config";

const LEAVES = ["10", "25", "50"] as const;
const FACILITIES = [["atm_card", "ATM / RuPay card"], ["cheque_book", "Cheque book"], ["sms", "SMS alerts"], ["mobile_banking", "Mobile banking"]] as const;
const SCHEMES = [["pmjjby", "PMJJBY (life cover)"], ["pmsby", "PMSBY (accident cover)"], ["apy", "Atal Pension Yojana"]] as const;
const LANGS = [["kn", "Kannada"], ["hi", "Hindi"], ["en", "English"]] as const;

function toggle<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-line bg-card p-5">
      <legend className="px-1 text-lg font-semibold">{title}</legend>
      {hint && <p className="mb-3 text-sm text-muted">{hint}</p>}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

export function SettingsForm({ initial, canEdit }: { initial: BankConfig; canEdit: boolean }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<BankConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof BankConfig>(key: K, value: BankConfig[K]) => setCfg((c) => ({ ...c, [key]: value }));
  const setStaff = (i: number, patch: Partial<Staff>) => set("staff", cfg.staff.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  async function save() {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/console/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config: cfg }) }).catch(() => null);
    setSaving(false);
    const body = (await res?.json().catch(() => ({}))) as { error?: string };
    if (res?.ok) {
      setStatus({ ok: true, text: "Saved. The kiosk uses the new settings for new customers." });
      router.refresh();
    } else setStatus({ ok: false, text: body.error ?? "Could not save. Try again." });
  }

  const input = "w-full rounded-lg border border-line bg-card px-3 py-2 disabled:bg-paper";
  const check = (checked: boolean, onChange: () => void, label: string) => (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={!canEdit} className="size-4 accent-brand" />
      {label}
    </label>
  );

  return (
    <div className="space-y-4">
      {!canEdit && <p className="rounded-lg bg-brand-soft px-3 py-2 text-brand">Only the branch manager can change these settings.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Branch">
          <label className="block text-sm">Branch name<input className={input} value={cfg.branch} disabled={!canEdit} onChange={(e) => set("branch", e.target.value)} /></label>
          <label className="block text-sm">IFSC<input className={input} value={cfg.ifsc} disabled={!canEdit} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} /></label>
          <div className="text-sm">
            <p className="mb-1">Languages on the kiosk</p>
            <div className="flex flex-wrap gap-4">{LANGS.map(([id, label]) => <span key={id}>{check(cfg.languages.includes(id), () => set("languages", toggle(cfg.languages, id)), label)}</span>)}</div>
          </div>
        </Section>

        <Section title="Cash deposits" hint="Income-tax Rule 114B requires PAN (or Form 60) for cash deposits of ₹50,000 or more.">
          <label className="block text-sm">PAN or Form 60 required from (₹)<input type="number" className={input} value={cfg.panThreshold} disabled={!canEdit} onChange={(e) => set("panThreshold", Number(e.target.value))} /></label>
          <label className="block text-sm">Largest cash deposit the kiosk accepts (₹)<input type="number" className={input} value={cfg.maxCashDeposit} disabled={!canEdit} onChange={(e) => set("maxCashDeposit", Number(e.target.value))} /></label>
        </Section>

        <Section title="Account opening">
          <div className="text-sm">
            <p className="mb-1">Facilities offered</p>
            <div className="grid grid-cols-2 gap-2">{FACILITIES.map(([id, label]) => <span key={id}>{check(cfg.facilities.includes(id), () => set("facilities", toggle(cfg.facilities, id)), label)}</span>)}</div>
          </div>
          <label className="block text-sm">Most nominees per account
            <select className={input} value={cfg.maxNominees} disabled={!canEdit} onChange={(e) => set("maxNominees", Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </Section>

        <Section title="Schemes and service requests">
          <div className="text-sm">
            <p className="mb-1">Government schemes offered</p>
            <div className="space-y-1.5">{SCHEMES.map(([id, label]) => <div key={id}>{check(cfg.schemes.includes(id), () => set("schemes", toggle(cfg.schemes, id)), label)}</div>)}</div>
          </div>
          <div className="text-sm">
            <p className="mb-1">Cheque book sizes</p>
            <div className="flex gap-4">{LEAVES.map((n) => <span key={n}>{check(cfg.chequeLeaves.includes(n), () => set("chequeLeaves", toggle(cfg.chequeLeaves, n)), `${n} leaves`)}</span>)}</div>
          </div>
        </Section>
      </div>

      <Section title="Staff" hint="People who can sign in to this console. Every action is recorded under their name.">
        <div className="space-y-2">
          {cfg.staff.map((s, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_9rem_9rem_auto]">
              <input aria-label="Name" className={input} value={s.name} disabled={!canEdit} onChange={(e) => setStaff(i, { name: e.target.value })} />
              <input aria-label="Sign-in id" className={input} value={s.id} disabled={!canEdit} onChange={(e) => setStaff(i, { id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
              <select aria-label="Role" className={input} value={s.role} disabled={!canEdit} onChange={(e) => setStaff(i, { role: e.target.value as Staff["role"] })}>
                <option value="teller">Teller</option>
                <option value="officer">Officer</option>
                <option value="manager">Manager</option>
              </select>
              {canEdit && (
                <button type="button" aria-label={`Remove ${s.name}`} onClick={() => set("staff", cfg.staff.filter((_, j) => j !== i))} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        {canEdit && (
          <button type="button" onClick={() => set("staff", [...cfg.staff, { id: "", name: "", role: "teller" }])} className="inline-flex items-center gap-2 font-medium text-brand hover:underline">
            <Plus size={18} aria-hidden /> Add staff member
          </button>
        )}
      </Section>

      {canEdit && (
        <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-3 shadow-sm">
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-50">
            <Save size={18} aria-hidden /> {saving ? "Saving…" : "Save settings"}
          </button>
          {status && <p role="status" className={status.ok ? "text-ok" : "text-danger"}>{status.text}</p>}
        </div>
      )}
    </div>
  );
}
