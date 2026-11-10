import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/console/ConsoleShell";
import { currentConfig } from "@/lib/config";
import { currentStaff } from "@/server/staff";

export const metadata: Metadata = { title: "Staff console | Sahayak" };
export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const staff = await currentStaff(); // also loads accounts + branch config
  if (!staff) redirect("/console/login");
  return (
    <ConsoleShell staffName={staff.name} branch={`${currentConfig().branch} branch`}>
      {children}
    </ConsoleShell>
  );
}
