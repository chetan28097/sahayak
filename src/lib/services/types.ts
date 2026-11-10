import type { MsgKey } from "../i18n";
import type { ChoiceOption } from "../options";
import type { Account, CardData, CardKind, InputKind, Lang, ServiceId, Values } from "../types";

export interface ParseCtx {
  lang: Lang;
  form: ServiceId;
  values: Values;
  findAccount: (accountNumber: string) => Account | undefined;
}

export type ParseResult =
  | { ok: true; patch: Partial<Values>; ack?: MsgKey }
  | { ok: false; error: MsgKey; params?: Record<string, string | number> };

export type SectionKey =
  | "account" | "cash" | "depositor" | "identity" | "contact" | "nominee" | "scheme" | "update" | "request";

export interface StepDef {
  id: string;
  section: SectionKey;
  input: InputKind;
  options?: ChoiceOption[];
  optional?: boolean;
  card?: CardKind;
  /** Keys cleared when the user asks to change this step. */
  keys: (keyof Values)[];
  /** Custom clearing (e.g. one nominee slot) instead of deleting `keys`. */
  clear?: (v: Values) => Partial<Values>;
  /** Patch applied when a photo step is answered "tell by voice" instead. */
  skipPatch?: Partial<Values>;
  applies?: (v: Values) => boolean;
  isDone: (v: Values) => boolean;
  ask: (ctx: ParseCtx) => string;
  parse?: (text: string, ctx: ParseCtx) => ParseResult;
  /** Card photo for this step (passbook → account number, Aadhaar → identity …). */
  fromCard?: (data: CardData, ctx: ParseCtx) => ParseResult;
  /** Read-back question before committing; omit for no confirmation. */
  confirm?: (patch: Partial<Values>, ctx: ParseCtx) => string;
  /** For review steps: which steps are read back (default: all steps of the service). */
  scope?: string[];
}

export interface ServiceDef {
  id: ServiceId;
  steps: StepDef[];
  /** Message spoken when the slip is issued. */
  doneKey: (v: Values) => MsgKey;
  urgent?: (v: Values) => boolean;
  needsStaff?: (v: Values) => boolean;
  /** Informational requests (balance) are complete without counter work. */
  autoDone?: (v: Values) => boolean;
}
