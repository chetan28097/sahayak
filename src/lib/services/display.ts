/** Display + spoken values for filled fields (field card, read-back, customer slip). */
import { amountInWords } from "../amountWords";
import { formatDate } from "../dates";
import { t, type MsgKey } from "../i18n";
import { noteTotal } from "../notes";
import { formatINR, groupDigits } from "../numbers";
import {
  ACCOUNT_TYPE_OPTIONS, CARD_REASON_OPTIONS, FACILITY_OPTIONS, CHEQUE_DELIVERY_OPTIONS, CHEQUE_LEAVES_OPTIONS, COMPLAINT_OPTIONS,
  GENDER_OPTIONS, INCOME_OPTIONS, MARITAL_OPTIONS, OCCUPATION_OPTIONS, PENSION_OPTIONS, REQUEST_OPTIONS,
  SCHEME_OPTIONS, UPDATE_OPTIONS, optionLabel, type ChoiceOption,
} from "../options";
import { apyContribution, schemeDebit } from "../schemes";
import type { Lang, Values } from "../types";
import { nomineeLine } from "./nominees";
import { applies, stepsFor } from "./registry";
import { holderAge } from "./schemes";
import { holderName, skipped, spaced } from "./shared";
import type { ParseCtx } from "./types";

export interface FieldRow {
  stepId: string;
  label: string;
  value: string;
  spoken: string;
}

const OPTIONS_BY_ID: Record<string, ChoiceOption[]> = {
  gender: GENDER_OPTIONS,
  occupation: OCCUPATION_OPTIONS,
  income: INCOME_OPTIONS,
  marital: MARITAL_OPTIONS,
  accountType: ACCOUNT_TYPE_OPTIONS,
  scheme: SCHEME_OPTIONS,
  pensionSlab: PENSION_OPTIONS,
  requestType: REQUEST_OPTIONS,
  chequeLeaves: CHEQUE_LEAVES_OPTIONS,
  chequeDelivery: CHEQUE_DELIVERY_OPTIONS,
  cardReason: CARD_REASON_OPTIONS,
  complaintCategory: COMPLAINT_OPTIONS,
};

/** Steps that never get their own row (folded into another row, or pure navigation). */
const HIDDEN = new Set(["panPhoto", "addressPhoto", "balanceInfo", "identityConfirm", "review", "nomineeShares"]);

function notesText(v: Values, lang: Lang): string {
  const n = v.notes ?? {};
  const parts = (["500", "200", "100", "50", "20", "10"] as const)
    .filter((k) => (n[k] ?? 0) > 0)
    .map((k) => t(lang, "say.note", { d: k, c: n[k] ?? 0 }));
  if ((n.coins ?? 0) > 0) parts.push(t(lang, "say.coins", { c: n.coins ?? 0 }));
  return parts.join(", ");
}

const yesNo = (b: boolean, lang: Lang) => t(lang, b ? "v.yes" : "v.no");

