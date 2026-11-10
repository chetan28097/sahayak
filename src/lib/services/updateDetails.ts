/** KYC / contact update: mobile, address, nominee (DA-3 variation), re-KYC. Several at once. */
import { t } from "../i18n";
import { UPDATE_OPTIONS, matchAllOptions } from "../options";
import type { Values } from "../types";
import { MAX_NOMINEES, nomineeSteps } from "./nominees";
import { accountNumberStep, accountOf, addressStep, err, phoneStep, reviewStep, yesNoStep } from "./shared";
import type { ServiceDef, StepDef } from "./types";

const wants = (what: string) => (v: Values) => (v.updateWhat ?? []).includes(what);

const updateWhatStep: StepDef = {
  id: "updateWhat",
  section: "update",
  input: "multichoice",
  options: UPDATE_OPTIONS,
  keys: ["updateWhat", "newMobile", "newAddress", "addressScanned", "rekycScanned", "rekycLast4", "kycChanged", "nominees", "nomineeCount", "nomineesClosed"],
  isDone: (v) => (v.updateWhat ?? []).length > 0,
  ask: (ctx) => t(ctx.lang, "q.updateWhat"),
  parse: (text, ctx) => {
    const picked = matchAllOptions(text, UPDATE_OPTIONS).map((o) => o.value);
    return picked.length
      ? { ok: true, patch: { updateWhat: picked } }
      : err("e.choiceUnclear", { options: UPDATE_OPTIONS.map((o) => o.label[ctx.lang]).join(", ") });
  },
};

const addressPhotoStep: StepDef = {
  id: "addressPhoto",
  section: "update",
  input: "photo",
  card: "aadhaar",
  keys: ["addressScanned", "newAddress"],
  skipPatch: { addressScanned: false },
  applies: wants("address"),
  isDone: (v) => v.addressScanned !== undefined,
  ask: (ctx) => t(ctx.lang, "q.addressPhoto"),
  fromCard: (data) =>
    data.address ? { ok: true, patch: { newAddress: data.address.trim(), addressScanned: true } } : err("e.photoFailed"),
  confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: String(patch.newAddress) }),
};

const rekycPhotoStep: StepDef = {
  id: "rekycPhoto",
  section: "update",
  input: "photo",
  card: "aadhaar",
  keys: ["rekycScanned", "rekycLast4"],
  skipPatch: { rekycScanned: false },
  applies: wants("rekyc"),
  isDone: (v) => v.rekycScanned !== undefined,
  ask: (ctx) => t(ctx.lang, "q.rekycPhoto"),
  fromCard: (data) =>
    data.aadhaarLast4 && /^\d{4}$/.test(data.aadhaarLast4)
      ? { ok: true, patch: { rekycScanned: true, rekycLast4: data.aadhaarLast4 } }
      : err("e.photoFailed"),
};

const baseMobile = phoneStep("newMobile", "update", "q.newMobile", { applies: wants("mobile") });
/** Shows which number is registered now, and refuses a "change" to the same number. */
const newMobileStep: StepDef = {
  ...baseMobile,
  ask: (ctx) => {
    const old = accountOf(ctx)?.mobile;
    return old ? t(ctx.lang, "q.newMobileWithOld", { last4: old.slice(-4).split("").join(" ") }) : t(ctx.lang, "q.newMobile");
  },
  parse: (text, ctx) => {
    const r = baseMobile.parse!(text, ctx);
    if (r.ok && r.patch.newMobile === accountOf(ctx)?.mobile) return err("e.sameMobile");
    return r;
  },
};

export const UPDATE_DETAILS: ServiceDef = {
  id: "update_details",
  steps: [
    accountNumberStep,
    updateWhatStep,
    newMobileStep,
    addressPhotoStep,
    addressStep("newAddress", "update", "q.newAddress", { applies: wants("address") }),
    ...nomineeSteps(MAX_NOMINEES, wants("nominee")),
    rekycPhotoStep,
    yesNoStep("kycChanged", "update", (ctx) => t(ctx.lang, "q.kycChanged"), { applies: wants("rekyc") }),
    reviewStep(),
  ],
  doneKey: () => "done.update_details",
  needsStaff: (v) => v.kycChanged === true || v.rekycScanned === false,
};
