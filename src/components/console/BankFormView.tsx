import { CreditCard, Database, Mic, PenLine, Settings2, TriangleAlert, type LucideIcon } from "lucide-react";
import type { FieldSource, FilledForm } from "@/lib/bankForms";
import { BANK } from "@/lib/bankRules";

const SOURCE: Record<FieldSource, { icon: LucideIcon; label: string }> = {
  customer: { icon: Mic, label: "Told by customer, read back" },
  card: { icon: CreditCard, label: "Read from card photo" },
  record: { icon: Database, label: "From bank record" },
  system: { icon: Settings2, label: "Filled by system" },
  counter: { icon: PenLine, label: "Collect at counter" },
};

/** The bank's own form, fully pre-filled. Used for the counter detail, the scan result and print. */
export function BankFormView({ form, showHeader = true }: { form: FilledForm; showHeader?: boolean }) {
  return (
    <article className="rounded-xl border border-line bg-white print:rounded-none print:border-0">
      {showHeader && (
        <header className="border-b-2 border-ink px-5 py-4">
          <p className="text-sm text-muted">{BANK.name}, {BANK.branch} branch</p>
          <h2 className="text-xl font-semibold">{form.title}</h2>
          <p className="text-sm text-muted">{form.formRef}</p>
        </header>
      )}
      {form.flags.length > 0 && (
        <ul className="space-y-1 border-b border-line bg-saffron-soft px-5 py-3">
          {form.flags.map((flag) => (
            <li key={flag} className="flex items-start gap-2 font-medium text-saffron-dark">
              <TriangleAlert aria-hidden size={18} className="mt-0.5 shrink-0" />
              {flag}
            </li>
          ))}
        </ul>
      )}
      <div className="divide-y divide-line">
        {form.sections.map((section) => (
          <section key={section.title} className="break-inside-avoid px-5 py-4">
            <h3 className="mb-2 text-base font-semibold text-brand">{section.title}</h3>
            <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {section.fields.map((field) => {
                const src = SOURCE[field.source];
                return (
                  <div key={field.id} className="min-w-0">
                    <dt className="flex items-center gap-1.5 text-sm text-muted">
                      <src.icon aria-label={src.label} size={14} className="shrink-0" />
                      {field.label}
                    </dt>
                    <dd className={field.value === null ? "text-saffron-dark italic" : "font-semibold break-words"}>
                      {field.value ?? "Collect at counter"}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {section.table && section.table.rows.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-md text-sm">
                  <thead>
                    <tr className="border-b border-ink text-left">
                      {section.table.headers.map((h) => (
                        <th key={h} className="py-1 pr-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr key={i} className="border-b border-line">
                        {row.map((cell, j) => (
                          <td key={j} className={`py-1 pr-3 ${cell === "collect at counter" ? "italic text-saffron-dark" : ""}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
