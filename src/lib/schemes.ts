/**
 * Government social-security scheme rules (no LLM).
 * PMJJBY: life cover ₹2 lakh, ₹436/yr, age 18–50 at enrolment.
 * PMSBY: accident cover ₹2 lakh, ₹20/yr, age 18–70.
 * APY: guaranteed pension ₹1,000–5,000/month from 60, entry age 18–40.
 * APY contributions are the PFRDA chart (indicative; verify against the current chart).
 */
import type { SchemeId } from "./types";

export interface SchemeRule {
  id: SchemeId;
  minAge: number;
  maxAge: number;
  premium?: number; // yearly, for insurance schemes
  cover?: number;
  name: string;
}

export const SCHEMES: Record<SchemeId, SchemeRule> = {
  pmjjby: { id: "pmjjby", minAge: 18, maxAge: 50, premium: 436, cover: 200000, name: "PMJJBY" },
  pmsby: { id: "pmsby", minAge: 18, maxAge: 70, premium: 20, cover: 200000, name: "PMSBY" },
  apy: { id: "apy", minAge: 18, maxAge: 40, name: "APY" },
};

/** Monthly contribution by entry age (18–40) for pensions of ₹1k, 2k, 3k, 4k, 5k. */
const APY_CHART: Record<number, [number, number, number, number, number]> = {
  18: [42, 84, 126, 168, 210], 19: [46, 92, 138, 183, 228], 20: [50, 100, 150, 198, 248],
  21: [54, 108, 162, 215, 269], 22: [59, 117, 177, 234, 292], 23: [64, 127, 192, 254, 318],
  24: [70, 139, 208, 277, 346], 25: [76, 151, 226, 301, 376], 26: [82, 164, 246, 327, 409],
  27: [90, 178, 268, 356, 446], 28: [97, 194, 292, 388, 485], 29: [106, 212, 318, 423, 529],
  30: [116, 231, 347, 462, 577], 31: [126, 252, 379, 504, 630], 32: [138, 276, 414, 551, 689],
  33: [151, 302, 453, 602, 752], 34: [165, 330, 495, 659, 824], 35: [181, 362, 543, 722, 902],
  36: [198, 396, 594, 792, 990], 37: [218, 436, 654, 870, 1087], 38: [240, 480, 720, 957, 1196],
  39: [264, 528, 792, 1054, 1318], 40: [291, 582, 873, 1164, 1454],
};

export const PENSION_SLABS = [1000, 2000, 3000, 4000, 5000] as const;

export function apyContribution(age: number, slab: number): number | null {
  const row = APY_CHART[age];
  const idx = PENSION_SLABS.indexOf(slab as (typeof PENSION_SLABS)[number]);
  return row && idx >= 0 ? row[idx] : null;
}

export function isEligible(scheme: SchemeId, age: number): boolean {
  const rule = SCHEMES[scheme];
  return age >= rule.minAge && age <= rule.maxAge;
}

export function eligibleSchemes(age: number, enrolled: readonly string[] = []): SchemeId[] {
  return (Object.keys(SCHEMES) as SchemeId[]).filter((s) => isEligible(s, age) && !enrolled.includes(s));
}

/**
 * PMJJBY first-year premium is pro-rata by month of enrolment (policy year June–May):
 * Jun–Aug ₹436, Sep–Nov ₹342, Dec–Feb ₹228, Mar–May ₹114. Renewals are ₹436.
 */
export function pmjjbyPremium(on: Date = new Date()): number {
  const m = on.getMonth() + 1;
  if (m >= 6 && m <= 8) return 436;
  if (m >= 9 && m <= 11) return 342;
  if (m === 12 || m <= 2) return 228;
  return 114;
}

/** Amount and frequency debited for the chosen scheme (first debit). */
export function schemeDebit(
  scheme: SchemeId,
  age: number,
  slab?: number,
  on: Date = new Date(),
): { amount: number; freq: "year" | "month" } | null {
  if (scheme === "apy") {
    const c = slab ? apyContribution(age, slab) : null;
    return c === null ? null : { amount: c, freq: "month" };
  }
  if (scheme === "pmjjby") return { amount: pmjjbyPremium(on), freq: "year" };
  return { amount: SCHEMES[scheme].premium ?? 0, freq: "year" };
}
