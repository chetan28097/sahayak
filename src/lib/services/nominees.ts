/**
 * Nomination (Form DA-1 / DA-3) under the Banking Companies (Nomination) Rules, 2025:
 * up to 4 nominees with % shares; a guardian for a minor nominee.
 * Steps are generated per slot so the "next unfinished step" logic just works.
 */
import { currentConfig } from "../config";
import { formatDate, isMinor, isPlausibleDob, parseDate } from "../dates";
import { t } from "../i18n";
import { detectYesNo, hasAny } from "../intents";
import { parseNumberPhrases } from "../numbers";
import { RELATION_OPTIONS, matchOption, optionLabel } from "../options";
import type { Lang, Nominee, Values } from "../types";
import { err, parseName, skipped } from "./shared";
import type { StepDef } from "./types";

export const MAX_NOMINEES = 4;

const slot = (v: Values, i: number): Nominee => v.nominees?.[i] ?? {};
export const nomineeCount = (v: Values) => v.nomineeCount ?? 1;

function setSlot(v: Values, i: number, patch: Partial<Nominee>): Nominee[] {
  const list = [...(v.nominees ?? [])];
  while (list.length <= i) list.push({});
  list[i] = { ...list[i], ...patch };
  return list;
}

export function equalShares(n: number): number[] {
  const base = Math.floor(100 / n);
  return Array.from({ length: n }, (_, i) => base + (i === 0 ? 100 - base * n : 0));
}

const EQUAL_WORDS = ["equal", "equally", "same", "barabar", "बराबर", "baraabar", "samana", "samanavagi", "ಸಮಾನ", "ಸಮಾನವಾಗಿ", "half"];

export function sharesComplete(v: Values): boolean {
  const n = nomineeCount(v);
  if (n === 1) return true;
  const shares = (v.nominees ?? []).slice(0, n).map((x) => x.share ?? 0);
  return shares.length === n && shares.every((s) => s > 0) && shares.reduce((a, b) => a + b, 0) === 100;
}

