import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestWorkbench } from "@/components/console/RequestWorkbench";
import { isValidId, repo } from "@/server/store";

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidId(id) || !(await repo.getRequest(id))) notFound();
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Link href="/console/applications" className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
        <ArrowLeft size={18} aria-hidden /> Applications
      </Link>
      <RequestWorkbench id={id} />
    </div>
  );
}