/** Display + spoken value for one step, or null if nothing to show. */
export function rowFor(stepId: string, v: Values, ctx: ParseCtx): FieldRow | null {
  const { lang } = ctx;
  const row = (label: string, value: string, spoken = value): FieldRow => ({ stepId, label, value, spoken });
  const labelKey = `l.${stepId}` as MsgKey;
  if (HIDDEN.has(stepId) || /^nominee\d(Relation|Dob|Guardian|More)$/.test(stepId)) return null;
  if (skipped(v, stepId)) return row(t(lang, labelKey), t(lang, "v.skipped"));

  const nominee = stepId.match(/^nominee(\d)Name$/);
  if (nominee) {
    const i = Number(nominee[1]) - 1;
    const line = nomineeLine(v, i, lang);
    return line ? row(t(lang, "l.nominee", { n: i + 1 }), line) : null;
  }

  switch (stepId) {
    case "accountNumber":
      if (!v.accountNumber) return null;
      return row(
        t(lang, "l.accountNumber"),
        `${groupDigits(v.accountNumber)} · ${v.accountHolder ?? ""}`,
        `${groupDigits(v.accountNumber).split(" ").map(spaced).join(", ")}, ${holderName(ctx)}`,
      );
    case "amount":
      if (v.amount === undefined) return null;
      return row(t(lang, "l.amount"), `${formatINR(v.amount)} (${amountInWords(v.amount)})`, t(lang, "say.rupees", { n: v.amount }));
    case "notes":
      if (!v.notes || noteTotal(v.notes) === 0) return null;
      return row(t(lang, "l.notes"), notesText(v, lang));
    case "pan":
      if (v.form60) return row(t(lang, "l.pan"), t(lang, "v.form60"));
      return v.pan ? row(t(lang, "l.pan"), v.pan, spaced(v.pan)) : null;
    case "selfDeposit":
      return v.selfDeposit === undefined ? null : row(t(lang, "l.selfDeposit"), t(lang, v.selfDeposit ? "v.self" : "v.other"));
    case "depositorPhone":
    case "mobile":
    case "newMobile": {
      const phone = v[stepId];
      return phone ? row(t(lang, labelKey), phone.replace(/(\d{5})(\d{5})/, "$1 $2"), spaced(phone)) : null;
    }
    case "dob":
      return v.dob ? row(t(lang, "l.dob"), formatDate(v.dob)) : null;
    case "aadhaarPhoto":
      return v.aadhaarLast4 ? row(t(lang, "l.aadhaarPhoto"), `XXXX-XXXX-${v.aadhaarLast4}`, `XXXX ${spaced(v.aadhaarLast4)}`) : null;
    case "rekycPhoto":
      return v.rekycLast4 ? row(t(lang, "l.rekycPhoto"), `XXXX-XXXX-${v.rekycLast4}`, `XXXX ${spaced(v.rekycLast4)}`) : null;
    case "livesAtAadhaarAddress":
      return v.livesAtAadhaarAddress ? row(t(lang, "l.currentAddress"), t(lang, "v.sameAsAadhaar")) : null;
    case "declarationOk":
      return v.declarationOk === undefined ? null : row(t(lang, "l.declaration"), t(lang, v.declarationOk ? "v.declOk" : "v.staffCheck"));
    case "pensionSlab": {
      if (!v.pensionSlab) return null;
      const c = apyContribution(holderAge(v) ?? 0, v.pensionSlab);
      return row(t(lang, "l.pensionSlab"), `${formatINR(v.pensionSlab)} → ${formatINR(c ?? 0)}/month`, t(lang, "say.rupees", { n: v.pensionSlab }));
    }
    case "autoDebitConsent": {
      if (!v.autoDebitConsent || !v.scheme) return null;
      const debit = schemeDebit(v.scheme, holderAge(v) ?? 0, v.pensionSlab, new Date());
      const amount = debit ? `${formatINR(debit.amount)} ${t(lang, debit.freq === "month" ? "freq.month" : "freq.year")}` : "";
      return row(t(lang, "l.autoDebitConsent"), `${t(lang, "v.yes")} · ${amount}`);
    }
    case "existingAccount":
      return v.existingCif ? row(t(lang, "l.existingAccount"), t(lang, "v.existingCif", { last4: v.existingCif.slice(-4) })) : null;
    case "existingCustomer":
      return null;
    case "facilities":
      return v.facilities?.length
        ? row(t(lang, "l.facilities"), v.facilities.map((f) => optionLabel(FACILITY_OPTIONS, f, lang)).join(", "))
        : null;
    case "wantsNominee":
      return v.wantsNominee === false ? row(t(lang, "l.wantsNominee"), t(lang, "v.noNominee")) : null;
    case "complaintDate":
      return v.complaintDate ? row(t(lang, "l.complaintDate"), formatDate(v.complaintDate)) : null;
    case "complaintAmount":
      return v.complaintAmount ? row(t(lang, "l.complaintAmount"), formatINR(v.complaintAmount), t(lang, "say.rupees", { n: v.complaintAmount })) : null;
    case "updateWhat":
      return v.updateWhat?.length
        ? row(t(lang, "l.updateWhat"), v.updateWhat.map((w) => optionLabel(UPDATE_OPTIONS, w, lang)).join(", "))
        : null;
    default: {
      const raw = v[stepId as keyof Values];
      if (raw === undefined || raw === "" || raw === null) return null;
      if (typeof raw === "boolean") return row(t(lang, labelKey), yesNo(raw, lang));
      const options = OPTIONS_BY_ID[stepId];
      const shown = options ? optionLabel(options, String(raw), lang) : String(raw);
      return row(t(lang, labelKey), shown);
    }
  }
}

export function rowsFor(stepIds: string[], ctx: ParseCtx): FieldRow[] {
  const steps = stepsFor(ctx.form);
  return stepIds
    .filter((id) => {
      const step = steps.find((s) => s.id === id);
      return !step || applies(step, ctx.values);
    })
    .map((id) => rowFor(id, ctx.values, ctx))
    .filter((r): r is FieldRow => r !== null);
}
