/** JSON-file repository: used offline, in tests, and when Supabase isn't configured. */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { BankConfig } from "@/lib/config";
import type { SessionState } from "@/lib/machine";
import type { Account } from "@/lib/types";
import type { Repo, RequestEvent, RequestFilter, RequestRecord, RequestUpdate, TurnLog } from "./types";

/** Older records (before the lifecycle upgrade) are normalised on read. */
export function normaliseRecord(r: RequestRecord): RequestRecord {
  const legacy = r.status as string;
  return {
    ...r,
    kind: r.kind ?? "application",
    status: legacy === "done" ? "completed" : legacy === "in_progress" ? "in_review" : r.status,
    checklist: r.checklist ?? {},
    escalated: r.escalated ?? false,
    assignedTo: r.assignedTo ?? null,
  };
}

export function matchesFilter(r: RequestRecord, filter: RequestFilter): boolean {
  const q = filter.q?.toLowerCase().trim();
  return (
    (!filter.status || r.status === filter.status) &&
    (!filter.statuses || filter.statuses.includes(r.status)) &&
    (!filter.service || r.service === filter.service) &&
    (!filter.accountNumber || r.accountNumber === filter.accountNumber) &&
    (!filter.sessionId || r.sessionId === filter.sessionId) &&
    (filter.escalated === undefined || r.escalated === filter.escalated) &&
    (!filter.since || r.createdAt >= filter.since) &&
    (!q ||
      r.code.toLowerCase().replace("-", "").includes(q.replace("-", "")) ||
      (r.customerName ?? "").toLowerCase().includes(q) ||
      (r.accountNumber ?? "").includes(q))
  );
}

export function createFileRepo(root = path.join(process.cwd(), "data")): Repo {
  const dirs = {
    sessions: path.join(root, "sessions"),
    requests: path.join(root, "requests"),
    logs: path.join(root, "logs"),
  };
  const eventsFile = path.join(root, "events.jsonl");
  const configFile = path.join(root, "branch-config.json");

  /** Atomic write (temp file + rename) so a concurrent read never sees half a file. */
  async function writeFile(target: string, data: unknown) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(temp, target);
  }
  const write = (dir: string, id: string, data: unknown) => writeFile(path.join(dir, `${id}.json`), data);
  async function read<T>(file: string): Promise<T | null> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as T;
    } catch {
      return null;
    }
  }
  const readIn = <T>(dir: string, id: string) => read<T>(path.join(dir, `${id}.json`));
  async function all(): Promise<RequestRecord[]> {
    try {
      const files = (await fs.readdir(dirs.requests)).filter((x) => x.endsWith(".json"));
      const records = await Promise.all(files.map((x) => readIn<RequestRecord>(dirs.requests, x.slice(0, -5))));
      return records.filter((r): r is RequestRecord => r !== null).map(normaliseRecord);
    } catch {
      return [];
    }
  }

  return {
    kind: "file",
    async listAccounts() {
      return JSON.parse(await fs.readFile(path.join(root, "accounts.json"), "utf8")) as Account[];
    },
    getSession: (id) => readIn<SessionState>(dirs.sessions, id),
    saveSession: (state) => write(dirs.sessions, state.id, state),
    createRequest: (record) => write(dirs.requests, record.id, record),
    async getRequest(id) {
      const r = await readIn<RequestRecord>(dirs.requests, id);
      return r ? normaliseRecord(r) : null;
    },
    async getRequestByCode(code) {
      const wanted = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
      return (await all()).find((r) => r.code.replace("-", "") === wanted) ?? null;
    },
    async listRequests(filter: RequestFilter) {
      return (await all())
        .filter((r) => matchesFilter(r, filter))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, filter.limit ?? 200);
    },
    async updateRequest(id, update: RequestUpdate) {
      const current = await readIn<RequestRecord>(dirs.requests, id);
      if (!current) return null;
      const closing = update.status === "completed" || update.status === "rejected";
      const next: RequestRecord = {
        ...normaliseRecord(current),
        ...update,
        processedAt: closing ? new Date().toISOString() : update.status ? null : current.processedAt,
      };
      await write(dirs.requests, id, next);
      return next;
    },
    async addEvent(event: RequestEvent) {
      await fs.mkdir(root, { recursive: true });
      await fs.appendFile(eventsFile, JSON.stringify(event) + "\n", "utf8");
    },
    async listEvents(filter) {
      let lines: string[] = [];
      try {
        lines = (await fs.readFile(eventsFile, "utf8")).split("\n").filter(Boolean);
      } catch {
        return [];
      }
      return lines
        .map((l) => JSON.parse(l) as RequestEvent)
        .filter((e) => (!filter.requestId || e.requestId === filter.requestId) && (!filter.since || e.at >= filter.since))
        .sort((a, b) => (filter.requestId ? a.at.localeCompare(b.at) : b.at.localeCompare(a.at)))
        .slice(0, filter.limit ?? 500);
    },
    getConfig: () => read<BankConfig>(configFile),
    saveConfig: (config) => writeFile(configFile, config),
    async appendLog(sessionId, entry: TurnLog) {
      await fs.mkdir(dirs.logs, { recursive: true });
      await fs.appendFile(path.join(dirs.logs, `${sessionId}.jsonl`), JSON.stringify(entry) + "\n", "utf8");
    },
  };
}
