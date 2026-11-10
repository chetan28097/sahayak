/** Service requests: cheque book, card hotlisting, passbook, balance (screen only), complaint. */
import { t } from "../i18n";
import { detectYesNo, hasAny } from "../intents";
import {
  CARD_REASON_OPTIONS, CHEQUE_DELIVERY_OPTIONS, CHEQUE_LEAVES_OPTIONS, COMPLAINT_OPTIONS, REQUEST_OPTIONS,
} from "../options";
import { amountInWords } from "../amountWords";
import { formatDate, parseDate } from "../dates";
import { parseIndianAmount } from "../numbers";
import type { Values } from "../types";
import { currentConfig } from "../config";
import { accountNumberStep, choiceStep, err, has, reviewStep, skipped, spaced, withDynamicOptions, yesNoStep } from "./shared";
import type { ServiceDef, StepDef } from "./types";

const is = (type: string) => (v: Values) => v.requestType === type;
const atmDebit = (v: Values) => v.requestType === "complaint" && v.complaintCategory === "atm_debit";
const OK_WORDS = ["ok", "okay", "theek", "ठीक", "sari", "ಸರಿ", "done", "ho gaya", "हो गया", "aaytu", "ಆಯ್ತು"];

const balanceStep: StepDef = {
  id: "balanceInfo",
  section: "request",
  input: "info",
  keys: ["infoSeen"],
  applies: is("balance"),
  isDone: (v) => v.infoSeen === true,
  ask: (ctx) => t(ctx.lang, "q.balanceInfo"),
  parse: (text) =>
    detectYesNo(text) === "yes" || hasAny(text, OK_WORDS) ? { ok: true, patch: { infoSeen: true } } : err("notHeard"),
};

const complaintTextStep: StepDef = {
  id: "complaintText",
  section: "request",
  input: "text",
  keys: ["complaintText"],
  applies: is("complaint"),
  isDone: (v) => has(v.complaintText),
  ask: (ctx) => t(ctx.lang, "q.complaintText"),
  parse: (text) => {
    const clean = text.trim();
    return clean.replace(/[^\p{L}\p{N}]/gu, "").length >= 10
      ? { ok: true, patch: { complaintText: clean.slice(0, 600) } }
      : err("e.complaintShort");
  },
  confirm: (patch, ctx) => t(ctx.lang, "c.complaint", { text: String(patch.complaintText) }),
};

export const SERVICE_REQUEST: ServiceDef = {
  id: "service_request",
  steps: [
    accountNumberStep,
    choiceStep("requestType", "request", REQUEST_OPTIONS, {
      keys: [
        "requestType", "chequeLeaves", "chequeDelivery", "cardReason", "cardReissue", "unauthorisedTxn", "infoSeen",
        "complaintCategory", "complaintText", "complaintDate", "complaintAmount",
      ],
    }),
    withDynamicOptions(choiceStep("chequeLeaves", "request", CHEQUE_LEAVES_OPTIONS, { applies: is("cheque_book") }), () =>
      CHEQUE_LEAVES_OPTIONS.filter((o) => currentConfig().chequeLeaves.includes(o.value as "10")),
    ),
    choiceStep("chequeDelivery", "request", CHEQUE_DELIVERY_OPTIONS, { applies: is("cheque_book") }),
    choiceStep("cardReason", "request", CARD_REASON_OPTIONS, {
      applies: is("block_card"),
      ask: (ctx) => t(ctx.lang, "q.cardReason", { last4: spaced(ctx.values.holderCardLast4 ?? "----") }),
    }),
    // RBI zero-liability depends on prompt reporting of unauthorised debits.
    yesNoStep("unauthorisedTxn", "request", (ctx) => t(ctx.lang, "q.unauthorisedTxn"), {
      applies: is("block_card"),
      parse: (text) => {
        const yn = detectYesNo(text);
        if (!yn) return err("notHeard");
        return { ok: true, patch: { unauthorisedTxn: yn === "yes" }, ack: yn === "yes" ? "staffWillCheck" : undefined };
      },
    }),
    yesNoStep("cardReissue", "request", (ctx) => t(ctx.lang, "q.cardReissue"), { applies: is("block_card") }),
    balanceStep,
    choiceStep("complaintCategory", "request", COMPLAINT_OPTIONS, { applies: is("complaint") }),
    // A failed-ATM/UPI debit claim needs the transaction date and amount.
    {
      id: "complaintDate",
      section: "request",
      input: "date",
      optional: true,
      keys: ["complaintDate"],
      applies: atmDebit,
      isDone: (v) => has(v.complaintDate) || skipped(v, "complaintDate"),
      ask: (ctx) => t(ctx.lang, "q.complaintDate"),
      parse: (text, ctx) => {
        const iso = parseDate(text, ctx.lang);
        return iso && new Date(iso) <= new Date() ? { ok: true, patch: { complaintDate: iso } } : err("e.dateInvalid");
      },
      confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: formatDate(patch.complaintDate) }),
    },
    {
      id: "complaintAmount",
      section: "request",
      input: "amount",
      keys: ["complaintAmount"],
      applies: atmDebit,
      isDone: (v) => has(v.complaintAmount),
      ask: (ctx) => t(ctx.lang, "q.complaintAmount"),
      parse: (text, ctx) => {
        const amount = parseIndianAmount(text, ctx.lang);
        return amount && amount > 0 ? { ok: true, patch: { complaintAmount: amount } } : err("e.amountInvalid");
      },
      confirm: (patch, ctx) => t(ctx.lang, "c.amount", { amount: String(patch.complaintAmount), words: amountInWords(Number(patch.complaintAmount)) }),
    },
    complaintTextStep,
    reviewStep((v) => v.requestType !== "balance"),
  ],
  doneKey: (v) => (v.requestType === "block_card" ? "done.block_card" : v.requestType === "balance" ? "done.balance" : "done.service_request"),
  urgent: (v) => v.requestType === "block_card",
  needsStaff: (v) => v.unauthorisedTxn === true,
  autoDone: (v) => v.requestType === "balance",
};
