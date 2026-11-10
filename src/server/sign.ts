/**
 * QR tokens: the complete filled bank form, deflate-compressed, encrypted with
 * AES-256-GCM and HMAC-signed. Anyone scanning the customer's slip with a phone sees
 * only ciphertext; the branch server decrypts and verifies it offline (no database
 * needed). Any change breaks both the GCM tag and the HMAC.
 *   v3 format:  "v3.<base64url(iv | ciphertext | tag)>.<hmac>"
 *   v2 (older): "<base64url(deflate(json))>.<hmac>"  — still verifiable.
 */
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { signingSecret } from "./config";

const MAX_INFLATED_BYTES = 64 * 1024;

function hmac(data: string): string {
  return createHmac("sha256", signingSecret()).update(data).digest("base64url");
}

function encryptionKey(): Buffer {
  return Buffer.from(hkdfSync("sha256", signingSecret(), "sahayak-qr", "aes-256-gcm v3", 32));
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function signPayload(payload: object): string {
  const plain = deflateRawSync(Buffer.from(JSON.stringify(payload), "utf8"), { level: 9 });
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const body = Buffer.concat([iv, cipher.update(plain), cipher.final(), cipher.getAuthTag()]).toString("base64url");
  return `v3.${body}.${hmac(`v3.${body}`)}`;
}

export type VerifyResult = { valid: true; payload: Record<string, unknown> } | { valid: false; reason: string };

function inflateJson(buf: Buffer): Record<string, unknown> {
  return JSON.parse(inflateRawSync(buf, { maxOutputLength: MAX_INFLATED_BYTES }).toString("utf8"));
}

export function verifyToken(token: string): VerifyResult {
  const parts = token.trim().split(".");
  try {
    if (parts[0] === "v3" && parts.length === 3) {
      const [, body, sig] = parts;
      if (!safeEqual(sig, hmac(`v3.${body}`))) return { valid: false, reason: "signature mismatch — data was changed" };
      const raw = Buffer.from(body, "base64url");
      if (raw.length < 29) return { valid: false, reason: "malformed payload" };
      const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), raw.subarray(0, 12));
      decipher.setAuthTag(raw.subarray(raw.length - 16));
      const plain = Buffer.concat([decipher.update(raw.subarray(12, raw.length - 16)), decipher.final()]);
      return { valid: true, payload: inflateJson(plain) };
    }
    if (parts.length === 2) {
      const [body, sig] = parts;
      if (!safeEqual(sig, hmac(body))) return { valid: false, reason: "signature mismatch — data was changed" };
      return { valid: true, payload: inflateJson(Buffer.from(body, "base64url")) };
    }
    return { valid: false, reason: "malformed" };
  } catch {
    return { valid: false, reason: "malformed or altered payload" };
  }
}

/** 6-character code without look-alike characters (0/O, 1/I/L), shown as "K7Q-4M2". */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function shortCode(): string {
  const chars = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]);
  return `${chars.slice(0, 3).join("")}-${chars.slice(3).join("")}`;
}

/** Human application reference: SGB/HSK/2026-11-10/K7Q4M2 style. */
export function applicationReference(code: string, createdAt: string, branch: string): string {
  return `SGB/${branch.slice(0, 3).toUpperCase()}/${createdAt.slice(0, 10)}/${code.replace("-", "")}`;
}
