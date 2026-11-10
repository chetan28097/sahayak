/**
 * All spoken and on-screen text, per language (Hindi in Devanagari, Kannada in
 * Kannada script so TTS pronounces them natively). Placeholders: {name}.
 * NOTE: have a native speaker review before a live demo.
 */
import type { Lang } from "../types";
import { CORE, LANG_LABELS, type Msg } from "./core";
import { SERVICES_MSGS } from "./services";

const M = { ...CORE, ...SERVICES_MSGS };

export type MsgKey = keyof typeof M;
export { LANG_LABELS };

export function t(lang: Lang, key: MsgKey, params: Record<string, string | number> = {}): string {
  const entry: Msg = M[key];
  const template = entry[lang] ?? entry.en;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

export function hasKey(key: string): key is MsgKey {
  return key in M;
}
