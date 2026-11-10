/** PMJJBY / PMSBY consent-cum-declaration and APY registration. */
import { ageOn } from "../dates";
import { t } from "../i18n";
import { detectYesNo } from "../intents";
import { parseIndianAmount } from "../numbers";
import { PENSION_OPTIONS, SCHEME_OPTIONS, matchOption } from "../options";
import { PENSION_SLABS, SCHEMES, apyContribution, eligibleSchemes, isEligible, schemeDebit } from "../schemes";
import type { Lang, SchemeId, Values } from "../types";
import { nomineeSteps } from "./nominees";
import { currentConfig } from "../config";
import { accountNumberStep, dateStep, err, has, reviewStep, withDynamicOptions, yesNoStep } from "./shared";
import type { ParseResult, ServiceDef, StepDef } from "./types";

export const holderAge = (v: Values): number | undefined => {
  const dob = v.dob ?? v.holderDob;
  return dob ? ageOn(dob) : undefined;
};

function checkScheme(scheme: SchemeId, v: Values, lang: Lang): ParseResult {
  const age = holderAge(v);
  if (age === undefined) return { ok: true, patch: { scheme } };
  if ((v.holderSchemes ?? []).includes(scheme)) return err("e.alreadyEnrolled");
  if (scheme === "apy" && v.taxPayer) return err("apyTaxPayer");
  if (!isEligible(scheme, age)) {
    const options = eligibleSchemes(age, v.holderSchemes ?? []);
    const others = options.length
      ? t(lang, "e.schemeOthers", { list: options.map((s) => SCHEME_OPTIONS.find((o) => o.value === s)!.label[lang]).join(", ") })
      : t(lang, "e.schemeNone");
    return err("e.schemeAge", { min: SCHEMES[scheme].minAge, max: SCHEMES[scheme].maxAge, age, others });
  }
  return { ok: true, patch: { scheme } };
}

const schemeStep: StepDef = {
  id: "scheme",
  section: "scheme",
  input: "choice",
  options: SCHEME_OPTIONS,
  keys: ["scheme", "pensionSlab", "healthOk", "autoDebitConsent", "schemeElsewhere", "taxPayer"],
  isDone: (v) => has(v.scheme) && checkScheme(v.scheme!, v, "en").ok,
  ask: (ctx) => {
    const preset = ctx.values.scheme;
    if (preset) {
      const r = checkScheme(preset, ctx.values, ctx.lang);
      if (!r.ok) return t(ctx.lang, r.error, r.params);
    }
    return t(ctx.lang, "q.scheme");
  },
  parse: (text, ctx) => {
    const offered = offeredSchemes();
    const opt = matchOption(text, offered);
    if (!opt) return err("e.choiceUnclear", { options: offered.map((o) => o.label[ctx.lang]).join(", ") });
    return checkScheme(opt.value as SchemeId, ctx.values, ctx.lang);
  },
};
const offeredSchemes = () => SCHEME_OPTIONS.filter((o) => currentConfig().schemes.includes(o.value as SchemeId));
withDynamicOptions(schemeStep, offeredSchemes);

const pensionStep: StepDef = {
  id: "pensionSlab",
  section: "scheme",
  input: "choice",
  options: PENSION_OPTIONS,
  keys: ["pensionSlab", "autoDebitConsent"],
  applies: (v) => v.scheme === "apy",
  isDone: (v) => has(v.pensionSlab),
  ask: (ctx) => t(ctx.lang, "q.pensionSlab"),
  parse: (text, ctx) => {
    const amount = parseIndianAmount(text, ctx.lang);
    const slab = PENSION_SLABS.find((s) => s === amount);
    return slab ? { ok: true, patch: { pensionSlab: slab } } : err("e.choiceUnclear", { options: PENSION_SLABS.join(", ") });
  },
  confirm: (patch, ctx) =>
    t(ctx.lang, "c.pensionSlab", {
      slab: String(patch.pensionSlab),
      c: String(apyContribution(holderAge(ctx.values) ?? 0, Number(patch.pensionSlab)) ?? "?"),
    }),
};

/** APY is closed to income-tax payers (since 1 Oct 2022): "yes" clears the choice and re-asks. */
const taxPayerStep: StepDef = {
  id: "taxPayer",
  section: "scheme",
  input: "yesno",
  keys: ["taxPayer"],
  applies: (v) => v.scheme === "apy",
  isDone: (v) => v.taxPayer !== undefined,
  ask: (ctx) => t(ctx.lang, "q.taxPayer"),
  parse: (text) => {
    const yn = detectYesNo(text);
    if (!yn) return err("notHeard");
    return yn === "yes"
      ? { ok: true, patch: { taxPayer: true, scheme: undefined, pensionSlab: undefined }, ack: "apyTaxPayer" }
      : { ok: true, patch: { taxPayer: false } };
  },
};

const consentStep: StepDef = {
  id: "autoDebitConsent",
  section: "scheme",
  input: "yesno",
  keys: ["autoDebitConsent"],
  isDone: (v) => v.autoDebitConsent === true,
  ask: (ctx) => {
    const v = ctx.values;
    const debit = v.scheme ? schemeDebit(v.scheme, holderAge(v) ?? 0, v.pensionSlab) : null;
    return t(ctx.lang, "q.consent", {
      premium: String(debit?.amount ?? ""),
      freq: t(ctx.lang, debit?.freq === "month" ? "freq.month" : "freq.year"),
    });
  },
  parse: (text) => {
    const yn = detectYesNo(text);
    if (yn === "yes") return { ok: true, patch: { autoDebitConsent: true } };
    return err(yn === "no" ? "e.needConsent" : "notHeard");
  },
};

export const SCHEME_ENROLL: ServiceDef = {
  id: "scheme_enroll",
  steps: [
    accountNumberStep,
    dateStep("dob", "scheme", (ctx) => t(ctx.lang, "q.dob"), { applies: (v) => !v.holderDob }),
    schemeStep,
    taxPayerStep,
    pensionStep,
    // One PMJJBY/PMSBY/APY per person across all banks.
    yesNoStep("schemeElsewhere", "scheme", (ctx) => t(ctx.lang, "q.schemeElsewhere"), {
      applies: (v) => has(v.scheme),
      parse: (text) => {
        const yn = detectYesNo(text);
        if (!yn) return err("notHeard");
        return { ok: true, patch: { schemeElsewhere: yn === "yes" }, ack: yn === "yes" ? "staffWillCheck" : undefined };
      },
    }),
    yesNoStep("healthOk", "scheme", (ctx) => t(ctx.lang, "q.healthOk"), {
      applies: (v) => v.scheme === "pmjjby",
      ackOnNo: "staffWillCheck",
    }),
    ...nomineeSteps(1, (v) => has(v.scheme)),
    consentStep,
    reviewStep(),
  ],
  doneKey: () => "done.scheme_enroll",
  needsStaff: (v) => v.healthOk === false || v.schemeElsewhere === true,
};
