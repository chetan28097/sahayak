/**
 * Supabase repository. Uses the secret (service-role) key, server-side only.
 * Tables have RLS enabled with no policies, so the public anon key can read nothing.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SessionState } from "@/lib/machine";
import type { Account } from "@/lib/types";
import type { BankConfig } from "@/lib/config";
import type { Repo, RequestEvent, RequestFilter, RequestRecord, RequestUpdate, TurnLog } from "./types";

type Row = Record<string, unknown>;

function toAccount(r: Row): Account {
  return {
    accountNumber: String(r.account_number),
    holder: String(r.holder),
    holderLocal: (r.holder_local ?? {}) as Account["holderLocal"],
    branch: String(r.branch),
    accountType: (r.account_type as string) ?? undefined,
    fatherOrSpouse: (r.father_or_spouse as string) ?? undefined,
    dob: (r.dob as string) ?? undefined,
    mobile: (r.mobile as string) ?? undefined,
    address: (r.address as string) ?? undefined,
    aadhaarLast4: (r.aadhaar_last4 as string) ?? undefined,
    pan: (r.pan as string) ?? undefined,
    cardLast4: (r.card_last4 as string) ?? undefined,
    balance: Number(r.balance ?? 0),
    transactions: (r.transactions ?? []) as Account["transactions"],
    schemes: (r.schemes ?? []) as string[],
  };
}

function toRequest(r: Row): RequestRecord {
  return {
    id: String(r.id),
    code: String(r.code),
    sessionId: (r.session_id as string) ?? null,
    service: r.service as RequestRecord["service"],
    lang: r.lang as RequestRecord["lang"],
    status: r.status as RequestRecord["status"],
    urgent: Boolean(r.urgent),
    needsStaff: Boolean(r.needs_staff),
    accountNumber: (r.account_number as string) ?? null,
    customerName: (r.customer_name as string) ?? null,
    summary: (r.summary as string) ?? null,
    form: r.form as RequestRecord["form"],
    customer: r.customer_fields as RequestRecord["customer"],
    token: String(r.token),
    readBackAt: String(r.read_back_at),
    createdAt: String(r.created_at),
    processedAt: (r.processed_at as string) ?? null,
    staffNote: (r.staff_note as string) ?? null,
    kind: ((r.kind as string) ?? "application") as RequestRecord["kind"],
    checklist: (r.checklist ?? {}) as RequestRecord["checklist"],
    escalated: Boolean(r.escalated),
    assignedTo: (r.assigned_to as string) ?? null,
  };
}

function fromRequest(r: RequestRecord): Row {
  return {
    id: r.id, code: r.code, session_id: r.sessionId, service: r.service, lang: r.lang, status: r.status, urgent: r.urgent,
    needs_staff: r.needsStaff, account_number: r.accountNumber, customer_name: r.customerName, summary: r.summary,
    form: r.form, customer_fields: r.customer, token: r.token, read_back_at: r.readBackAt, created_at: r.createdAt,
    processed_at: r.processedAt, staff_note: r.staffNote, kind: r.kind, checklist: r.checklist, escalated: r.escalated,
    assigned_to: r.assignedTo,
  };
}

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`supabase: ${result.error.message}`);
  return result.data;
}

export function createSupabaseRepo(url: string, secretKey: string): Repo {
  const db: SupabaseClient = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

  return {
    kind: "supabase",
    async listAccounts() {
      return (check(await db.from("accounts").select("*").order("holder")) as Row[]).map(toAccount);
    },
    async getSession(id) {
      const row = check(await db.from("sessions").select("state").eq("id", id).maybeSingle()) as Row | null;
      return row ? (row.state as SessionState) : null;
    },
    async saveSession(state) {
      check(
        await db.from("sessions").upsert({
          id: state.id, lang: state.lang, service: state.form, state, created_at: state.createdAt, updated_at: state.updatedAt,
        }),
      );
    },
    async createRequest(record) {
      check(await db.from("requests").insert(fromRequest(record)));
    },
    async getRequest(id) {
      const row = check(await db.from("requests").select("*").eq("id", id).maybeSingle()) as Row | null;
      return row ? toRequest(row) : null;
    },
    async getRequestByCode(code) {
      const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (clean.length !== 6) return null;
      const row = check(
        await db.from("requests").select("*").eq("code", `${clean.slice(0, 3)}-${clean.slice(3)}`).maybeSingle(),
      ) as Row | null;
      return row ? toRequest(row) : null;
    },
    async listRequests(filter: RequestFilter) {
      let query = db.from("requests").select("*").order("created_at", { ascending: false }).limit(filter.limit ?? 200);
      if (filter.status) query = query.eq("status", filter.status);
      if (filter.statuses) query = query.in("status", filter.statuses);
      if (filter.escalated !== undefined) query = query.eq("escalated", filter.escalated);
      if (filter.service) query = query.eq("service", filter.service);
      if (filter.accountNumber) query = query.eq("account_number", filter.accountNumber);
      if (filter.sessionId) query = query.eq("session_id", filter.sessionId);
      if (filter.since) query = query.gte("created_at", filter.since);
      const q = filter.q?.trim().replace(/[^\p{L}\p{N}\s-]/gu, "");
      if (q) query = query.or(`code.ilike.%${q}%,customer_name.ilike.%${q}%,account_number.ilike.%${q}%`);
      return (check(await query) as Row[]).map(toRequest);
    },
    async updateRequest(id, update: RequestUpdate) {
      const patch: Row = {};
      if (update.status) {
        patch.status = update.status;
        patch.processed_at = update.status === "completed" || update.status === "rejected" ? new Date().toISOString() : null;
      }
      if (update.staffNote !== undefined) patch.staff_note = update.staffNote;
      if (update.checklist !== undefined) patch.checklist = update.checklist;
      if (update.escalated !== undefined) patch.escalated = update.escalated;
      if (update.assignedTo !== undefined) patch.assigned_to = update.assignedTo;
      const row = check(await db.from("requests").update(patch).eq("id", id).select("*").maybeSingle()) as Row | null;
      return row ? toRequest(row) : null;
    },
    async addEvent(event: RequestEvent) {
      check(await db.from("request_events").insert({ request_id: event.requestId, at: event.at, actor: event.actor, action: event.action, note: event.note }));
    },
    async listEvents(filter) {
      let query = db
        .from("request_events")
        .select("*")
        .order("at", { ascending: !!filter.requestId })
        .limit(filter.limit ?? 500);
      if (filter.requestId) query = query.eq("request_id", filter.requestId);
      if (filter.since) query = query.gte("at", filter.since);
      return (check(await query) as Row[]).map((r) => ({
        id: Number(r.id), requestId: String(r.request_id), at: String(r.at), actor: String(r.actor), action: String(r.action),
        note: (r.note as string) ?? null,
      }));
    },
    async getConfig() {
      const row = check(await db.from("branch_config").select("config").eq("id", 1).maybeSingle()) as Row | null;
      return row ? (row.config as BankConfig) : null;
    },
    async saveConfig(config, by) {
      check(await db.from("branch_config").upsert({ id: 1, config, updated_at: new Date().toISOString(), updated_by: by }));
    },
    async appendLog(sessionId, entry: TurnLog) {
      check(await db.from("turn_logs").insert({ session_id: sessionId, at: entry.at, entry }));
    },
  };
}
