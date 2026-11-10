/**
 * Bank form specs: the bank's own form for each service (pay-in slip, CKYC + AOF,
 * DA-1 nomination, PMJJBY/PMSBY consent-cum-declaration, APY registration, KYC update,
 * service requisitions) filled from the conversation, the account record and the system.
 * Anything not collectable by voice is marked "collect at counter" so the teller sees
 * exactly what is left. This whole object travels inside the signed QR.
 */
import { amountInWords } from "./amountWords";
import { BANK, NOTE_DENOMS } from "./bankRules";
import { formatDate, isMinor } from "./dates";
import { noteTotal } from "./notes";
import { formatINR, groupDigits } from "./numbers";
import {
  ACCOUNT_TYPE_OPTIONS, CARD_REASON_OPTIONS, CHEQUE_DELIVERY_OPTIONS, COMPLAINT_OPTIONS, GENDER_OPTIONS,
  FACILITY_OPTIONS, INCOME_OPTIONS, MARITAL_OPTIONS, OCCUPATION_OPTIONS, RELATION_OPTIONS, REQUEST_OPTIONS, UPDATE_OPTIONS, optionLabel,
} from "./options";
import { SCHEMES, apyContribution, schemeDebit } from "./schemes";
import { nomineeCount } from "./services/nominees";
import { holderAge } from "./services/schemes";
import type { Account, ServiceId, Values } from "./types";

export type FieldSource = "customer" | "card" | "record" | "system" | "counter";

export interface FormField {
  id: string;
  label: string;
  value: string | null;
  source: FieldSource;
}

export interface FormSection {
  title: string;
  fields: FormField[];
  table?: { headers: string[]; rows: string[][] };
}

export interface FilledForm {
  service: ServiceId;
  title: string;
  formRef: string;
  sections: FormSection[];
  /** Things staff must act on (Form 60, declaration "no", health "no" …). */
  flags: string[];
}

export interface FormMeta {
  code: string;
  createdAt: string;
  readBackAt: string;
}

const f = (id: string, label: string, value: string | null | undefined, source: FieldSource): FormField => ({
  id,
  label,
  value: value === undefined || value === "" ? null : value,
  source: value === undefined || value === null || value === "" ? (source === "system" ? "system" : "counter") : source,
});
const counter = (id: string, label: string): FormField => ({ id, label, value: null, source: "counter" });
const en = (options: Parameters<typeof optionLabel>[0], value: string | undefined) =>
  value ? optionLabel(options, value, "en") : undefined;
const masked = (last4?: string) => (last4 ? `XXXX-XXXX-${last4}` : undefined);
const yn = (b: boolean | undefined) => (b === undefined ? undefined : b ? "Yes" : "No");
const ist = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

function accountSection(v: Values, acc: Account | undefined, meta: FormMeta): FormSection {
  return {
    title: "Account",
    fields: [
      f("date", "Date", ist(meta.createdAt), "system"),
      f("branch", "Branch / IFSC", `${BANK.branch} · ${BANK.ifsc}`, "system"),
      f("accountType", "Account type", acc?.accountType === "SB" ? "Savings (SB)" : acc?.accountType, "record"),
      f("accountNumber", "Account number", v.accountNumber && groupDigits(v.accountNumber), "customer"),
      f("accountHolder", "Account holder", acc?.holder ?? v.accountHolder, "record"),
    ],
  };
}

function verificationSection(meta: FormMeta, signatureLabel = "Customer signature / thumb impression"): FormSection {
  return {
    title: "Verification",
    fields: [
      f("readBack", "Read back aloud & confirmed", ist(meta.readBackAt), "system"),
      f("token", "Token", meta.code, "system"),
      counter("signature", signatureLabel),
      counter("officer", "Bank officer (name, emp. no., stamp)"),
    ],
  };
}

