import { CheckCircle2 } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { ServiceIcon } from "@/components/serviceMeta";
import { BANK } from "@/lib/bankRules";
import type { ServiceId } from "@/lib/types";

export const metadata = { title: "About Sahayak" };

const SERVICES: { id: ServiceId; say: string; form: string; detail: string }[] = [
  { id: "deposit", say: "“ಹಣ ಜಮಾ ಮಾಡಬೇಕು”", form: "Cash deposit slip", detail: "Notes counted against the amount. PAN or Form 60 from ₹50,000." },
  { id: "account_open", say: "“नया खाता खोलना है”", form: "Account opening + KYC", detail: "Details read from the Aadhaar photo, facilities, and up to four nominees with shares (or a recorded opt-out)." },
  { id: "scheme_enroll", say: "“ಅಪಘಾತ ವಿಮೆ ಬೇಕು”", form: "PMSBY, PMJJBY, Atal Pension", detail: "Age and one-policy-per-person checks, pro-rata premium, income-tax rule for APY, spoken auto-debit consent." },
  { id: "update_details", say: "“मोबाइल नंबर बदलना है”", form: "Details update", detail: "Mobile, address, nominee or re-KYC, several in one request." },
  { id: "service_request", say: "“My ATM card is lost”", form: "Card block, cheque book, complaint", detail: "Card blocks reach the counter first. Unauthorised debits are flagged for a fraud report." },
];

const PROMISES = [
  "Every name, number and amount is read back before anything is sent.",
  "Aadhaar only ever appears as its last four digits.",
  "Voice recordings are not kept; only masked text logs.",
  "Balances appear on screen and are never spoken aloud.",
];

export default function About() {
  return (
    <PortalShell>
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-5xl font-semibold leading-tight tracking-tight">Bank forms, filled by talking</h1>
      <p className="mt-4 text-lg text-muted">
        Sahayak runs on a branch tablet or a village agent&apos;s phone. Customers who find forms hard to read or write answer one
        question at a time in Kannada, Hindi or English. Sahayak fills the bank&apos;s own form, reads it back, and sends it to the
        counter with a token.
      </p>

      <h2 className="mt-12 text-2xl font-semibold">What it fills</h2>
      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
        {SERVICES.map((s) => (
          <li key={s.id} className="flex gap-4 p-4">
            <ServiceIcon service={s.id} />
            <div>
              <p className="font-semibold">{s.form}</p>
              <p className="text-muted">{s.detail}</p>
              <p className="mt-1 text-brand">Customer says: {s.say}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl font-semibold">At the counter</h2>
      <p className="mt-3 text-lg text-muted">
        The request is in the teller&apos;s queue before the customer walks up. Scanning the token opens the bank&apos;s form already
        filled, with a checklist of what is left: signatures, original documents, a photograph. The QR code is signed, so a changed
        amount is caught.
      </p>

      <h2 className="mt-12 text-2xl font-semibold">Promises to customers</h2>
      <ul className="mt-4 space-y-3">
        {PROMISES.map((p) => (
          <li key={p} className="flex gap-3">
            <CheckCircle2 aria-hidden size={22} className="mt-0.5 shrink-0 text-ok" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
        {BANK.name} is fictional. Account records, KYC checks and the core banking system are simulated for this demo; card photos only
        pre-fill forms and the bank does the real verification.
      </p>
    </section>
    </PortalShell>
  );
}
