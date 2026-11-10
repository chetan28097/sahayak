/** Account opening: bank AOF + CKYC individual + DA-1 nomination. */
import { currentConfig } from "../config";
import { t } from "../i18n";
import { detectYesNo, hasAny, saysNoPan } from "../intents";
import { parseNumberPhrases } from "../numbers";
import {
  ACCOUNT_TYPE_OPTIONS, FACILITY_OPTIONS, GENDER_OPTIONS, INCOME_OPTIONS, MARITAL_OPTIONS, OCCUPATION_OPTIONS,
  incomeBucket, matchAllOptions, matchOption,
} from "../options";
import { isMinor, isPlausibleDob } from "../dates";
import type { CardData, Values } from "../types";
import { nomineeSteps, MAX_NOMINEES } from "./nominees";
import {
  accountNumberStep, addressStep, choiceStep, dateStep, err, has, nameStep, panStep, phoneStep, reviewStep,
  withDynamicOptions, yesNoStep,
} from "./shared";
import type { ServiceDef, StepDef } from "./types";

const IDENTITY = ["name", "dob", "gender", "address"] as const;

export function identityFromCard(data: CardData): Partial<Values> {
  const gender = data.gender ? matchOption(data.gender, GENDER_OPTIONS)?.value : undefined;
  return {
    name: data.name?.trim() || undefined,
    dob: data.dob && /^\d{4}-\d{2}-\d{2}$/.test(data.dob) && isPlausibleDob(data.dob) ? data.dob : undefined,
    gender,
    address: data.address?.trim() || undefined,
    aadhaarLast4: data.aadhaarLast4 && /^\d{4}$/.test(data.aadhaarLast4) ? data.aadhaarLast4 : undefined,
  };
}

/** Customers who already bank with us have a CIF with KYC on record: reuse it, ask only what's new. */
const existingCustomerStep = yesNoStep("existingCustomer", "identity", (ctx) => t(ctx.lang, "q.existingCustomer"));

const existingAccountStep: StepDef = {
  ...accountNumberStep,
  id: "existingAccount",
  section: "identity",
  keys: ["existingCif", "name", "dob", "fatherOrSpouse", "address", "mobile", "aadhaarLast4", "pan", "identityConfirmed"],
  applies: (v) => v.existingCustomer === true,
  isDone: (v) => has(v.existingCif),
  ask: (ctx) => t(ctx.lang, "q.existingAccount"),
  parse: (text, ctx) => {
    const r = accountNumberStep.parse!(text, ctx);
    if (!r.ok) return r;
    const acc = ctx.findAccount(String(r.patch.accountNumber))!;
    return {
      ok: true,
      patch: {
        existingCif: acc.accountNumber,
        name: acc.holder,
        dob: acc.dob,
        fatherOrSpouse: acc.fatherOrSpouse,
        address: acc.address,
        mobile: acc.mobile,
        aadhaarLast4: acc.aadhaarLast4,
        pan: acc.pan,
      },
    };
  },
  fromCard: (data, ctx) => (data.accountNumber ? existingAccountStep.parse!(data.accountNumber, ctx) : err("e.photoFailed")),
  confirm: (patch, ctx) => accountNumberStep.confirm!({ accountNumber: patch.existingCif }, ctx),
};

const aadhaarPhotoStep: StepDef = {
  id: "aadhaarPhoto",
  section: "identity",
  input: "photo",
  card: "aadhaar",
  keys: ["aadhaarScanned", "identityConfirmed", ...IDENTITY, "aadhaarLast4", "livesAtAadhaarAddress"],
  skipPatch: { aadhaarScanned: false },
  applies: (v) => v.existingCustomer === false,
  isDone: (v) => v.aadhaarScanned !== undefined,
  ask: (ctx) => t(ctx.lang, "q.aadhaarPhoto"),
  fromCard: (data) =>
    data.name ? { ok: true, patch: { ...identityFromCard(data), aadhaarScanned: true } } : err("e.photoFailed"),
};

const identityConfirmStep: StepDef = {
  id: "identityConfirm",
  section: "identity",
  input: "review",
  keys: [],
  scope: ["name", "dob", "gender", "address", "fatherOrSpouse", "mobile", "pan", "aadhaarPhoto"],
  applies: (v) => v.aadhaarScanned === true || has(v.existingCif),
  isDone: (v) => v.identityConfirmed === true,
  ask: () => "",
};

const panPhotoStep: StepDef = {
  id: "panPhoto",
  section: "identity",
  input: "photo",
  card: "pan",
  keys: ["panScanned", "pan", "form60"],
  skipPatch: { panScanned: false },
  isDone: (v) => v.panScanned !== undefined || has(v.pan) || v.form60 === true,
  ask: (ctx) => t(ctx.lang, "q.panPhoto"),
  parse: (text) => (saysNoPan(text) ? { ok: true, patch: { form60: true }, ack: "form60" } : err("notHeard")),
  fromCard: (data, ctx) => panStep("account_open", () => true).fromCard!(data, ctx),
  confirm: (patch, ctx) => panStep("account_open", () => true).confirm!(patch, ctx),
};