function nominationSection(v: Values, title = "Nomination (Form DA-1)"): FormSection {
  const n = nomineeCount(v);
  const list = (v.nominees ?? []).slice(0, n);
  return {
    title,
    fields: [f("nomineeCount", "Number of nominees", list.length ? String(list.length) : undefined, "customer")],
    table: {
      headers: ["#", "Name", "Relation", "Date of birth", "Share", "Guardian (if minor)", "Address"],
      rows: list.map((x, i) => [
        String(i + 1),
        x.name ?? "—",
        en(RELATION_OPTIONS, x.relation) ?? "—",
        x.dob ? formatDate(x.dob) : "collect at counter",
        `${n === 1 ? 100 : (x.share ?? "?")}%`,
        x.guardian ?? (isMinor(x.dob) ? "collect at counter" : "—"),
        "collect at counter",
      ]),
    },
  };
}

function deposit(v: Values, acc: Account | undefined, meta: FormMeta): FilledForm {
  const notes = v.notes ?? {};
  const rows = NOTE_DENOMS.filter((d) => (notes[String(d) as "500"] ?? 0) > 0).map((d) => {
    const count = notes[String(d) as "500"] ?? 0;
    return [`₹${d}`, String(count), formatINR(d * count)];
  });
  if ((notes.coins ?? 0) > 0) rows.push(["Coins", "—", formatINR(notes.coins ?? 0)]);
  rows.push(["Total", "", formatINR(noteTotal(notes))]);
  const self = v.selfDeposit !== false;
  return {
    service: "deposit",
    title: "Cash Deposit (Pay-in) Slip",
    formRef: "Pay-in slip · PAN/Form 60 rule (cash ≥ ₹50,000)",
    sections: [
      accountSection(v, acc, meta),
      {
        title: "Amount",
        fields: [
          f("amount", "Amount (figures)", v.amount !== undefined ? formatINR(v.amount) : undefined, "customer"),
          f("amountWords", "Amount (words)", v.amount !== undefined ? amountInWords(v.amount) : undefined, "system"),
        ],
        table: { headers: ["Denomination", "Count", "Amount"], rows },
      },
      {
        title: "PAN / Form 60",
        fields: [
          f("pan", "PAN of person depositing", v.form60 ? "Form 60 — to be signed at counter" : v.pan ?? ((v.amount ?? 0) < 50000 ? "Not required (< ₹50,000)" : undefined), "customer"),
        ],
      },
      {
        title: "Depositor",
        fields: [
          f("depositorType", "Deposited by", self ? "Account holder (self)" : "Third party", "customer"),
          f("depositorName", "Depositor name", self ? acc?.holder : v.depositorName, self ? "record" : "customer"),
          f("depositorMobile", "Depositor mobile", self ? acc?.mobile : v.depositorPhone, self ? "record" : "customer"),
        ],
      },
      verificationSection(meta, "Depositor signature / thumb impression"),
    ],
    flags: v.form60 ? ["Form 60 to be signed"] : [],
  };
}

function titleFor(v: Values): string | undefined {
  if (v.gender === "male") return "Shri";
  if (v.gender === "female") return v.marital === "single" ? "Kumari" : "Smt.";
  return undefined;
}

