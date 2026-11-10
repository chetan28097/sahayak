import type { ServiceId, Values } from "../types";
import { ACCOUNT_OPEN } from "./accountOpen";
import { DEPOSIT } from "./deposit";
import { SCHEME_ENROLL } from "./schemes";
import { SERVICE_REQUEST } from "./serviceRequest";
import type { ServiceDef, StepDef } from "./types";
import { UPDATE_DETAILS } from "./updateDetails";

export const SERVICES: Record<ServiceId, ServiceDef> = {
  deposit: DEPOSIT,
  account_open: ACCOUNT_OPEN,
  scheme_enroll: SCHEME_ENROLL,
  update_details: UPDATE_DETAILS,
  service_request: SERVICE_REQUEST,
};

export function serviceOf(id: ServiceId): ServiceDef {
  return SERVICES[id];
}

export function stepsFor(id: ServiceId): StepDef[] {
  return SERVICES[id].steps;
}

export function findStep(id: ServiceId, stepId: string): StepDef | undefined {
  return stepsFor(id).find((s) => s.id === stepId);
}

export function applies(step: StepDef, v: Values): boolean {
  return step.applies ? step.applies(v) : true;
}

/** Ids read back at the final review: every non-review step of the service. */
export function reviewIds(id: ServiceId): string[] {
  return stepsFor(id)
    .filter((s) => s.input !== "review")
    .map((s) => s.id);
}

/** Values that stay when the customer chains another job in the same visit. */
export function carryOver(v: Values): Values {
  return {
    accountNumber: v.accountNumber,
    accountHolder: v.accountHolder,
    holderDob: v.holderDob,
    holderSchemes: v.holderSchemes,
    holderCardLast4: v.holderCardLast4,
  };
}
