import type { AfterSubmit } from "@/lib/afterSubmit";
import type { FilledForm } from "@/lib/bankForms";
import type { BankConfig } from "@/lib/config";
import type { SessionState } from "@/lib/machine";
import type { Account, Lang, NoteBreakdown, ServiceId } from "@/lib/types";
import { REQUEST_STATUSES, type ChecklistState, type RequestStatus } from "@/lib/workflow";

export { REQUEST_STATUSES, type RequestStatus };

/** One row of the customer's bilingual copy. */
export interface SlipField {
  key: string;
  label: string;
  labelLocal: string;
  value: string;
  valueLocal: string;
}

export interface CustomerCopy {
  rows: SlipField[];
  notes?: NoteBreakdown;
  amount?: number;
  /** What to bring and what happens next, in all languages (see lib/afterSubmit). */
  after?: AfterSubmit;
  reference?: string;
}

export type RequestKind = "application" | "assist";

export interface RequestRecord {
  id: string;
  code: string;
  kind: RequestKind;
  sessionId: string | null;
  service: ServiceId;
  lang: Lang;
  status: RequestStatus;
  urgent: boolean;
  needsStaff: boolean;
  escalated: boolean;
  assignedTo: string | null;
  checklist: ChecklistState;
  accountNumber: string | null;
  customerName: string | null;
  summary: string | null;
  form: FilledForm;
  customer: CustomerCopy;
  token: string;
  readBackAt: string;
  createdAt: string;
  processedAt: string | null;
  staffNote: string | null;
}

export interface RequestFilter {
  status?: RequestStatus;
  statuses?: RequestStatus[];
  service?: ServiceId;
  accountNumber?: string;
  sessionId?: string;
  escalated?: boolean;
  q?: string;
  since?: string;
  limit?: number;
}

export type RequestUpdate = Partial<Pick<RequestRecord, "status" | "staffNote" | "checklist" | "escalated" | "assignedTo">>;

export interface RequestEvent {
  id?: number;
  requestId: string;
  at: string;
  actor: string;
  action: string;
  note: string | null;
}

export interface TurnLog {
  at: string;
  source: "voice" | "mock-voice" | "typed" | "tap" | "card";
  heard?: string;
  said: string;
  stepBefore?: string | null;
  usedLlm?: boolean;
  latencyMs?: Record<string, number>;
  error?: string;
}

/** Storage port. Implementations: Supabase (cloud) and JSON files (offline / tests). */
export interface Repo {
  readonly kind: "supabase" | "file";
  listAccounts(): Promise<Account[]>;
  getSession(id: string): Promise<SessionState | null>;
  saveSession(state: SessionState): Promise<void>;
  createRequest(record: RequestRecord): Promise<void>;
  getRequest(id: string): Promise<RequestRecord | null>;
  getRequestByCode(code: string): Promise<RequestRecord | null>;
  listRequests(filter: RequestFilter): Promise<RequestRecord[]>;
  updateRequest(id: string, update: RequestUpdate): Promise<RequestRecord | null>;
  addEvent(event: RequestEvent): Promise<void>;
  listEvents(filter: { requestId?: string; since?: string; limit?: number }): Promise<RequestEvent[]>;
  getConfig(): Promise<BankConfig | null>;
  saveConfig(config: BankConfig, by: string): Promise<void>;
  appendLog(sessionId: string, entry: TurnLog): Promise<void>;
}