function accountOpen(v: Values, _acc: Account | undefined, meta: FormMeta): FilledForm {
  const card: FieldSource = v.existingCif ? "record" : v.aadhaarScanned ? "card" : "customer";
  return {
    service: "account_open",
    title: "Account Opening Form — Individual (with CKYC)",
    formRef: "AOF + CKYC Individual (Part I) + DA-1 nomination",
    sections: [
      {
        title: "Account details",
        fields: [
          f("date", "Date", ist(meta.createdAt), "system"),
          f("branch", "Branch / IFSC", `${BANK.branch} · ${BANK.ifsc}`, "system"),
          f("accountType", "Account type", en(ACCOUNT_TYPE_OPTIONS, v.accountType), "customer"),
          f("operation", "Mode of operation", isMinor(v.dob) ? "Minor — operated by guardian" : "Self", "system"),
          f("facilities", "Facilities requested", v.facilities?.map((x) => en(FACILITY_OPTIONS, x)).join(", "), "customer"),
          counter("ckycNumber", "CKYC number (if any)"),
          counter("photo", "Recent photograph"),
        ],
      },
      {
        title: "Personal details (CKYC Part I)",
        fields: [
          f("title", "Title", titleFor(v), "system"),
          f("name", "Full name (as per OVD)", v.name, card),
          f("fatherOrSpouse", "Father's / spouse's name", v.fatherOrSpouse, "customer"),
          f("motherName", "Mother's name", v.motherName, "customer"),
          f("dob", "Date of birth", v.dob && formatDate(v.dob), card),
          f("gender", "Gender", en(GENDER_OPTIONS, v.gender), card),
          f("marital", "Marital status", en(MARITAL_OPTIONS, v.marital), "customer"),
          f("nationality", "Nationality", v.declarationOk ? "Indian" : undefined, "customer"),
          f("residentialStatus", "Residential status", v.declarationOk ? "Resident Individual" : undefined, "customer"),
          f("occupation", "Occupation", en(OCCUPATION_OPTIONS, v.occupation), "customer"),
          f("income", "Annual income", en(INCOME_OPTIONS, v.income), "customer"),
        ],
      },
      {
        title: "Proof of identity & address",
        fields: [
          f("customerType", "Customer", v.existingCif ? `Existing customer — CIF via account XXXX${v.existingCif.slice(-4)}, KYC on record` : "New to bank", "system"),
          f("ovdType", "OVD type", v.existingCif ? "On record" : v.aadhaarScanned ? "Aadhaar (proof of possession)" : undefined, card),
          f("ovdNumber", "OVD number", masked(v.aadhaarLast4), card),
          f("pan", "PAN / Form 60", v.form60 ? "Form 60 — to be signed at counter" : v.pan, v.panScanned ? "card" : "customer"),
          f("permanentAddress", "Permanent address (as per OVD)", v.address, card),
          f("currentAddress", "Current address", v.livesAtAadhaarAddress === false ? v.currentAddress : v.livesAtAadhaarAddress ? "Same as permanent" : undefined, "customer"),
          f("mobile", "Mobile", v.mobile, "customer"),
          counter("email", "Email (optional)"),
        ],
      },
      {
        title: "Declarations",
        fields: [
          f("pep", "Politically exposed person (PEP)", v.declarationOk === undefined ? undefined : v.declarationOk ? "No" : "Staff to verify", "customer"),
          f("fatca", "FATCA / CRS: tax resident outside India", v.declarationOk === undefined ? undefined : v.declarationOk ? "No" : "Staff to verify", "customer"),
          counter("aadhaarConsent", "Consent to use Aadhaar for KYC (signature)"),
        ],
      },
      v.wantsNominee === false
        ? { title: "Nomination (Form DA-1)", fields: [f("nominationOptOut", "Nomination", "Declined by customer", "customer"), counter("optOutSignature", "Signature on nomination opt-out")] }
        : nominationSection(v),
      verificationSection(meta, "Applicant signature / thumb impression"),
    ],
    flags: [
      ...(v.form60 ? ["Form 60 to be signed"] : []),
      ...(isMinor(v.dob) ? ["Applicant is under 18 — open as minor account with guardian"] : []),
      ...(v.declarationOk === false ? ["PEP / FATCA declaration needs staff verification"] : []),
      ...(v.existingCif ? ["Existing CIF: confirm KYC is not due for periodic update"] : ["Original OVD verification and photograph at counter"]),
    ],
  };
}

