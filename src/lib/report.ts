/** Branch report aggregation (pure, so it is unit-testable and reused by the page and CSV). */
import type { ServiceId } from "./types";
import { SERVICE_IDS } from "./types";
import type { RequestStatus } from "./workflow";

export interface ReportRow {
  service: ServiceId;
  lang: string;
  status: RequestStatus;
  kind: string;
  urgent: boolean;
  needsStaff: boolean;
  createdAt: string;
  processedAt: string | null;
}

export interface Report {
  total: number;
  completed: number;
  rejected: number;
  open: number;
  needsInfo: number;
  helpCalls: number;
  medianMinutes: number | null;
  byService: { service: ServiceId; total: number; completed: number; medianMinutes: number | null }[];
  byLang: Record<string, number>;
  byDay: { day: string; total: number; completed: number }[];
}

const istDay = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return Math.round(s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2);
}

const minutes = (r: ReportRow) =>
  r.processedAt ? (new Date(r.processedAt).getTime() - new Date(r.createdAt).getTime()) / 60000 : null;

export function buildReport(rows: ReportRow[]): Report {
  const apps = rows.filter((r) => r.kind !== "assist");
  // Turnaround only for requests a person processed (balance enquiries complete instantly).
  const processed = (list: ReportRow[]) =>
    list.filter((r) => r.status === "completed" && r.processedAt && r.processedAt !== r.createdAt).map(minutes).filter((m): m is number => m !== null);
  const days = new Map<string, { total: number; completed: number }>();
  for (const r of apps) {
    const d = days.get(istDay(r.createdAt)) ?? { total: 0, completed: 0 };
    d.total += 1;
    if (r.status === "completed") d.completed += 1;
    days.set(istDay(r.createdAt), d);
  }
  return {
    total: apps.length,
    completed: apps.filter((r) => r.status === "completed").length,
    rejected: apps.filter((r) => r.status === "rejected").length,
    open: apps.filter((r) => !["completed", "rejected"].includes(r.status)).length,
    needsInfo: apps.filter((r) => r.status === "needs_info").length,
    helpCalls: rows.filter((r) => r.kind === "assist").length,
    medianMinutes: median(processed(apps)),
    byService: SERVICE_IDS.map((service) => {
      const list = apps.filter((r) => r.service === service);
      return { service, total: list.length, completed: list.filter((r) => r.status === "completed").length, medianMinutes: median(processed(list)) };
    }),
    byLang: apps.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.lang]: (acc[r.lang] ?? 0) + 1 }), {}),
    byDay: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, ...v })),
  };
}

const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function toCsv(header: string[], rows: (string | number | null)[][]): string {
  return [header, ...rows].map((r) => r.map((c) => esc(c === null ? "" : String(c))).join(",")).join("\n");
}
