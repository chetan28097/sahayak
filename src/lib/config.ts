/**
 * Branch / bank configuration. Banks differ (PAN threshold policy, cheque-book sizes,
 * facilities, schemes offered, nominee limits, languages), so these are data, not code.
 * The server loads the saved config into this holder before running the state machine;
 * tests and offline runs use the defaults.
 */
import { z } from "zod";

export const StaffSchema = z.object({
  id: z.string().min(2).max(20).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(40),
  role: z.enum(["teller", "officer", "manager"]),
});
export type Staff = z.infer<typeof StaffSchema>;

export const ConfigSchema = z.object({
  bankName: z.string().min(2).max(60),
  branch: z.string().min(2).max(40),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  /** Cash deposits at or above this need PAN, else Form 60 (Income-tax Rule 114B: ₹50,000). */
  panThreshold: z.number().int().min(10000).max(1000000),
  /** Above this the assistant hands the customer to staff. */
  maxCashDeposit: z.number().int().min(10000).max(100000000),
  chequeLeaves: z.array(z.enum(["10", "25", "50"])).min(1),
  facilities: z.array(z.enum(["atm_card", "cheque_book", "sms", "mobile_banking"])).min(1),
  schemes: z.array(z.enum(["pmjjby", "pmsby", "apy"])),
  maxNominees: z.number().int().min(1).max(4),
  languages: z.array(z.enum(["kn", "hi", "en"])).min(1),
  /** Expected minutes per service at the counter (shown to customers as "about N minutes"). */
  counterMinutes: z.number().int().min(1).max(60),
  staff: z.array(StaffSchema).min(1),
});
export type BankConfig = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: BankConfig = {
  bankName: "Sahayak Grameen Bank",
  branch: "Hosakote",
  ifsc: "SGBK0004521",
  panThreshold: 50000,
  maxCashDeposit: 1000000,
  chequeLeaves: ["10", "25"],
  facilities: ["atm_card", "cheque_book", "sms", "mobile_banking"],
  schemes: ["pmjjby", "pmsby", "apy"],
  maxNominees: 4,
  languages: ["kn", "hi", "en"],
  counterMinutes: 5,
  staff: [
    { id: "asha", name: "Asha K. (Teller 1)", role: "teller" },
    { id: "ravi", name: "Ravi M. (Teller 2)", role: "teller" },
    { id: "farida", name: "Farida S. (KYC officer)", role: "officer" },
    { id: "meera", name: "Meera R. (Branch manager)", role: "manager" },
  ],
};

let current: BankConfig = DEFAULT_CONFIG;

export function currentConfig(): BankConfig {
  return current;
}

export function setConfig(config: BankConfig): void {
  current = config;
}
