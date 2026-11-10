export type Lang = "hi" | "kn" | "en";
export const LANGS: readonly Lang[] = ["hi", "kn", "en"] as const;
export const LANG_CODES: Record<Lang, string> = { hi: "hi-IN", kn: "kn-IN", en: "en-IN" };

export type ServiceId = "deposit" | "account_open" | "scheme_enroll" | "update_details" | "service_request";
export const SERVICE_IDS: readonly ServiceId[] = [
  "deposit", "account_open", "scheme_enroll", "update_details", "service_request",
] as const;
/** @deprecated kept for older imports */
export type FormType = ServiceId;
export type Mode = "mock" | "live";

export type NoteKey = "500" | "200" | "100" | "50" | "20" | "10" | "coins";
/** Count per note; for "coins" the value is the coin total in rupees. */
export type NoteBreakdown = Partial<Record<NoteKey, number>>;

/** DA-1 nominee (Banking Companies (Nomination) Rules, 2025: up to 4, with % shares). */
export interface Nominee {
  name?: string;
  relation?: string;
  dob?: string;
  guardian?: string;
  share?: number;
}

export type SchemeId = "pmjjby" | "pmsby" | "apy";

export interface Values {
  // shared
  accountNumber?: string;
  accountHolder?: string;
  /** Copied from the account record when the account is confirmed (used for age checks etc.). */
  holderDob?: string;
  holderSchemes?: string[];
  holderCardLast4?: string;
  // deposit
  amount?: number;
  notes?: NoteBreakdown;
  pan?: string;
  form60?: boolean;
  selfDeposit?: boolean;
  depositorName?: string;
  depositorPhone?: string;
  // account opening (CKYC)
  existingCustomer?: boolean;
  /** Account number whose CIF (KYC on record) the new account is linked to. */
  existingCif?: string;
  aadhaarScanned?: boolean;
  panScanned?: boolean;
  identityConfirmed?: boolean;
  name?: string;
  dob?: string; // YYYY-MM-DD
  gender?: string;
  address?: string;
  aadhaarLast4?: string;
  livesAtAadhaarAddress?: boolean;
  currentAddress?: string;
  fatherOrSpouse?: string;
  motherName?: string;
  mobile?: string;
  occupation?: string;
  income?: string;
  marital?: string;
  declarationOk?: boolean;
  accountType?: string;
  facilities?: string[];
  // nomination
  wantsNominee?: boolean;
  nominees?: Nominee[];
  nomineeCount?: number;
  nomineesClosed?: boolean;
  // schemes
  scheme?: SchemeId;
  pensionSlab?: number;
  healthOk?: boolean;
  autoDebitConsent?: boolean;
  schemeElsewhere?: boolean;
  taxPayer?: boolean;
  // update details
  updateWhat?: string[];
  newMobile?: string;
  newAddress?: string;
  addressScanned?: boolean;
  rekycScanned?: boolean;
  rekycLast4?: string;
  kycChanged?: boolean;
  // service requests
  requestType?: string;
  chequeLeaves?: string;
  chequeDelivery?: string;
  cardReason?: string;
  cardReissue?: boolean;
  unauthorisedTxn?: boolean;
  complaintDate?: string;
  complaintAmount?: number;
  infoSeen?: boolean;
  complaintCategory?: string;
  complaintText?: string;
  // bookkeeping
  skipped?: string[];
  reviewConfirmedAt?: string;
}

export interface Transaction {
  date: string;
  desc: string;
  amount: number;
}

export interface Account {
  accountNumber: string;
  holder: string;
  holderLocal: Partial<Record<Lang, string>>;
  branch: string;
  accountType?: string;
  fatherOrSpouse?: string;
  dob?: string;
  mobile?: string;
  address?: string;
  aadhaarLast4?: string;
  pan?: string;
  cardLast4?: string;
  balance?: number;
  transactions?: Transaction[];
  schemes?: string[];
}

export type InputKind =
  | "digits"
  | "amount"
  | "notes"
  | "yesno"
  | "choice"
  | "multichoice"
  | "text"
  | "phone"
  | "pan"
  | "date"
  | "photo"
  | "info"
  | "review";

export type CardKind = "aadhaar" | "pan" | "passbook";

export interface CardData {
  name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  aadhaarLast4?: string;
  pan?: string;
  accountNumber?: string;
}
