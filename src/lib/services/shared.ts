/** Reusable step builders shared by all services. */
import { ACCOUNT_NUMBER_LENGTH, MOBILE_REGEX, PAN_REGEX, panThreshold } from "../bankRules";
import { formatDate, isPlausibleDob, parseDate } from "../dates";
import { t, type MsgKey } from "../i18n";
import { detectYesNo, saysNoPan, stripFillers } from "../intents";
import { extractDigits } from "../numbers";
import { matchOption, type ChoiceOption } from "../options";
import type { Account, ServiceId, Values } from "../types";
import type { ParseCtx, ParseResult, SectionKey, StepDef } from "./types";

export const has = (v: unknown) => v !== undefined && v !== null && v !== "";
export const skipped = (v: Values, id: string) => (v.skipped ?? []).includes(id);
export const spaced = (s: string) => s.split("").join(" ");
export const err = (error: MsgKey, params?: Record<string, string | number>): ParseResult => ({ ok: false, error, params });

export function accountOf(ctx: ParseCtx): Account | undefined {
  return ctx.values.accountNumber ? ctx.findAccount(ctx.values.accountNumber) : undefined;
}

export function holderName(ctx: ParseCtx): string {
  const acc = accountOf(ctx);
  return acc?.holderLocal[ctx.lang] ?? acc?.holder ?? ctx.values.accountHolder ?? "";
}

export function parseName(text: string): string | null {
  // "haan" / "yes" / "ಹೌದು" on its own is an answer to a different question, not a name.
  if (detectYesNo(text) && text.trim().split(/\s+/).length <= 2) return null;
  const name = stripFillers(text);
  const letters = name.replace(/[^\p{L}\p{M}]/gu, "");
  if (letters.length < 2 || /\d/.test(name) || name.length > 60) return null;
  return /^[a-z\s.]+$/i.test(name) ? name.replace(/\b\w/g, (c) => c.toUpperCase()) : name;
}

export function parseAddress(text: string): string | null {
  // Drop a leading "pata galat hai," / "address is wrong," before the new address.
  const address = text
    .replace(/^.*?(galat|ghalat|wrong|गलत|ग़लत|ತಪ್ಪು)\s*(hai|है|ide|ಇದೆ)?\s*[,.:-]?\s*/i, "")
    .replace(/^(my\s+)?(new\s+)?(address|pata|पता|ವಿಳಾಸ)\s*(is|hai|है)?\s*[,.:-]?\s*/i, "")
    .trim();
  return address.replace(/\s/g, "").length >= 8 ? address : null;
}

export function parseMobile(text: string, ctx: ParseCtx): string | null {
  let digits = extractDigits(text, ctx.lang);
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return MOBILE_REGEX.test(digits) ? digits : null;
}

export const speakPhone = (p: string) => `${spaced(p.slice(0, 5))}, ${spaced(p.slice(5))}`;

type Extra = Partial<StepDef>;

export function nameStep(id: keyof Values, section: SectionKey, ask: (ctx: ParseCtx) => string, extra: Extra = {}): StepDef {
  return {
    id,
    section,
    input: "text",
    keys: [id],
    isDone: (v) => has(v[id]) || skipped(v, id),
    ask,
    parse: (text) => {
      const name = parseName(text);
      return name ? { ok: true, patch: { [id]: name } } : err("e.nameInvalid");
    },
    confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: String(patch[id]) }),
    ...extra,
  };
}

export function addressStep(id: "address" | "currentAddress" | "newAddress", section: SectionKey, askKey: MsgKey, extra: Extra = {}): StepDef {
  return {
    ...nameStep(id, section, (ctx) => t(ctx.lang, askKey)),
    parse: (text) => {
      const address = parseAddress(text);
      return address ? { ok: true, patch: { [id]: address } } : err("e.addressInvalid");
    },
    ...extra,
  };
}

export function phoneStep(id: "depositorPhone" | "mobile" | "newMobile", section: SectionKey, askKey: MsgKey, extra: Extra = {}): StepDef {
  return {
    id,
    section,
    input: "phone",
    keys: [id],
    isDone: (v) => has(v[id]) || skipped(v, id),
    ask: (ctx) => t(ctx.lang, askKey),
    parse: (text, ctx) => {
      const phone = parseMobile(text, ctx);
      return phone ? { ok: true, patch: { [id]: phone } } : err("e.phoneInvalid");
    },
    confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: speakPhone(String(patch[id])) }),
    ...extra,
  };
}

export function dateStep(id: "dob", section: SectionKey, ask: (ctx: ParseCtx) => string, extra: Extra = {}): StepDef {
  return {
    id,
    section,
    input: "date",
    keys: [id],
    isDone: (v) => has(v[id]) || skipped(v, id),
    ask,
    parse: (text, ctx) => {
      const iso = parseDate(text, ctx.lang);
      return iso && isPlausibleDob(iso) ? { ok: true, patch: { [id]: iso } } : err("e.dateInvalid");
    },
    confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: formatDate(String(patch[id])) }),
    ...extra,
  };
}

