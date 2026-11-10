"use client";
import {
  AlertTriangle, ArrowUpRight, CheckCircle2, ChevronDown, Circle, Clock, FileSignature, FileText, Flag, History,
  Loader2, MessageSquareText, Printer, ShieldAlert, Undo2, UserRound, XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { FieldSource, FilledForm } from "@/lib/bankForms";
import type { ChecklistItem, WorkflowAction } from "@/lib/workflow";
import type { RequestEvent, RequestRecord } from "@/server/store/types";
import { ServiceIcon, STATUS_META } from "../serviceMeta";
import { BankFormView } from "./BankFormView";

interface Data {
  record: RequestRecord;
  items: ChecklistItem[];
  events: RequestEvent[];
  next: string;
}

const LANG = { hi: "Hindi", kn: "Kannada", en: "English" } as const;
const KIND_META: Record<ChecklistItem["kind"], { title: string; icon: typeof Flag }> = {
  flag: { title: "Needs attention", icon: Flag },
  document: { title: "Documents to check", icon: FileText },
  signature: { title: "Signatures and consents", icon: FileSignature },
  record: { title: "Final check", icon: CheckCircle2 },
};
const SOURCE_LABEL: Record<FieldSource, string> = {
  customer: "Customer said (read back)",
  card: "Read from card photo — check original",
  record: "From bank record",
  system: "System",
  counter: "Collect at counter",
};
const ACTION_LABEL: Record<string, string> = {
  submitted: "Submitted by customer",
  completed: "Completed automatically",
  "help requested": "Asked for help",
  claim: "Started review",
  verify: "Verified",
  unverify: "Un-verified",
  request_info: "Asked customer for information",
  escalate: "Escalated",
  deescalate: "Removed escalation",
  complete: "Completed",
  reject: "Rejected",
  reopen: "Re-opened",
  note: "Note",
};

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const waited = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? "just now" : m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
};

function facts(form: FilledForm) {
  return form.sections
    .filter((s) => s.title !== "Verification")
    .flatMap((s) => s.fields)
    .filter((f) => f.value !== null && f.source !== "system");
}

type NoteAction = "request_info" | "escalate" | "reject" | "note";
const NOTE_PROMPT: Record<NoteAction, { title: string; placeholder: string; button: string }> = {
  request_info: { title: "What does the customer need to bring or correct?", placeholder: "e.g. Bring PAN card; nominee date of birth needed", button: "Send to customer" },
  escalate: { title: "Why escalate?", placeholder: "e.g. Unauthorised debit of ₹8,000 — fraud desk", button: "Escalate" },
  reject: { title: "Why can't this be accepted?", placeholder: "e.g. Applicant is a minor — needs guardian account", button: "Reject request" },
  note: { title: "Note for the file", placeholder: "Visible to staff only", button: "Save note" },
};

