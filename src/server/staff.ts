/**
 * Staff console auth: the branch PIN (env STAFF_PIN) plus choosing who you are from the
 * branch staff list. The httpOnly cookie holds "<staffId>.<HMAC(staffId, PIN)>" — the PIN is
 * never stored client-side, and every audit event is attributed to a named person.
 * Login attempts are rate-limited per client.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { currentConfig, type Staff } from "@/lib/config";
import { signingSecret } from "./config";
import { ensureAccounts } from "./store";

export const STAFF_COOKIE = "sahayak_staff";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

function staffPin(): string | null {
  const pin = process.env.STAFF_PIN;
  return pin && pin.length >= 4 ? pin : null;
}

export function staffToken(staffId: string): string | null {
  const pin = staffPin();
  if (!pin) return null;
  return `${staffId}.${createHmac("sha256", signingSecret()).update(`staff:${staffId}:${pin}`).digest("base64url")}`;
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The signed-in staff member, or null. */
export async function currentStaff(): Promise<Staff | null> {
  const value = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!value) return null;
  await ensureAccounts(); // loads the saved staff list

  const staffId = value.split(".")[0];
  const expected = staffToken(staffId);
  if (!expected || !safeEqual(value, expected)) return null;
  return currentConfig().staff.find((s) => s.id === staffId) ?? null;
}

export async function isStaff(): Promise<boolean> {
  return (await currentStaff()) !== null;
}

type Attempts = Map<string, { count: number; first: number }>;
const g = globalThis as typeof globalThis & { __staffAttempts?: Attempts };
const attempts: Attempts = (g.__staffAttempts ??= new Map());

export function checkPin(pin: string, client: string): "ok" | "wrong" | "locked" | "unconfigured" {
  const expected = staffPin();
  if (!expected) return "unconfigured";
  const now = Date.now();
  const entry = attempts.get(client);
  if (entry && now - entry.first < WINDOW_MS && entry.count >= MAX_ATTEMPTS) return "locked";
  if (safeEqual(pin, expected)) {
    attempts.delete(client);
    return "ok";
  }
  const fresh = !entry || now - entry.first >= WINDOW_MS;
  attempts.set(client, fresh ? { count: 1, first: now } : { count: entry.count + 1, first: entry.first });
  return "wrong";
}
