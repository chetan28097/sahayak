/**
 * Bank rules. Fixed rules live here; branch-configurable ones read from `currentConfig()`
 * (see config.ts) so the manager can change them without a code change.
 */
import { currentConfig } from "./config";
import type { NoteKey } from "./types";

export const BANK = {
  get name() {
    return currentConfig().bankName;
  },
  nameLocal: { hi: "सहायक ग्रामीण बैंक", kn: "ಸಹಾಯಕ ಗ್ರಾಮೀಣ ಬ್ಯಾಂಕ್", en: "Sahayak Grameen Bank" },
  get branch() {
    return currentConfig().branch;
  },
  get ifsc() {
    return currentConfig().ifsc;
  },
};

/** Account numbers at this bank are exactly 11 digits (Aadhaar is 12, so they never collide). */
export const ACCOUNT_NUMBER_LENGTH = 11;
/** Default PAN threshold (Income-tax Rule 114B); the live value is `panThreshold()`. */
export const PAN_THRESHOLD = 50_000;
export const MAX_CASH_DEPOSIT = 10_00_000;
export const panThreshold = () => currentConfig().panThreshold;
export const maxCashDeposit = () => currentConfig().maxCashDeposit;
export const NOTE_DENOMS = [500, 200, 100, 50, 20, 10] as const;
export const NOTE_KEYS: readonly NoteKey[] = ["500", "200", "100", "50", "20", "10", "coins"];

export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const ADULT_AGE = 18;
