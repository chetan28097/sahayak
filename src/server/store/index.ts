/**
 * Storage entry point. Supabase when SUPABASE_URL + SUPABASE_SECRET_KEY are set,
 * otherwise local JSON files (offline rehearsal, tests). Accounts are cached in
 * memory so the pure state machine can look them up synchronously.
 */
import { ConfigSchema, DEFAULT_CONFIG, setConfig } from "@/lib/config";
import type { Account } from "@/lib/types";
import { createFileRepo } from "./file";
import { createSupabaseRepo } from "./supabase";
import type { Repo, TurnLog } from "./types";

export * from "./types";

const ID_RE = /^[a-f0-9-]{36}$/;
export const isValidId = (id: string) => ID_RE.test(id);

type Global = typeof globalThis & { __bankRepo?: Repo; __bankAccounts?: { list: Account[]; at: number } };
const g = globalThis as Global;

function makeRepo(): Repo {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  return url && key ? createSupabaseRepo(url, key) : createFileRepo();
}

export const repo: Repo = (g.__bankRepo ??= makeRepo());

const ACCOUNT_TTL_MS = 60_000;

/**
 * Load (or refresh) the account cache and the branch configuration.
 * Call before running the machine or building forms.
 */
export async function ensureAccounts(): Promise<Account[]> {
  const cached = g.__bankAccounts;
  if (cached && Date.now() - cached.at < ACCOUNT_TTL_MS) return cached.list;
  const [list, saved] = await Promise.all([repo.listAccounts(), repo.getConfig().catch(() => null)]);
  const parsed = saved ? ConfigSchema.safeParse(saved) : null;
  setConfig(parsed?.success ? parsed.data : DEFAULT_CONFIG);
  g.__bankAccounts = { list, at: Date.now() };
  return list;
}

/** Force the next ensureAccounts() to reload (after a settings change). */
export function invalidateCaches(): void {
  g.__bankAccounts = undefined;
}

export function findAccount(accountNumber: string): Account | undefined {
  return g.__bankAccounts?.list.find((a) => a.accountNumber === accountNumber);
}

/** Masks anything that looks like a 12-digit Aadhaar number. */
export function maskSensitive(text: string): string {
  return text.replace(/\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g, (_m, _a, _b, last) => `XXXX-XXXX-${last}`);
}

/** Turn log: transcripts only (masked). Raw audio is never stored. */
export async function appendTurnLog(sessionId: string, entry: TurnLog): Promise<void> {
  await repo.appendLog(sessionId, { ...entry, heard: entry.heard && maskSensitive(entry.heard) });
}

export async function getSession(id: string) {
  return isValidId(id) ? repo.getSession(id) : null;
}
