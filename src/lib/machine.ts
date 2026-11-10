/**
 * Conversation state machine. Pure and synchronous: no I/O, no LLM.
 * When rules can't understand an utterance the result is marked `unclear`
 * (with a ready fallback reply); the server may then ask Gemini and call
 * `handleNlu`. If Gemini is down, the fallback is used — the flow never blocks.
 *
 * A visit can hold several jobs: after a slip is issued the assistant asks
 * "anything else?" and a new service starts with the confirmed account carried over.
 */
import { t, hasKey, type MsgKey } from "./i18n";
import { detectFieldMention, detectGlobal, detectYesNo, isQuestion } from "./intents";
import {
  applies, carryOver, findStep, reviewIds, rowFor, rowsFor, stepsFor, type FieldRow, type ParseCtx,
  type ParseResult, type StepDef,
} from "./forms";
import { noteTotal } from "./notes";
import { TASK_OPTIONS, matchIntent } from "./options";
import type { Account, CardData, CardKind, Lang, Mode, NoteBreakdown, ServiceId, Transaction, Values } from "./types";
import { SERVICE_IDS } from "./types";

export const MAX_RETRIES_BEFORE_ESCAPE = 2;

export interface PendingConfirm {
  stepId: string;
  patch: Partial<Values>;
  prompt: string;
}