function schemeForm(v: Values, acc: Account | undefined, meta: FormMeta): FilledForm {
  const scheme = v.scheme;
  const rule = scheme ? SCHEMES[scheme] : undefined;
  const age = holderAge(v);
  const debit = scheme ? schemeDebit(scheme, age ?? 0, v.pensionSlab, new Date(meta.createdAt)) : null;
  const isApy = scheme === "apy";
  const titles = {
    pmjjby: "PMJJBY — Consent-cum-Declaration Form",
    pmsby: "PMSBY — Consent-cum-Declaration Form",
    apy: "Atal Pension Yojana — Subscriber Registration Form",
  } as const;
  return {
    service: "scheme_enroll",
    title: scheme ? titles[scheme] : "Scheme enrolment",
    formRef: isApy ? "APY registration + auto-debit authorisation" : "Consent-cum-declaration + auto-debit authorisation",
    sections: [
      accountSection(v, acc, meta),
      {
        title: "Subscriber",
        fields: [
          f("name", "Name", acc?.holder, "record"),
          f("dob", "Date of birth", (v.dob ?? v.holderDob) && formatDate(v.dob ?? v.holderDob), v.dob ? "customer" : "record"),
          f("age", "Age at enrolment", age !== undefined ? String(age) : undefined, "system"),
          f("aadhaar", "Aadhaar (linked)", masked(acc?.aadhaarLast4), "record"),
          f("mobile", "Mobile", acc?.mobile, "record"),
          ...(isApy ? [counter("spouse", "Spouse name (optional)")] : []),
        ],
      },
      {
        title: "Scheme",
        fields: [
          f("scheme", "Scheme", rule?.name, "customer"),
          ...(rule?.cover ? [f("cover", "Cover", formatINR(rule.cover), "system")] : []),
          ...(isApy
            ? [
                f("pension", "Monthly pension from age 60", v.pensionSlab ? formatINR(v.pensionSlab) : undefined, "customer"),
                f("contribution", "Monthly contribution (indicative, PFRDA chart)", v.pensionSlab ? formatINR(apyContribution(age ?? 0, v.pensionSlab) ?? 0) : undefined, "system"),
                f("frequency", "Contribution frequency", "Monthly", "system"),
              ]
            : [f("premium", scheme === "pmjjby" ? "First premium (pro-rata by month)" : "Annual premium", debit ? formatINR(debit.amount) : undefined, "system")]),
          ...(scheme === "pmjjby"
            ? [
                f("health", "Good-health declaration", yn(v.healthOk), "customer"),
                f("lien", "Lien period", "Death due to illness covered after 30 days from enrolment", "system"),
              ]
            : []),
          f("elsewhere", "Already enrolled through another bank / post office", yn(v.schemeElsewhere), "customer"),
          ...(isApy ? [f("taxPayer", "Income-tax payer", yn(v.taxPayer), "customer")] : []),
        ],
      },
      nominationSection(v, "Nominee"),
      {
        title: "Auto-debit authorisation",
        fields: [
          f("consent", "Customer consents to auto-debit", v.autoDebitConsent ? "Yes (verbal, read back)" : undefined, "customer"),
          f("debit", "Amount & frequency", debit ? `${formatINR(debit.amount)} ${debit.freq === "month" ? "monthly" : "yearly"}` : undefined, "system"),
          counter("signature", "Signature for auto-debit mandate"),
        ],
      },
      verificationSection(meta),
    ],
    flags: [
      ...(v.healthOk === false ? ["Good-health declaration answered 'No' — staff to advise"] : []),
      ...(v.schemeElsewhere ? ["Customer says already enrolled elsewhere — only one policy allowed per person"] : []),
    ],
  };
}

function updateForm(v: Values, acc: Account | undefined, meta: FormMeta): FilledForm {
  const what = v.updateWhat ?? [];
  const sections: FormSection[] = [accountSection(v, acc, meta)];
  sections.push({
    title: "Request",
    fields: [f("changes", "Changes requested", what.map((w) => en(UPDATE_OPTIONS, w)).join(", "), "customer")],
  });
  if (what.includes("mobile")) {
    sections.push({
      title: "Mobile number change",
      fields: [
        f("oldMobile", "Registered mobile", acc?.mobile && `XXXXXX${acc.mobile.slice(-4)}`, "record"),
        f("newMobile", "New mobile", v.newMobile, "customer"),
        counter("otp", "OTP verification on new number"),
      ],
    });
  }
  if (what.includes("address")) {
    sections.push({
      title: "Address change",
      fields: [
        f("oldAddress", "Address on record", acc?.address, "record"),
        f("newAddress", "New address", v.newAddress, v.addressScanned ? "card" : "customer"),
        f("addressProof", "Proof of address", v.addressScanned ? "Aadhaar (photo read)" : undefined, "card"),
      ],
    });
  }
  if (what.includes("nominee")) sections.push(nominationSection(v, "Variation of nomination (Form DA-3)"));
  if (what.includes("rekyc")) {
    sections.push({
      title: "Re-KYC (periodic updation)",
      fields: [
        f("rekycOvd", "OVD", v.rekycLast4 ? `Aadhaar ${masked(v.rekycLast4)}` : undefined, "card"),
        f("kycChanged", "Change in KYC information", yn(v.kycChanged), "customer"),
        f("selfDeclaration", "Self-declaration of no change", v.kycChanged === false ? "Yes (verbal, read back)" : undefined, "customer"),
      ],
    });
  }
  sections.push(verificationSection(meta));
  return {
    service: "update_details",
    title: "KYC / Contact Details Update Request",
    formRef: "KYC updation + DA-3 variation of nomination",
    sections,
    flags: [
      ...(v.kycChanged ? ["KYC information changed — fresh KYC documents needed"] : []),
      ...(what.includes("mobile") ? ["Verify OTP on new mobile"] : []),
    ],
  };
}