export function nomineeSteps(max: number, applies: (v: Values) => boolean = () => true): StepDef[] {
  const steps: StepDef[] = [];
  for (let i = 0; i < max; i++) {
    const n = i + 1;
    const inSlot = (v: Values) => applies(v) && nomineeCount(v) > i;
    const name = (v: Values) => slot(v, i).name ?? "";
    steps.push(
      {
        id: `nominee${n}Name`,
        section: "nominee",
        input: "text",
        keys: [],
        clear: (v) => ({ nominees: setSlot(v, i, { name: undefined, relation: undefined, dob: undefined, guardian: undefined }) }),
        applies: inSlot,
        isDone: (v) => !!slot(v, i).name,
        ask: (ctx) => (i === 0 ? t(ctx.lang, "q.nomineeName") : t(ctx.lang, "q.nomineeNameNext", { n })),
        parse: (text, ctx) => {
          const parsed = parseName(text);
          return parsed ? { ok: true, patch: { nominees: setSlot(ctx.values, i, { name: parsed }) } } : err("e.nameInvalid");
        },
        confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: patch.nominees?.[i]?.name ?? "" }),
      },
      {
        id: `nominee${n}Relation`,
        section: "nominee",
        input: "choice",
        options: RELATION_OPTIONS,
        keys: [],
        applies: inSlot,
        isDone: (v) => !!slot(v, i).relation,
        ask: (ctx) => t(ctx.lang, "q.nomineeRelation", { nominee: name(ctx.values) }),
        parse: (text, ctx) => {
          const opt = matchOption(text, RELATION_OPTIONS);
          return opt
            ? { ok: true, patch: { nominees: setSlot(ctx.values, i, { relation: opt.value }) } }
            : err("e.choiceUnclear", { options: RELATION_OPTIONS.map((o) => o.label[ctx.lang]).join(", ") });
        },
      },
      {
        id: `nominee${n}Dob`,
        section: "nominee",
        input: "date",
        optional: true,
        keys: [],
        applies: inSlot,
        isDone: (v) => !!slot(v, i).dob || skipped(v, `nominee${n}Dob`),
        ask: (ctx) => t(ctx.lang, "q.nomineeDob", { nominee: name(ctx.values) }),
        parse: (text, ctx) => {
          const iso = parseDate(text, ctx.lang);
          return iso && isPlausibleDob(iso)
            ? { ok: true, patch: { nominees: setSlot(ctx.values, i, { dob: iso }) } }
            : err("e.dateInvalid");
        },
        confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: formatDate(patch.nominees?.[i]?.dob) }),
      },
      {
        id: `nominee${n}Guardian`,
        section: "nominee",
        input: "text",
        keys: [],
        applies: (v) => inSlot(v) && isMinor(slot(v, i).dob),
        isDone: (v) => !!slot(v, i).guardian,
        ask: (ctx) => t(ctx.lang, "q.guardianName", { nominee: name(ctx.values) }),
        parse: (text, ctx) => {
          const parsed = parseName(text);
          return parsed ? { ok: true, patch: { nominees: setSlot(ctx.values, i, { guardian: parsed }) } } : err("e.nameInvalid");
        },
        confirm: (patch, ctx) => t(ctx.lang, "c.generic", { value: patch.nominees?.[i]?.guardian ?? "" }),
      },
    );
    if (n < max) {
      steps.push({
        id: `nominee${n}More`,
        section: "nominee",
        input: "yesno",
        keys: [],
        applies: (v) => applies(v) && n < currentConfig().maxNominees && nomineeCount(v) === n && !!slot(v, i).relation,
        isDone: (v) => nomineeCount(v) > n || v.nomineesClosed === true,
        ask: (ctx) => t(ctx.lang, "q.nomineeMore"),
        parse: (text) => {
          const yn = detectYesNo(text);
          if (!yn) return err("notHeard");
          return { ok: true, patch: yn === "yes" ? { nomineeCount: n + 1 } : { nomineesClosed: true } };
        },
      });
    }
  }
  steps.push({
    id: "nomineeShares",
    section: "nominee",
    input: "text",
    keys: [],
    applies: (v) => applies(v) && nomineeCount(v) > 1 && (v.nomineesClosed === true || nomineeCount(v) >= Math.min(max, currentConfig().maxNominees)),
    isDone: sharesComplete,
    ask: (ctx) => {
      const names = (ctx.values.nominees ?? []).slice(0, nomineeCount(ctx.values)).map((x) => x.name).join(", ");
      return t(ctx.lang, "q.nomineeShares", { names });
    },
    parse: (text, ctx) => {
      const n = nomineeCount(ctx.values);
      let shares: number[] | null = null;
      if (hasAny(text, EQUAL_WORDS)) shares = equalShares(n);
      else {
        const nums = parseNumberPhrases(text, ctx.lang).map((p) => p.value).filter((x) => x > 0 && x <= 100);
        if (nums.length === n && nums.reduce((a, b) => a + b, 0) === 100) shares = nums;
      }
      if (!shares) return err("e.sharesInvalid");
      let list = ctx.values.nominees ?? [];
      shares.forEach((share, i) => (list = setSlot({ nominees: list }, i, { share })));
      return { ok: true, patch: { nominees: list } };
    },
  });
  return steps;
}

/** One display line per nominee: "Suresh · Son · 15/08/1990 · 50% · guardian Ramesh". */
export function nomineeLine(v: Values, i: number, lang: Lang): string | null {
  const x = slot(v, i);
  if (!x.name) return null;
  const n = nomineeCount(v);
  const parts = [x.name, optionLabel(RELATION_OPTIONS, x.relation, lang)];
  if (x.dob) parts.push(formatDate(x.dob));
  parts.push(`${n === 1 ? 100 : (x.share ?? "?")}%`);
  if (x.guardian) parts.push(`${t(lang, "l.guardian")}: ${x.guardian}`);
  return parts.filter(Boolean).join(" · ");
}