export interface SessionState {
  id: string;
  lang: Lang;
  mode: Mode;
  form: ServiceId | null;
  values: Values;
  pending: PendingConfirm | null;
  focus: string | null;
  reviewEditing: boolean;
  retries: Record<string, number>;
  staffMode: boolean;
  lastSay: string;
  /** Slips issued during this visit, oldest first. */
  slipIds: string[];
  /** A slip was just issued; waiting for "anything else?". */
  afterSlip: boolean;
  visitEnded: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MachineInput =
  | { type: "text"; text: string }
  | { type: "yes" }
  | { type: "no" }
  | { type: "choose"; value: string }
  | { type: "chooseMany"; values: string[] }
  | { type: "notes"; notes: NoteBreakdown }
  | { type: "skip" }
  | { type: "staff" }
  | { type: "repeat" }
  | { type: "help" }
  | { type: "edit"; stepId: string }
  | { type: "voiceInstead" }
  | { type: "noPan" }
  | { type: "card"; kind: CardKind; data: CardData | null };

export interface NluResult {
  intent: "answer" | "yes" | "no" | "correct" | "question" | "repeat" | "skip" | "staff" | "unclear";
  field?: string;
  value?: string;
}

export interface MachineDeps {
  findAccount: (accountNumber: string) => Account | undefined;
  now: () => string;
}

export interface MachineResult {
  state: SessionState;
  say: string;
  /** Rules couldn't understand; `state`/`say` are the fallback if the LLM can't either. */
  unclear?: boolean;
  /** All steps of the current service complete — the server should issue the slip. */
  done?: boolean;
}

// ── helpers ──────────────────────────────────────────────────────

export function createSession(id: string, lang: Lang, mode: Mode, now: string): SessionState {
  return {
    id, lang, mode, form: null, values: {}, pending: null, focus: null, reviewEditing: false, retries: {},
    staffMode: false, lastSay: t(lang, "greet"), slipIds: [], afterSlip: false, visitEnded: false,
    createdAt: now, updatedAt: now,
  };
}

function ctxOf(s: SessionState, deps: MachineDeps): ParseCtx {
  return { lang: s.lang, form: s.form ?? "deposit", values: s.values, findAccount: deps.findAccount };
}

export function currentStep(s: SessionState): StepDef | null {
  if (!s.form || s.afterSlip || s.visitEnded) return null;
  const steps = stepsFor(s.form);
  if (s.focus) {
    const focused = steps.find((x) => x.id === s.focus);
    if (focused && applies(focused, s.values) && !focused.isDone(s.values)) return focused;
  }
  return steps.find((st) => applies(st, s.values) && !st.isDone(s.values)) ?? null;
}

function scopeOf(s: SessionState, step: StepDef): string[] {
  return step.scope ?? reviewIds(s.form!);
}

function reviewText(s: SessionState, step: StepDef, deps: MachineDeps): string {
  const rows = rowsFor(scopeOf(s, step), ctxOf(s, deps));
  const intro = t(
    s.lang,
    step.id !== "identityConfirm" ? "review.intro.all" : s.values.existingCif ? "review.intro.record" : "review.intro.identity",
  );
  const body = rows.map((r) => `${r.label}: ${r.spoken}.`).join(" ");
  return `${intro} ${body} ${t(s.lang, "review.ask")}`;
}

export function askFor(s: SessionState, deps: MachineDeps): string {
  if (s.visitEnded) return t(s.lang, "visitEnd");
  if (s.afterSlip) return t(s.lang, "anythingElse");
  if (!s.form) return t(s.lang, "greet");
  if (s.pending) return s.pending.prompt;
  const step = currentStep(s);
  if (!step) return "";
  return step.input === "review" ? reviewText(s, step, deps) : step.ask(ctxOf(s, deps));
}

const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");

function update(s: SessionState, patch: Partial<SessionState>, deps: MachineDeps): SessionState {
  return { ...s, ...patch, updatedAt: deps.now() };
}

/** Move on to whatever is next and say it, prefixed by any acknowledgements. */
function advance(s: SessionState, deps: MachineDeps, prefix: string[] = []): MachineResult {
  const next = currentStep(s);
  if (s.form && !next && !s.pending && !s.afterSlip && !s.visitEnded) {
    const say = join(...prefix);
    return { state: update(s, { lastSay: say }, deps), say, done: true };
  }
  const say = join(...prefix, askFor(s, deps));
  return { state: update(s, { lastSay: say }, deps), say };
}

function commit(s: SessionState, step: StepDef, patch: Partial<Values>, deps: MachineDeps): SessionState {
  const values: Values = {
    ...s.values,
    ...patch,
    skipped: (s.values.skipped ?? []).filter((id) => id !== step.id),
    reviewConfirmedAt: step.id === "review" ? patch.reviewConfirmedAt : undefined,
  };
  return update(
    s,
    {
      values,
      pending: null,
      reviewEditing: false,
      focus: s.focus === step.id ? null : s.focus,
      retries: { ...s.retries, [step.id]: 0 },
    },
    deps,
  );
}

function fail(s: SessionState, stepId: string, error: MsgKey, deps: MachineDeps, params?: Record<string, string | number>): MachineResult {
  const retries = (s.retries[stepId] ?? 0) + 1;
  const escape = retries >= MAX_RETRIES_BEFORE_ESCAPE ? t(s.lang, "escape") : undefined;
  const say = join(t(s.lang, error, params), escape);
  return { state: update(s, { retries: { ...s.retries, [stepId]: retries }, lastSay: say }, deps), say };
}

function samePatch(a: Partial<Values>, b: Partial<Values>): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Accept a parsed answer: confirm first if the step reads back, else commit. */
function accept(s: SessionState, step: StepDef, r: Extract<ParseResult, { ok: true }>, deps: MachineDeps): MachineResult {
  const prompt = step.confirm?.(r.patch, ctxOf(s, deps));
  if (prompt) {
    const pending: PendingConfirm = { stepId: step.id, patch: r.patch, prompt };
    return { state: update(s, { pending, lastSay: prompt }, deps), say: prompt };
  }
  const next = commit(s, step, r.patch, deps);
  return advance(next, deps, r.ack ? [t(s.lang, r.ack, { amount: next.values.amount ?? "" })] : []);
}

function acceptOrFail(s: SessionState, step: StepDef, r: ParseResult, deps: MachineDeps): MachineResult {
  return r.ok ? accept(s, step, r, deps) : fail(s, step.id, r.error, deps, r.params);
}

function help(s: SessionState, step: StepDef | null, deps: MachineDeps): MachineResult {
  const id = step?.id.replace(/^nominee\d\w*$/, "nomineeName").replace("wantsNominee", "nomineeName") ?? "";
  const key = hasKey(`help.${id}`) ? (`help.${id}` as MsgKey) : "help.default";
  return advance(s, deps, [t(s.lang, key)]);
}

function editStep(s: SessionState, stepId: string, deps: MachineDeps): MachineResult {
  const step = s.form ? findStep(s.form, stepId) : undefined;
  if (!step) return advance(s, deps);
  let values: Values = { ...s.values, reviewConfirmedAt: undefined };
  if (step.clear) values = { ...values, ...step.clear(values) };
  else for (const key of step.keys) delete values[key];
  values.skipped = (values.skipped ?? []).filter((id) => id !== stepId);
  return advance(update(s, { values, focus: stepId, pending: null, reviewEditing: false }, deps), deps);
}

function confirmReview(s: SessionState, step: StepDef, deps: MachineDeps): MachineResult {
  const patch: Partial<Values> =
    step.id === "identityConfirm" ? { identityConfirmed: true } : { reviewConfirmedAt: deps.now() };
  return advance(commit(s, step, patch, deps), deps);
}

// ── tasks & visit ────────────────────────────────────────────────

function setTask(s: SessionState, form: ServiceId, preset: Partial<Values>, deps: MachineDeps): MachineResult {
  const values: Values = { ...carryOver(s.values), ...preset };
  const next = update(s, { form, values, afterSlip: false, focus: null, pending: null, retries: {}, reviewEditing: false }, deps);
  return advance(next, deps, [t(s.lang, `task.start.${form}` as MsgKey)]);
}

function routeTask(s: SessionState, text: string, deps: MachineDeps): MachineResult | null {
  const intent = matchIntent(text);
  if (!intent) return null;
  return setTask(s, intent.service as ServiceId, (intent.preset ?? {}) as Partial<Values>, deps);
}

/** Called by the server after a slip is issued: say the done message and offer another job. */
export function markIssued(s: SessionState, slipId: string, doneSay: string, deps: MachineDeps): MachineResult {
  const say = join(doneSay, t(s.lang, "anythingElse"));
  return {
    state: update(s, { slipIds: [...s.slipIds, slipId], afterSlip: true, pending: null, focus: null, lastSay: say }, deps),
    say,
  };
}

function handleAfterSlip(s: SessionState, input: MachineInput, deps: MachineDeps): MachineResult {
  const end = () => {
    const say = t(s.lang, "visitEnd");
    return { state: update(s, { afterSlip: false, visitEnded: true, lastSay: say }, deps), say };
  };
  const again = () => {
    const say = t(s.lang, "whatElse");
    return { state: update(s, { afterSlip: false, form: null, values: carryOver(s.values), lastSay: say }, deps), say };
  };
  if (input.type === "choose" && SERVICE_IDS.includes(input.value as ServiceId)) {
    return setTask(s, input.value as ServiceId, {}, deps);
  }
  if (input.type === "yes") return again();
  if (input.type === "no") return end();
  if (input.type === "text") {
    const routed = routeTask(s, input.text, deps);
    if (routed) return routed;
    const yn = detectYesNo(input.text);
    if (yn === "yes") return again();
    if (yn === "no") return end();
    return { ...fail(s, "anythingElse", "notHeard", deps), unclear: true };
  }
  return advance(s, deps);
}

// ── yes / no ─────────────────────────────────────────────────────

function handleYesNo(s: SessionState, yn: "yes" | "no", deps: MachineDeps): MachineResult {
  if (s.pending) {
    const step = findStep(s.form!, s.pending.stepId)!;
    if (yn === "yes") {
      const ack = s.pending.patch.form60 ? [t(s.lang, "form60")] : [];
      return advance(commit(s, step, s.pending.patch, deps), deps, ack);
    }
    return advance(update(s, { pending: null }, deps), deps, [t(s.lang, "okAgain")]);
  }
  const step = currentStep(s);
  if (!step) return advance(s, deps);
  if (step.input === "review") {
    if (yn === "yes") return confirmReview(s, step, deps);
    const say = t(s.lang, "whatToChange");
    return { state: update(s, { reviewEditing: true, lastSay: say }, deps), say };
  }
  if (step.parse) return acceptOrFail(s, step, step.parse(yn === "yes" ? "yes" : "no", ctxOf(s, deps)), deps);
  return advance(s, deps);
}

// ── text ─────────────────────────────────────────────────────────

const NUMERIC_INPUTS = new Set(["digits", "amount", "phone", "pan", "date"]);

function handlePendingText(s: SessionState, text: string, deps: MachineDeps): MachineResult {
  const pending = s.pending!;
  const step = findStep(s.form!, pending.stepId)!;
  const yn = detectYesNo(text);
  const numeric = NUMERIC_INPUTS.has(step.input);
  const r = step.parse?.(text, ctxOf(s, deps));

  if (numeric && r?.ok) {
    // "nahi, 12000" or simply restating a different value → re-confirm the new one.
    if (!samePatch(r.patch, pending.patch)) return accept(update(s, { pending: null }, deps), step, r, deps);
    return handleYesNo(s, "yes", deps);
  }
  if (yn) return handleYesNo(s, yn, deps);
  if (!numeric && r?.ok) return accept(update(s, { pending: null }, deps), step, r, deps);
  const fallback = fail(s, step.id, "notHeard", deps);
  const say = join(fallback.say, pending.prompt);
  return { state: update(fallback.state, { lastSay: say }, deps), say, unclear: true };
}

function reviewFields(s: SessionState, step: StepDef): string[] {
  return scopeOf(s, step).filter((id) => !id.endsWith("Photo"));
}

function applyCorrection(s: SessionState, field: string, text: string, deps: MachineDeps): MachineResult {
  const target = findStep(s.form!, field);
  if (!target) return advance(s, deps);
  const r = target.parse?.(text, ctxOf(s, deps));
  if (r?.ok) return advance(commit(s, target, r.patch, deps), deps, [t(s.lang, "updated")]);
  return editStep(s, field, deps);
}

function handleReviewText(s: SessionState, step: StepDef, text: string, deps: MachineDeps): MachineResult {
  const yn = detectYesNo(text);
  if (yn === "yes") return confirmReview(s, step, deps);
  const field = detectFieldMention(text, reviewFields(s, step));
  if (field) return applyCorrection(s, field, text, deps);
  if (yn === "no") return handleYesNo(s, "no", deps);
  const say = s.reviewEditing ? t(s.lang, "whatToChange") : join(t(s.lang, "notHeard"), t(s.lang, "review.ask"));
  return { state: update(s, { lastSay: say }, deps), say, unclear: true };
}

function handleText(s: SessionState, raw: string, deps: MachineDeps): MachineResult {
  const text = raw.trim();
  const step = currentStep(s);
  if (!text) return fail(s, step?.id ?? "task", "notHeard", deps);

  if (!s.form) {
    const routed = routeTask(s, text, deps);
    if (routed) return routed;
    return { ...fail(s, "task", "notHeard", deps), unclear: true };
  }

  const global = detectGlobal(text);
  if (global === "repeat" || global === "back") return handle(s, { type: "repeat" }, deps);
  if (global === "staff") return handle(s, { type: "staff" }, deps);
  if (global === "skip") return handle(s, { type: "skip" }, deps);
  if (global === "unknown" && step) {
    // "I don't know / don't remember": explain where to find it, then offer buttons or staff.
    const retries = Math.max(s.retries[step.id] ?? 0, MAX_RETRIES_BEFORE_ESCAPE);
    const id = step.id.replace(/^nominee\d\w*$/, "nomineeName");
    const tip = hasKey(`help.${id}`) ? t(s.lang, `help.${id}` as MsgKey) : t(s.lang, "okAgain");
    const say = join(tip, t(s.lang, "escape"), askFor(s, deps));
    return { state: update(s, { retries: { ...s.retries, [step.id]: retries }, lastSay: say }, deps), say };
  }

  if (s.pending) return handlePendingText(s, text, deps);
  if (!step) return advance(s, deps);
  if (step.input === "review") return handleReviewText(s, step, text, deps);

  const r = step.parse?.(text, ctxOf(s, deps));
  if (r?.ok) return accept(s, step, r, deps);
  if (isQuestion(text)) return help(s, step, deps);
  const error: MsgKey = r && !r.ok ? r.error : "notHeard";
  return { ...fail(s, step.id, error, deps, r && !r.ok ? r.params : undefined), unclear: true };
}

// ── cards ────────────────────────────────────────────────────────

function handleCard(s: SessionState, kind: CardKind, data: CardData | null, deps: MachineDeps): MachineResult {
  const step = currentStep(s);
  if (!step) return advance(s, deps);
  if (!data || step.card !== kind || !step.fromCard) return fail(s, step.id, "e.photoFailed", deps);
  return acceptOrFail(s, step, step.fromCard(data, ctxOf(s, deps)), deps);
}

// ── entry points ─────────────────────────────────────────────────

export function handle(s: SessionState, input: MachineInput, deps: MachineDeps): MachineResult {
  if (s.visitEnded) return advance(s, deps);
  if (s.afterSlip && input.type !== "repeat" && input.type !== "staff") return handleAfterSlip(s, input, deps);
  const step = currentStep(s);
  switch (input.type) {
    case "text":
      return handleText(s, input.text, deps);
    case "yes":
    case "no":
      return handleYesNo(s, input.type, deps);
    case "repeat":
      return advance(s, deps);
    case "help":
      return s.pending ? advance(s, deps) : help(s, step, deps);
    case "staff":
      return advance(update(s, { staffMode: true }, deps), deps, [t(s.lang, "staffCalled")]);
    case "skip": {
      if (!step) return advance(s, deps);
      if (step.input === "photo") return handle(s, { type: "voiceInstead" }, deps);
      if (!step.optional) {
        const retries = Math.max(s.retries[step.id] ?? 0, MAX_RETRIES_BEFORE_ESCAPE);
        return advance(update(s, { retries: { ...s.retries, [step.id]: retries } }, deps), deps, [t(s.lang, "cannotSkip")]);
      }
      const values: Values = { ...s.values, skipped: [...(s.values.skipped ?? []), step.id] };
      return advance(update(s, { values, focus: null, pending: null }, deps), deps, [t(s.lang, "skipped")]);
    }
    case "voiceInstead":
      return step?.skipPatch ? advance(commit(s, step, step.skipPatch, deps), deps) : advance(s, deps);
    case "noPan": {
      if (step?.id !== "pan" && step?.id !== "panPhoto") return advance(s, deps);
      return advance(commit(s, step, { form60: true, pan: undefined }, deps), deps, [t(s.lang, "form60")]);
    }
    case "choose": {
      if (!s.form) {
        return SERVICE_IDS.includes(input.value as ServiceId) ? setTask(s, input.value as ServiceId, {}, deps) : advance(s, deps);
      }
      if (input.value === "yes" || input.value === "no") return handleYesNo(s, input.value, deps);
      if (step?.input === "choice" && step.options?.some((o) => o.value === input.value)) {
        // Route through parse so step rules (scheme age limits …) still apply.
        const opt = step.options.find((o) => o.value === input.value)!;
        const r = step.parse ? step.parse(opt.label.en, ctxOf(s, deps)) : { ok: true as const, patch: { [step.id]: input.value } };
        return acceptOrFail(s, step, r, deps);
      }
      return advance(s, deps);
    }
    case "chooseMany": {
      if (step?.input !== "multichoice") return advance(s, deps);
      const picked = input.values.filter((v) => step.options?.some((o) => o.value === v));
      if (!picked.length) return advance(s, deps);
      return advance(commit(s, step, { [step.id]: picked }, deps), deps);
    }
    case "notes": {
      const notesStep = s.form ? findStep(s.form, "notes") : undefined;
      if (!notesStep) return advance(s, deps);
      const next = commit(s, notesStep, { notes: input.notes }, deps);
      const matched = notesStep.isDone(next.values);
      return advance(next, deps, matched ? [t(s.lang, "notesOk", { amount: next.values.amount ?? "" })] : []);
    }
    case "edit":
      return editStep(s, input.stepId, deps);
    case "card":
      return handleCard(s, input.kind, input.data, deps);
  }
}

/** Second chance after the LLM interpreted an utterance rules couldn't. */
export function handleNlu(s: SessionState, nlu: NluResult, deps: MachineDeps): MachineResult | null {
  const step = currentStep(s);
  switch (nlu.intent) {
    case "yes":
    case "no":
      return s.afterSlip ? handleAfterSlip(s, { type: nlu.intent }, deps) : handleYesNo(s, nlu.intent, deps);
    case "repeat":
    case "skip":
    case "staff":
      return handle(s, { type: nlu.intent }, deps);
    case "question":
      return help(s, step, deps);
    case "correct": {
      if (!nlu.field || !s.form || !findStep(s.form, nlu.field)) return null;
      return nlu.value ? applyCorrection(s, nlu.field, nlu.value, deps) : editStep(s, nlu.field, deps);
    }
    case "answer": {
      if (!nlu.value) return null;
      if (!s.form || s.afterSlip) {
        return SERVICE_IDS.includes(nlu.value as ServiceId) ? setTask(s, nlu.value as ServiceId, {}, deps) : null;
      }
      const target = s.pending ? findStep(s.form, s.pending.stepId) : step;
      if (!target?.parse) return null;
      const r = target.parse(nlu.value, ctxOf(s, deps));
      return r.ok ? accept(update(s, { pending: null }, deps), target, r, deps) : null;
    }
    default:
      return null;
  }
}

// ── view model for the UI ────────────────────────────────────────

export interface SessionView {
  id: string;
  lang: Lang;
  mode: Mode;
  form: ServiceId | null;
  phase: "task" | "collect" | "confirm" | "review" | "next" | "ended";
  say: string;
  step: {
    id: string;
    input: StepDef["input"];
    card?: CardKind;
    optional: boolean;
    options: { value: string; label: string }[];
    selected?: string[];
  } | null;
  confirm: { prompt: string; row: FieldRow | null } | null;
  review: { scope: "identity" | "all"; rows: FieldRow[]; missing: string[] } | null;
  fields: FieldRow[];
  notes: { counts: NoteBreakdown; total: number; amount: number } | null;
  info: { balance: number; transactions: Transaction[] } | null;
  progress: { done: number; total: number };
  escape: boolean;
  staffMode: boolean;
  slipIds: string[];
}

function phaseOf(s: SessionState, step: StepDef | null): SessionView["phase"] {
  if (s.visitEnded) return "ended";
  if (s.afterSlip) return "next";
  if (!s.form) return "task";
  if (s.pending) return "confirm";
  if (step?.input === "review") return "review";
  return "collect";
}

export function buildView(s: SessionState, deps: MachineDeps): SessionView {
  const ctx = ctxOf(s, deps);
  const step = currentStep(s);
  const steps = s.form ? stepsFor(s.form).filter((x) => x.input !== "review" && applies(x, s.values)) : [];
  const fields = s.form && !s.afterSlip ? rowsFor(reviewIds(s.form), ctx) : [];
  const taskOptions = TASK_OPTIONS.map((o) => ({ value: o.value, label: o.label[s.lang] }));
  const options = !s.form || s.afterSlip ? taskOptions : (step?.options ?? []).map((o) => ({ value: o.value, label: o.label[s.lang] }));
  const pendingValues = s.pending ? { ...s.values, ...s.pending.patch } : s.values;
  const account = s.values.accountNumber ? deps.findAccount(s.values.accountNumber) : undefined;

  return {
    id: s.id,
    lang: s.lang,
    mode: s.mode,
    form: s.form,
    phase: phaseOf(s, step),
    say: s.lastSay,
    step: step
      ? {
          id: step.id, input: step.input, card: step.card, optional: !!step.optional, options,
          selected: step.input === "multichoice" ? (s.values[step.id as keyof Values] as string[] | undefined) : undefined,
        }
      : !s.form || s.afterSlip
        ? { id: "task", input: "choice", optional: false, options }
        : null,
    confirm: s.pending
      ? {
          prompt: s.pending.prompt,
          row: rowFor(s.pending.stepId.replace(/^panPhoto$/, "pan").replace(/^addressPhoto$/, "newAddress"), pendingValues, {
            ...ctx,
            values: pendingValues,
          }),
        }
      : null,
    review:
      step?.input === "review"
        ? {
            scope: step.id === "identityConfirm" ? "identity" : "all",
            rows: rowsFor(scopeOf(s, step), ctx),
            // Card fields that could not be read: shown as "we will ask you" instead of silently missing.
            missing:
              step.id === "identityConfirm" && s.values.aadhaarScanned
                ? (["name", "dob", "gender", "address"] as const).filter((k) => !s.values[k]).map((k) => t(s.lang, `l.${k}` as MsgKey))
                : [],
          }
        : null,
    fields,
    notes:
      s.form === "deposit" && s.values.amount !== undefined && !s.afterSlip
        ? { counts: s.values.notes ?? {}, total: noteTotal(s.values.notes), amount: s.values.amount }
        : null,
    info:
      step?.input === "info" && account
        ? { balance: account.balance ?? 0, transactions: (account.transactions ?? []).slice(0, 5) }
        : null,
    progress: { done: steps.filter((x) => x.isDone(s.values)).length, total: steps.length },
    escape: (s.retries[step?.id ?? (s.form && !s.afterSlip ? "" : s.afterSlip ? "anythingElse" : "task")] ?? 0) >= MAX_RETRIES_BEFORE_ESCAPE,
    staffMode: s.staffMode,
    slipIds: s.slipIds,
  };
}