const incomeStep = choiceStep("income", "contact", INCOME_OPTIONS, {
  parse: (text, ctx) => {
    const opt = matchOption(text, INCOME_OPTIONS);
    if (opt) return { ok: true, patch: { income: opt.value } };
    const phrases = parseNumberPhrases(text, ctx.lang).filter((p) => p.value > 0);
    if (phrases.length > 0) {
      const monthly = hasAny(text, ["month", "monthly", "mahina", "mahine", "महीना", "महीने", "tingalu", "ತಿಂಗಳು", "ತಿಂಗಳಿಗೆ"]);
      const figure = Math.max(...phrases.map((p) => p.value));
      return { ok: true, patch: { income: incomeBucket(monthly ? figure * 12 : figure) } };
    }
    return err("e.choiceUnclear", { options: INCOME_OPTIONS.map((x) => x.label[ctx.lang]).join(", ") });
  },
});

const maritalStep = choiceStep("marital", "contact", MARITAL_OPTIONS, {
  parse: (text, ctx) => {
    const opt = matchOption(text, MARITAL_OPTIONS);
    if (opt) return { ok: true, patch: { marital: opt.value } };
    const yn = detectYesNo(text);
    if (yn) return { ok: true, patch: { marital: yn === "yes" ? "married" : "single" } };
    return err("e.choiceUnclear", { options: MARITAL_OPTIONS.map((x) => x.label[ctx.lang]).join(", ") });
  },
});

const offeredFacilities = () =>
  FACILITY_OPTIONS.filter((o) => o.value === "none" || currentConfig().facilities.includes(o.value as "sms"));

const facilitiesStep: StepDef = withDynamicOptions({
  id: "facilities",
  section: "account",
  input: "multichoice",
  keys: ["facilities"],
  isDone: (v) => (v.facilities ?? []).length > 0,
  ask: (ctx) => t(ctx.lang, "q.facilities"),
  parse: (text, ctx) => {
    const picked = matchAllOptions(text, offeredFacilities()).map((o) => o.value);
    if (picked.includes("none")) return { ok: true, patch: { facilities: ["none"] } };
    return picked.length
      ? { ok: true, patch: { facilities: picked } }
      : err("e.choiceUnclear", { options: offeredFacilities().map((o) => o.label[ctx.lang]).join(", ") });
  },
}, offeredFacilities);

export const ACCOUNT_OPEN: ServiceDef = {
  id: "account_open",
  steps: [
    existingCustomerStep,
    existingAccountStep,
    aadhaarPhotoStep,
    identityConfirmStep,
    nameStep("name", "identity", (ctx) => t(ctx.lang, "q.name")),
    dateStep("dob", "identity", (ctx) => t(ctx.lang, "q.dob")),
    choiceStep("gender", "identity", GENDER_OPTIONS),
    addressStep("address", "identity", "q.address"),
    yesNoStep("livesAtAadhaarAddress", "identity", (ctx) => t(ctx.lang, "q.livesAtAadhaarAddress"), {
      applies: (v) => v.aadhaarScanned === true || has(v.existingCif),
    }),
    addressStep("currentAddress", "identity", "q.currentAddress", { applies: (v) => v.livesAtAadhaarAddress === false }),
    nameStep("fatherOrSpouse", "identity", (ctx) => t(ctx.lang, "q.fatherOrSpouse")),
    nameStep("motherName", "identity", (ctx) => t(ctx.lang, "q.motherName")),
    panPhotoStep,
    panStep("account_open", (v) => v.panScanned !== undefined || has(v.pan) || v.form60 === true),
    phoneStep("mobile", "contact", "q.mobile"),
    choiceStep("occupation", "contact", OCCUPATION_OPTIONS),
    incomeStep,
    maritalStep,
    yesNoStep("declarationOk", "contact", (ctx) => t(ctx.lang, "q.declaration"), { ackOnNo: "staffWillCheck" }),
    choiceStep("accountType", "account", ACCOUNT_TYPE_OPTIONS),
    facilitiesStep,
    // Nomination must be offered; declining is allowed and recorded (opt-out signed at counter).
    yesNoStep("wantsNominee", "nominee", (ctx) => t(ctx.lang, "q.wantsNominee")),
    ...nomineeSteps(MAX_NOMINEES, (v) => v.wantsNominee === true),
    reviewStep(),
  ],
  doneKey: () => "done.account_open",
  needsStaff: (v) => v.declarationOk === false || v.form60 === true || isMinor(v.dob),
};
