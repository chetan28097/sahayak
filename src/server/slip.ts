/** Issue a signed request (slip/form) once the read-back is confirmed; create help calls. */
import { randomUUID } from "node:crypto";
import { buildBankForm, type FilledForm } from "@/lib/bankForms";
import { reviewIds, rowsFor, serviceOf, type ParseCtx } from "@/lib/forms";
import { currentStep, type SessionState } from "@/lib/machine";
import { findAccount, repo, type RequestRecord, type SlipField } from "./store";
import { afterSubmit } from "@/lib/afterSubmit";
import { currentConfig } from "@/lib/config";
import { applicationReference, shortCode, signPayload } from "./sign";

const LANG_NAMES = { hi: "Hindi", kn: "Kannada", en: "English" } as const;

export async function issueRequest(state: SessionState, summary: string | null): Promise<RequestRecord> {
  if (!state.form) throw new Error("cannot issue a request before a service is chosen");
  const service = serviceOf(state.form);
  const ids = reviewIds(state.form);
  const base: Omit<ParseCtx, "lang"> = { form: state.form, values: state.values, findAccount };
  const english = rowsFor(ids, { ...base, lang: "en" });
  const local = rowsFor(ids, { ...base, lang: state.lang });
  const rows: SlipField[] = english.map((row) => {
    const loc = local.find((l) => l.stepId === row.stepId);
    return { key: row.stepId, label: row.label, labelLocal: loc?.label ?? row.label, value: row.value, valueLocal: loc?.value ?? row.value };
  });

  const id = randomUUID();
  const code = shortCode();
  const createdAt = new Date().toISOString();
  const readBackAt = state.values.reviewConfirmedAt ?? createdAt;
  const account = state.values.accountNumber ? findAccount(state.values.accountNumber) : undefined;
  const form = buildBankForm(state.form, state.values, account, { code, createdAt, readBackAt });
  const urgent = service.urgent?.(state.values) ?? false;
  const needsStaff = (service.needsStaff?.(state.values) ?? false) || state.staffMode;
  const autoDone = service.autoDone?.(state.values) ?? false;
  const token = signPayload({ v: 3, id, c: code, s: state.form, at: createdAt, rb: readBackAt, u: urgent, form });

  const record: RequestRecord = {
    id,
    code,
    kind: "application",
    sessionId: state.id,
    service: state.form,
    lang: state.lang,
    status: autoDone ? "completed" : "waiting",
    urgent,
    needsStaff,
    escalated: false,
    assignedTo: null,
    checklist: {},
    accountNumber: state.values.accountNumber ?? state.values.existingCif ?? null,
    customerName: account?.holder ?? state.values.name ?? state.values.depositorName ?? null,
    summary: summary ?? form.title,
    form,
    customer: {
      rows,
      notes: state.values.notes,
      amount: state.values.amount,
      after: afterSubmit(state.form, state.values),
      reference: applicationReference(code, createdAt, currentConfig().branch),
    },
    token,
    readBackAt,
    createdAt,
    processedAt: autoDone ? createdAt : null,
    staffNote: null,
  };
  await repo.createRequest(record);
  await repo.addEvent({
    requestId: id,
    at: createdAt,
    actor: "Customer (kiosk)",
    action: autoDone ? "completed" : "submitted",
    note: `Read back and confirmed in ${LANG_NAMES[state.lang]}`,
  });
  return record;
}

/** "Call a staff member": a help request that appears in the counter queue. */
export async function createAssistRequest(state: SessionState): Promise<RequestRecord> {
  const step = currentStep(state);
  const account = state.values.accountNumber ? findAccount(state.values.accountNumber) : undefined;
  const createdAt = new Date().toISOString();
  const id = randomUUID();
  const code = shortCode();
  const doing = state.form ? serviceOf(state.form).id.replace("_", " ") : "choosing a service";
  const form: FilledForm = {
    service: state.form ?? "service_request",
    title: "Customer needs help at the kiosk",
    formRef: "Assistance call",
    flags: [],
    sections: [
      {
        title: "Where they are",
        fields: [
          { id: "language", label: "Language", value: LANG_NAMES[state.lang], source: "system" },
          { id: "task", label: "Doing", value: doing, source: "system" },
          { id: "step", label: "Stuck at", value: step?.id ?? (state.pending ? "confirming an answer" : "start"), source: "system" },
          { id: "lastSaid", label: "Assistant last said", value: state.lastSay.slice(0, 200), source: "system" },
        ],
      },
    ],
  };
  const record: RequestRecord = {
    id, code, kind: "assist", sessionId: state.id, service: state.form ?? "service_request", lang: state.lang,
    status: "waiting", urgent: false, needsStaff: true, escalated: false, assignedTo: null, checklist: {},
    accountNumber: state.values.accountNumber ?? null, customerName: account?.holder ?? null,
    summary: `Help needed: ${doing}`, form, customer: { rows: [] }, token: signPayload({ v: 3, id, c: code, form }),
    readBackAt: createdAt, createdAt, processedAt: null, staffNote: null,
  };
  await repo.createRequest(record);
  await repo.addEvent({ requestId: id, at: createdAt, actor: "Customer (kiosk)", action: "help requested", note: null });
  return record;
}
