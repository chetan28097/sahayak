import { ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BankFormView } from "@/components/console/BankFormView";
import { PrintButton } from "@/components/PrintButton";
import { verifyToken } from "@/server/sign";
import { isValidId, repo } from "@/server/store";

/** Print view of one request's bank form (linked from the counter screen). */
export default async function RequestPrint({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = isValidId(id) ? await repo.getRequest(id) : null;
  if (!record) notFound();
  const signature = verifyToken(record.token);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="no-print flex flex-wrap items-center gap-3">
        <Link href={`/console/requests/${record.id}`} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
          <ArrowLeft size={18} aria-hidden /> Back to the application
        </Link>
        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${signature.valid ? "text-ok" : "text-danger"}`}>
          {signature.valid ? <ShieldCheck size={18} aria-hidden /> : <ShieldAlert size={18} aria-hidden />}
          {signature.valid ? "Signature verified" : "Signature invalid"}
        </span>
        <span className="ml-auto" />
        <PrintButton />
      </div>
      <p className="text-sm text-muted">
        Token {record.code}, read back to the customer at{" "}
        {new Date(record.readBackAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
      </p>
      <BankFormView form={record.form} />
    </div>
  );
}