export function RequestWorkbench({ id, onChanged }: { id: string; onChanged?: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<NoteAction | null>(null);
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/console/requests/${id}`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return setError("Could not load this request. Check the connection and try again.");
    setData((await res.json()) as Data);
  }, [id]);

  useEffect(() => {
    setData(null);
    setNoteFor(null);
    setShowForm(false);
    void load();
  }, [load]);

  async function act(action: WorkflowAction, extra: { item?: string; note?: string } = {}) {
    setBusy(extra.item ?? action);
    setError(null);
    const res = await fetch(`/api/console/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    }).catch(() => null);
    setBusy(null);
    if (!res) return setError("Connection problem. Try again.");
    const body = (await res.json()) as Data & { error?: string };
    if (!res.ok) return setError(body.error ?? "That action is not allowed now.");
    setData(body);
    setNoteFor(null);
    setNote("");
    onChanged?.();
  }

  if (error && !data) {
    return (
      <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-5 text-danger">
        {error}{" "}
        <button type="button" onClick={load} className="font-semibold underline">Retry</button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="grid min-h-64 place-items-center text-muted">
        <Loader2 className="animate-spin" aria-label="Loading" />
      </div>
    );
  }

  const { record, items, events } = data;
  const closed = record.status === "completed" || record.status === "rejected";
  const left = items.filter((i) => !record.checklist[i.id]);
  const st = STATUS_META[record.status];
  const groups = (["flag", "document", "signature", "record"] as const)
    .map((kind) => ({ kind, list: items.filter((i) => i.kind === kind) }))
    .filter((g) => g.list.length);

  return (
    <div className="space-y-4">
      {/* Who and what */}
      <header className={`rounded-xl border bg-card p-5 ${record.urgent && !closed ? "border-danger" : "border-line"}`}>
        <div className="flex flex-wrap items-start gap-4">
          <ServiceIcon service={record.service} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">{record.form.title}</p>
            <h2 className="text-2xl font-semibold">{record.customerName ?? "New customer"}</h2>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span className="font-display font-semibold tracking-wider text-brand">Token {record.code}</span>
              <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden /> waiting {waited(record.createdAt)}</span>
              <span className="inline-flex items-center gap-1"><UserRound size={14} aria-hidden /> spoke {LANG[record.lang]}</span>
              {record.accountNumber && <span>Account ending {record.accountNumber.slice(-4)}</span>}
              {record.assignedTo && <span>With {record.assignedTo}</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {record.urgent && !closed && <span className="rounded-md bg-danger px-2 py-1 text-sm font-semibold text-white">Urgent</span>}
            {record.escalated && <span className="rounded-md bg-[#5b3aa6] px-2 py-1 text-sm font-semibold text-white">Escalated</span>}
            <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${st.tone}`}>{st.label}</span>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-brand-soft px-3 py-2.5 font-medium text-brand">
          <ArrowUpRight size={20} aria-hidden className="mt-0.5 shrink-0" />
          {data.next}
        </p>
        {record.status === "needs_info" && record.staffNote && (
          <p className="mt-2 rounded-lg bg-[#efe9fb] px-3 py-2 text-[#5b3aa6]">Asked for: {record.staffNote}</p>
        )}
      </header>

      {error && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-danger">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-4">
          {/* Verification checklist */}
          <section className="rounded-xl border border-line bg-card p-5" aria-labelledby="verify-h">
            <div className="flex items-baseline justify-between gap-3">
              <h3 id="verify-h" className="text-lg font-semibold">Verify and collect</h3>
              <span className="text-sm text-muted">{items.length - left.length} of {items.length} done</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-paper">
              <div className="h-1.5 rounded-full bg-ok transition-all" style={{ width: `${items.length ? ((items.length - left.length) / items.length) * 100 : 0}%` }} />
            </div>
            <div className="mt-4 space-y-4">
              {groups.map(({ kind, list }) => {
                const Meta = KIND_META[kind];
                return (
                  <div key={kind}>
                    <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-muted">
                      <Meta.icon size={16} aria-hidden /> {Meta.title}
                    </h4>
                    <ul className="space-y-1.5">
                      {list.map((item) => {
                        const done = record.checklist[item.id];
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              disabled={closed || busy !== null}
                              onClick={() => act(done ? "unverify" : "verify", { item: item.id })}
                              className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 disabled:cursor-default ${
                                done ? "border-ok/30 bg-ok-soft" : kind === "flag" ? "border-saffron/40 bg-saffron-soft hover:border-saffron" : "border-line hover:border-brand/50"
                              }`}
                            >
                              {busy === item.id ? (
                                <Loader2 size={20} className="mt-0.5 shrink-0 animate-spin text-muted" aria-hidden />
                              ) : done ? (
                                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                              ) : (
                                <Circle size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className={`block ${kind === "flag" && !done ? "font-medium text-saffron-dark" : ""}`}>{item.label}</span>
                                {done && <span className="block text-xs text-ok">Verified by {done.by}, {time(done.at)}</span>}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* What we know and where it came from */}
          <section className="rounded-xl border border-line bg-card p-5">
            <h3 className="text-lg font-semibold">Information collected</h3>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {facts(record.form).map((f) => (
                <div key={f.id} className="min-w-0">
                  <dt className="text-sm text-muted">{f.label}</dt>
                  <dd className="font-semibold break-words">{f.value}</dd>
                  <dd className={`text-xs ${f.source === "card" ? "text-saffron-dark" : "text-muted"}`}>{SOURCE_LABEL[f.source]}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => setShowForm((v) => !v)} aria-expanded={showForm} className="mt-4 inline-flex items-center gap-1 font-medium text-brand hover:underline">
              <ChevronDown size={18} aria-hidden className={`transition-transform duration-200 ${showForm ? "rotate-180" : ""}`} />
              {showForm ? "Hide the bank form" : "Show the full bank form"}
            </button>
          </section>
          {showForm && <BankFormView form={record.form} />}

          {/* Audit history */}
          <section className="rounded-xl border border-line bg-card p-5" aria-labelledby="hist-h">
            <h3 id="hist-h" className="flex items-center gap-2 text-lg font-semibold"><History size={18} aria-hidden /> History</h3>
            <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
              {events.map((e, i) => (
                <li key={e.id ?? i} className="relative">
                  <span aria-hidden className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-brand" />
                  <p className="text-sm">
                    <span className="font-semibold">{ACTION_LABEL[e.action] ?? e.action}</span>
                    {e.note && <span className="text-muted"> — {e.note}</span>}
                  </p>
                  <p className="text-xs text-muted">{e.actor}, {time(e.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Actions */}
        <aside className="h-fit space-y-3 rounded-xl border border-line bg-card p-5 xl:sticky xl:top-[4.75rem]">
          <h3 className="font-semibold">Actions</h3>
          {closed ? (
            <button type="button" disabled={busy !== null} onClick={() => act("reopen")} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-line px-4 py-2.5 font-semibold">
              <Undo2 size={18} aria-hidden /> Re-open
            </button>
          ) : (
            <>
              {(record.status === "waiting" || record.status === "needs_info") && (
                <button type="button" disabled={busy !== null} onClick={() => act("claim")} className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white disabled:opacity-50">
                  {record.status === "needs_info" ? "Customer is back — resume review" : "Start review"}
                </button>
              )}
              <button
                type="button"
                disabled={busy !== null || left.length > 0}
                onClick={() => act("complete")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-ok px-4 py-3 font-semibold text-white disabled:bg-paper disabled:text-muted"
              >
                <CheckCircle2 size={20} aria-hidden />
                {left.length ? `Complete (${left.length} to verify)` : "Complete request"}
              </button>
              <button type="button" onClick={() => setNoteFor("request_info")} className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left font-medium hover:border-brand/50">
                <MessageSquareText size={18} aria-hidden /> Ask customer for something
              </button>
              {record.escalated ? (
                <button type="button" onClick={() => act("deescalate")} className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left font-medium">
                  <ShieldAlert size={18} aria-hidden /> Remove escalation
                </button>
              ) : (
                <button type="button" onClick={() => setNoteFor("escalate")} className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left font-medium hover:border-brand/50">
                  <ShieldAlert size={18} aria-hidden /> Escalate to officer
                </button>
              )}
              <button type="button" onClick={() => setNoteFor("reject")} className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left font-medium text-danger hover:border-danger/50">
                <XCircle size={18} aria-hidden /> Reject
              </button>
            </>
          )}
          <button type="button" onClick={() => setNoteFor("note")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted hover:bg-paper">
            <AlertTriangle size={16} aria-hidden /> Add a note to the file
          </button>

          {noteFor && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void act(noteFor, { note });
              }}
              className="space-y-2 rounded-lg border border-brand/30 bg-brand-soft/50 p-3"
            >
              <label htmlFor="wb-note" className="block text-sm font-semibold">{NOTE_PROMPT[noteFor].title}</label>
              <textarea id="wb-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} placeholder={NOTE_PROMPT[noteFor].placeholder} className="w-full rounded-md border border-line bg-card p-2 text-sm" autoFocus />
              <div className="flex gap-2">
                <button disabled={!note.trim() || busy !== null} className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                  {NOTE_PROMPT[noteFor].button}
                </button>
                <button type="button" onClick={() => setNoteFor(null)} className="rounded-md px-3 py-1.5 text-sm text-muted">Cancel</button>
              </div>
            </form>
          )}

          <Link href={`/console/requests/${record.id}/print`} className="flex items-center gap-2 border-t border-line pt-3 text-sm font-medium text-brand hover:underline">
            <Printer size={16} aria-hidden /> Print the bank form
          </Link>
        </aside>
      </div>
    </div>
  );
}
