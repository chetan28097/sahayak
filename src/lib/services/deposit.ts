/** Cash deposit (pay-in slip). */
import { maxCashDeposit } from "../bankRules";
import { amountInWords } from "../amountWords";
import { t } from "../i18n";
import { detectYesNo } from "../intents";
import { mergeNotes, noteTotal, notesMatch, parseNoteBreakdown } from "../notes";
import { parseIndianAmount } from "../numbers";
import type { Values } from "../types";
import {
  accountNumberStep, depositPanApplies, err, has, holderName, nameStep, panStep, phoneStep, reviewStep,
} from "./shared";
import type { ServiceDef, StepDef } from "./types";

const amountStep: StepDef = {
  id: "amount",
  section: "cash",
  input: "amount",
  keys: ["amount"],
  isDone: (v) => has(v.amount),
  ask: (ctx) => t(ctx.lang, "q.amount"),
  parse: (text, ctx) => {
    const amount = parseIndianAmount(text, ctx.lang);
    if (!amount || amount <= 0) return err("e.amountInvalid");
    if (amount > maxCashDeposit()) return err("e.amountTooHigh");
    return { ok: true, patch: { amount } };
  },
  confirm: (patch, ctx) =>
    t(ctx.lang, "c.amount", { amount: String(patch.amount), words: amountInWords(Number(patch.amount)) }),
};

const notesStep: StepDef = {
  id: "notes",
  section: "cash",
  input: "notes",
  keys: ["notes"],
  isDone: (v) => notesMatch(v.notes, v.amount),
  ask: (ctx) => {
    const { notes, amount } = ctx.values;
    if (!notes || amount === undefined || noteTotal(notes) === 0) return t(ctx.lang, "q.notes");
    const total = noteTotal(notes);
    return t(ctx.lang, "e.notesMismatch", {
      total,
      amount,
      diff: Math.abs(amount - total),
      dir: t(ctx.lang, total < amount ? "dir.short" : "dir.extra"),
    });
  },
  parse: (text, ctx) => {
    const parsed = parseNoteBreakdown(text, ctx.lang);
    if (!parsed) return err("e.notesUnclear");
    const { notes, amount } = ctx.values;
    // A fresh full answer replaces; a follow-up after a mismatch merges ("100 ke 25" fixes one line).
    const merged = notes && !notesMatch(notes, amount) ? mergeNotes(notes, parsed) : parsed;
    return { ok: true, patch: { notes: merged }, ack: notesMatch(merged, amount) ? "notesOk" : undefined };
  },
};

const selfDepositStep: StepDef = {
  id: "selfDeposit",
  section: "depositor",
  input: "yesno",
  keys: ["selfDeposit"],
  isDone: (v) => v.selfDeposit !== undefined,
  ask: (ctx) => t(ctx.lang, "q.selfDeposit", { holder: holderName(ctx) }),
  parse: (text) => {
    const yn = detectYesNo(text);
    return yn ? { ok: true, patch: { selfDeposit: yn === "yes" } } : err("notHeard");
  },
};

const notSelf = (v: Values) => v.selfDeposit === false;

export const DEPOSIT: ServiceDef = {
  id: "deposit",
  steps: [
    accountNumberStep,
    amountStep,
    notesStep,
    panStep("deposit", depositPanApplies),
    selfDepositStep,
    nameStep("depositorName", "depositor", (ctx) => t(ctx.lang, "q.depositorName"), { applies: notSelf }),
    phoneStep("depositorPhone", "depositor", "q.depositorPhone", { applies: notSelf, optional: true }),
    reviewStep(),
  ],
  doneKey: () => "done.deposit",
  needsStaff: (v) => v.form60 === true,
};
