import { beforeAll, describe, expect, it } from "vitest";
import { downsample, encodeWav, rms } from "@/lib/audio/wav";

beforeAll(() => {
  process.env.SLIP_SIGNING_SECRET = "test-secret-0123456789abcdef";
});

describe("WAV encoding", () => {
  it("writes a 16 kHz mono 16-bit PCM header", () => {
    const buf = encodeWav(new Float32Array(160));
    const view = new DataView(buf);
    const str = (o: number) => String.fromCharCode(...new Uint8Array(buf, o, 4));
    expect(str(0)).toBe("RIFF");
    expect(str(8)).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(buf.byteLength).toBe(44 + 320);
  });
  it("downsamples 48 kHz to 16 kHz", () => {
    expect(downsample(new Float32Array(48000).fill(0.5), 48000).length).toBe(16000);
  });
  it("measures loudness", () => {
    expect(rms(new Float32Array([0.5, -0.5]))).toBeCloseTo(0.5);
  });
});

describe("slip signing", () => {
  it("verifies untouched tokens and rejects tampered ones", async () => {
    const { signPayload, verifyToken, shortCode } = await import("@/server/sign");
    const token = signPayload({ f: { amount: "₹12,500" } });
    expect(verifyToken(token).valid).toBe(true);
    const [body, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ f: { amount: "₹99,500" } })).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`).valid).toBe(false);
    expect(verifyToken(`${body}.x`).valid).toBe(false);
    expect(shortCode()).toMatch(/^[2-9A-HJKMNP-Z]{3}-[2-9A-HJKMNP-Z]{3}$/);
  });
});

describe("STT response parsing", () => {
  it("finds the transcript in common response shapes", async () => {
    const { pickTranscript } = await import("@/server/voice");
    expect(pickTranscript({ transcript: "12500" })).toBe("12500");
    expect(pickTranscript({ data: { text: "haan" } })).toBe("haan");
    expect(pickTranscript({ results: [{ transcript: "ok" }] })).toBe("ok");
    expect(pickTranscript({ nothing: 1 })).toBeNull();
  });
});

describe("Aadhaar masking in logs", () => {
  it("masks 12-digit numbers but leaves 11-digit account numbers", async () => {
    const { maskSensitive } = await import("@/server/store");
    expect(maskSensitive("aadhaar 1234 5678 4821")).toBe("aadhaar XXXX-XXXX-4821");
    expect(maskSensitive("30214567891")).toBe("30214567891");
  });
});