/** Options that depend on branch configuration are recomputed every time they are read. */
export function withDynamicOptions(step: StepDef, options: () => ChoiceOption[]): StepDef {
  Object.defineProperty(step, "options", { get: options, enumerable: true });
  return step;
}

export function choiceStep(id: keyof Values, section: SectionKey, options: ChoiceOption[], extra: Extra = {}): StepDef {
  return {
    id,
    section,
    input: "choice",
    options,
    keys: [id],
    isDone: (v) => has(v[id]) || skipped(v, id),
    ask: (ctx) => t(ctx.lang, `q.${String(id)}` as MsgKey),
    parse: (text, ctx) => {
      const opt = matchOption(text, options);
      if (opt) return { ok: true, patch: { [id]: opt.value } };
      return err("e.choiceUnclear", { options: options.map((x) => x.label[ctx.lang]).join(", ") });
    },
    ...extra,
  };
}

export function yesNoStep(
  id: keyof Values,
  section: SectionKey,
  ask: (ctx: ParseCtx) => string,
  extra: Extra & { ackOnNo?: MsgKey } = {},
): StepDef {
  const { ackOnNo, ...rest } = extra;
  return {
    id,
    section,
    input: "yesno",
    keys: [id],
    isDone: (v) => v[id] !== undefined,
    ask,
    parse: (text) => {
      const yn = detectYesNo(text);
      if (!yn) return err("notHeard");
      return { ok: true, patch: { [id]: yn === "yes" }, ack: yn === "no" ? ackOnNo : undefined };
    },
    ...rest,
  };
}

export function panStep(form: ServiceId, applies: (v: Values) => boolean): StepDef {
  return {
    id: "pan",
    section: form === "deposit" ? "cash" : "identity",
    input: "pan",
    card: "pan",
    keys: ["pan", "form60"],
    applies,
    isDone: (v) => has(v.pan) || v.form60 === true,
    ask: (ctx) => t(ctx.lang, form === "deposit" ? "q.pan.deposit" : "q.pan.account_open"),
    parse: (text) => {
      if (saysNoPan(text)) return { ok: true, patch: { form60: true, pan: undefined }, ack: "form60" };
      const compact = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const match = compact.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
      return match && PAN_REGEX.test(match[0]) ? { ok: true, patch: { pan: match[0], form60: false } } : err("e.panInvalid");
    },
    fromCard: (data) => {
      const pan = data.pan?.toUpperCase().replace(/\s/g, "");
      return pan && PAN_REGEX.test(pan) ? { ok: true, patch: { pan, panScanned: true, form60: false } } : err("e.photoFailed");
    },
    confirm: (patch, ctx) => (patch.pan ? t(ctx.lang, "c.pan", { value: spaced(patch.pan) }) : ""),
  };
}

export const depositPanApplies = (v: Values) => (v.amount ?? 0) >= panThreshold();

/** Account number by voice or passbook photo; confirmation reads back last 4 + holder name. */
export const accountNumberStep: StepDef = {
  id: "accountNumber",
  section: "account",
  input: "digits",
  card: "passbook",
  keys: ["accountNumber", "accountHolder", "holderDob", "holderSchemes", "holderCardLast4", "selfDeposit"],
  isDone: (v) => has(v.accountNumber),
  ask: (ctx) => t(ctx.lang, "q.accountNumber"),
  parse: (text, ctx) => {
    const digits = extractDigits(text, ctx.lang);
    if (digits.length !== ACCOUNT_NUMBER_LENGTH) return err("e.accountLength", { n: ACCOUNT_NUMBER_LENGTH, got: digits.length });
    const account = ctx.findAccount(digits);
    if (!account) return err("e.accountNotFound");
    return {
      ok: true,
      patch: {
        accountNumber: digits,
        accountHolder: account.holder,
        holderDob: account.dob,
        holderSchemes: account.schemes ?? [],
        holderCardLast4: account.cardLast4,
      },
    };
  },
  fromCard: (data, ctx) =>
    data.accountNumber ? (accountNumberStep.parse as NonNullable<StepDef["parse"]>)(data.accountNumber, ctx) : err("e.photoFailed"),
  confirm: (patch, ctx) => {
    const acc = ctx.findAccount(String(patch.accountNumber));
    return t(ctx.lang, "c.accountNumber", {
      last4: spaced(String(patch.accountNumber).slice(-4)),
      holder: acc?.holderLocal[ctx.lang] ?? acc?.holder ?? "",
    });
  },
};

export const reviewStep = (applies?: (v: Values) => boolean): StepDef => ({
  id: "review",
  section: "account",
  input: "review",
  keys: [],
  applies,
  isDone: (v) => has(v.reviewConfirmedAt),
  ask: () => "", // built by the machine (needs all rows)
});
