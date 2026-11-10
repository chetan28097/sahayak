/**
 * Public entry for form/service definitions. Each step declares when it applies
 * and when it is done, so the next question is always the first applicable
 * unfinished step of the current service (see src/lib/services/*).
 */
export type { ParseCtx, ParseResult, SectionKey, ServiceDef, StepDef } from "./services/types";
export { applies, carryOver, findStep, reviewIds, serviceOf, SERVICES, stepsFor } from "./services/registry";
export { rowFor, rowsFor, type FieldRow } from "./services/display";
export { holderName, parseName } from "./services/shared";
export { identityFromCard } from "./services/accountOpen";