function requestForm(v: Values, acc: Account | undefined, meta: FormMeta): FilledForm {
  const type = v.requestType;
  const fields: FormField[] = [f("requestType", "Request", en(REQUEST_OPTIONS, type), "customer")];
  let title = "Service Request";
  if (type === "cheque_book") {
    title = "Cheque Book Requisition";
    fields.push(
      f("leaves", "Number of leaves", v.chequeLeaves, "customer"),
      f("delivery", "Delivery", en(CHEQUE_DELIVERY_OPTIONS, v.chequeDelivery), "customer"),
      f("address", "Delivery address", v.chequeDelivery === "home" ? acc?.address : "Branch", v.chequeDelivery === "home" ? "record" : "system"),
    );
  }
  if (type === "block_card") {
    title = "Debit Card Hotlisting Request — URGENT";
    fields.push(
      f("card", "Card", acc?.cardLast4 ? `XXXX XXXX XXXX ${acc.cardLast4}` : undefined, "record"),
      f("reason", "Reason", en(CARD_REASON_OPTIONS, v.cardReason), "customer"),
      f("reportedAt", "Reported at", ist(meta.readBackAt), "system"),
      f("unauthorised", "Unauthorised transactions reported", yn(v.unauthorisedTxn), "customer"),
      f("reissue", "Re-issue card", yn(v.cardReissue), "customer"),
      counter("hotlistRef", "Hotlisting reference (core system)"),
    );
  }
  if (type === "passbook") {
    title = "Passbook Updation";
    fields.push(f("lastEntry", "Last transaction on record", acc?.transactions?.[0]?.date, "record"));
  }
  if (type === "balance") {
    title = "Balance Enquiry (completed on screen)";
    fields.push(f("shownAt", "Shown to customer", ist(meta.readBackAt), "system"));
  }
  if (type === "complaint") {
    title = "Customer Complaint";
    fields.push(
      f("category", "Category", en(COMPLAINT_OPTIONS, v.complaintCategory), "customer"),
      ...(v.complaintCategory === "atm_debit"
        ? [
            f("txnDate", "Date of transaction", v.complaintDate && formatDate(v.complaintDate), "customer"),
            f("txnAmount", "Amount debited", v.complaintAmount !== undefined ? formatINR(v.complaintAmount) : undefined, "customer"),
            counter("atmId", "ATM / terminal ID or UPI reference"),
          ]
        : []),
      f("complaint", "Complaint (customer's words)", v.complaintText, "customer"),
      counter("resolution", "Resolution / escalation"),
    );
  }
  return {
    service: "service_request",
    title,
    formRef: "Service requisition",
    sections: [accountSection(v, acc, meta), { title: "Request details", fields }, verificationSection(meta)],
    flags: [
      ...(type === "block_card" ? ["Block card in core system immediately"] : []),
      ...(v.unauthorisedTxn ? ["Unauthorised debit reported — register fraud complaint now (zero-liability window: 3 working days)"] : []),
    ],
  };
}

const BUILDERS: Record<ServiceId, (v: Values, acc: Account | undefined, meta: FormMeta) => FilledForm> = {
  deposit,
  account_open: accountOpen,
  scheme_enroll: schemeForm,
  update_details: updateForm,
  service_request: requestForm,
};

export function buildBankForm(service: ServiceId, v: Values, acc: Account | undefined, meta: FormMeta): FilledForm {
  return BUILDERS[service](v, acc, meta);
}

/** Fields still to collect at the counter (for the console badge). */
export function pendingCount(form: FilledForm): number {
  return form.sections.reduce((n, s) => n + s.fields.filter((x) => x.source === "counter").length, 0);
}
