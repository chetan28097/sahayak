/**
 * Bank-side workflow for a submitted request. A QR/slip is a *submission*, never a
 * completion: an officer must verify each checklist item (originals, signatures,
 * declarations, flags) before the request can be completed. Pure functions; the API
 * applies them and records an audit event for every action.
 */
import type { FilledForm } from "./bankForms";

export type RequestStatus = "waiting" | "in_review" | "needs_info" | "verified" | "completed" | "rejected";
export const REQUEST_STATUSES: readonly RequestStatus[] = ["waiting", "in_review", "needs_info", "verified", "completed", "rejected"];
export const OPEN_STATUSES: readonly RequestStatus[] = ["waiting", "in_review", "needs_info", "verified"];

export type ChecklistKind = "flag" | "document" | "signature" | "record";
export interface ChecklistItem {
  id: string;
  label: string;
  kind: ChecklistKind;
}
export type ChecklistState = Record<string, { by: string; at: string }>;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** Everything a staff member must check or obtain before the request can be completed. */
export function checklistFor(form: FilledForm, kind: "application" | "assist" = "application"): ChecklistItem[] {
  if (kind === "assist") return [{ id: "helped", label: "Customer has been helped", kind: "record" }];
  const items: ChecklistItem[] = form.flags.map((f) => ({ id: `flag-${slug(f)}`, label: f, kind: "flag" as const }));
  const cardSections = form.sections.filter((s) => s.fields.some((x) => x.source === "card"));
  if (cardSections.length) {
    items.push({ id: "card-match", label: "Details read from the card photo match the original document", kind: "document" });
  }
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.source !== "counter") continue;
      const signature = /signature|thumb|consent|mandate|opt-out/i.test(field.label);
      items.push({ id: `${slug(section.title)}-${field.id}`, label: field.label, kind: signature ? "signature" : "document" });
    }
    if (section.table) {
      const pending = section.table.rows.some((row) => row.includes("collect at counter"));
      if (pending) items.push({ id: `${slug(section.title)}-table`, label: `${section.title}: complete missing entries`, kind: "document" });
    }
  }
  items.push({ id: "read-back", label: "Customer confirms the printed form matches what they said", kind: "record" });
  return items;
}

export function pendingItems(items: ChecklistItem[], state: ChecklistState): ChecklistItem[] {
  return items.filter((i) => !state[i.id]);
}

export type WorkflowAction =
  | "claim" | "verify" | "unverify" | "request_info" | "escalate" | "deescalate" | "complete" | "reject" | "reopen" | "note";

export interface WorkflowRecord {
  status: RequestStatus;
  checklist: ChecklistState;
  escalated: boolean;
  assignedTo: string | null;
}

export interface ActionInput {
  action: WorkflowAction;
  item?: string;
  note?: string;
}

export type ActionResult =
  | { ok: true; patch: Partial<WorkflowRecord>; event: { action: WorkflowAction; note: string | null } }
  | { ok: false; error: string };

const NOTE_REQUIRED: WorkflowAction[] = ["request_info", "escalate", "reject"];

export function applyAction(rec: WorkflowRecord, items: ChecklistItem[], input: ActionInput, actor: string, now: string): ActionResult {
  const note = input.note?.trim() || null;
  if (NOTE_REQUIRED.includes(input.action) && !note) return { ok: false, error: "Please write a short reason." };
  const closed = rec.status === "completed" || rec.status === "rejected";
  const event = (n: string | null = note) => ({ action: input.action, note: n });

  switch (input.action) {
    case "claim":
      if (closed) return { ok: false, error: "This request is already closed. Re-open it first." };
      return { ok: true, patch: { status: rec.status === "waiting" || rec.status === "needs_info" ? "in_review" : rec.status, assignedTo: actor }, event: event() };
    case "verify":
    case "unverify": {
      if (closed) return { ok: false, error: "Re-open the request to change verification." };
      const item = items.find((i) => i.id === input.item);
      if (!item) return { ok: false, error: "Unknown checklist item." };
      const checklist = { ...rec.checklist };
      if (input.action === "verify") checklist[item.id] = { by: actor, at: now };
      else delete checklist[item.id];
      const allDone = pendingItems(items, checklist).length === 0;
      const status: RequestStatus =
        rec.status === "needs_info" ? "needs_info" : allDone ? "verified" : rec.status === "verified" ? "in_review" : rec.status === "waiting" ? "in_review" : rec.status;
      return { ok: true, patch: { checklist, status, assignedTo: rec.assignedTo ?? actor }, event: event(item.label) };
    }
    case "request_info":
      if (closed) return { ok: false, error: "This request is already closed." };
      return { ok: true, patch: { status: "needs_info" }, event: event() };
    case "escalate":
      return { ok: true, patch: { escalated: true }, event: event() };
    case "deescalate":
      return { ok: true, patch: { escalated: false }, event: event() };
    case "complete": {
      if (closed) return { ok: false, error: "This request is already closed." };
      const left = pendingItems(items, rec.checklist);
      if (left.length) return { ok: false, error: `Verify ${left.length} more item${left.length === 1 ? "" : "s"} first: ${left[0].label}.` };
      return { ok: true, patch: { status: "completed", escalated: false }, event: event() };
    }
    case "reject":
      if (closed) return { ok: false, error: "This request is already closed." };
      return { ok: true, patch: { status: "rejected" }, event: event() };
    case "reopen":
      if (!closed) return { ok: false, error: "Only closed requests can be re-opened." };
      return { ok: true, patch: { status: pendingItems(items, rec.checklist).length ? "in_review" : "verified" }, event: event() };
    case "note":
      if (!note) return { ok: false, error: "Write a note first." };
      return { ok: true, patch: {}, event: event() };
  }
}

/** One sentence telling the officer what to do now. */
export function nextAction(rec: WorkflowRecord, items: ChecklistItem[], urgent: boolean): string {
  const left = pendingItems(items, rec.checklist);
  switch (rec.status) {
    case "waiting":
      return urgent ? "Urgent: start this now." : "Start the review when the customer reaches the counter.";
    case "needs_info":
      return "Waiting for the customer to provide what was asked. Resume the review when they return.";
    case "in_review":
      return left.length ? `Verify ${left.length} item${left.length === 1 ? "" : "s"}, starting with: ${left[0].label}.` : "Everything is verified. Complete the request.";
    case "verified":
      return "All items verified. Complete the bank-side action and mark it completed.";
    case "completed":
      return "Completed. No action needed.";
    case "rejected":
      return "Not accepted. The customer was told to see staff.";
  }
}
