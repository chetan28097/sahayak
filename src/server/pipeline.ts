/**
 * One conversational turn: (STT) → rules state machine → (Gemini fallback) → request.
 * Rules always run first; the LLM is only consulted for utterances rules can't parse.
 */
import { serviceOf } from "@/lib/forms";
import { t } from "@/lib/i18n";
import {
  askFor, buildView, currentStep, handle, handleNlu, markIssued, type MachineDeps, type MachineInput,
  type MachineResult, type SessionState, type SessionView,
} from "@/lib/machine";
import type { CardData, CardKind } from "@/lib/types";
import { geminiAvailable, liveVoiceAvailable } from "./config";
import { readCard, summarizeComplaint, understand } from "./gemini";
import { mockCard, mockTranscript } from "./mock";
import { createAssistRequest, issueRequest } from "./slip";
import { appendTurnLog, ensureAccounts, findAccount, repo, type TurnLog } from "./store";
import { transcribe } from "./voice";

export const deps: MachineDeps = { findAccount, now: () => new Date().toISOString() };

export type TurnInput =
  | { kind: "audio"; wav: Blob }
  | { kind: "text"; text: string }
  | { kind: "action"; action: MachineInput }
  | { kind: "card"; cardKind: CardKind; image: Blob | null };

export interface TurnOutput {
  view: SessionView;
  say: string;
  heard: string | null;
  usedLlm: boolean;
  /** Set when this turn issued a slip/form. */
  issued: { id: string; code: string; urgent: boolean } | null;
  error?: string;
}

const isLive = (s: SessionState) => s.mode === "live" && liveVoiceAvailable();

async function interpretWithLlm(state: SessionState, text: string, rules: MachineResult): Promise<{ result: MachineResult; used: boolean }> {
  if (!rules.unclear || state.mode !== "live" || !geminiAvailable()) return { result: rules, used: false };
  const step = currentStep(state);
  const nlu = await understand(
    {
      lang: state.lang,
      question: askFor(state, deps),
      stepId: step?.id ?? "task",
      input: step?.input ?? "choice",
      options:
        step?.options?.map((o) => o.value) ??
        (state.form && !state.afterSlip ? [] : ["deposit", "account_open", "scheme_enroll", "update_details", "service_request"]),
      confirming: state.pending?.prompt ?? null,
      reviewFields: step?.input === "review" ? step.scope ?? [] : [],
    },
    text,
  );
  const second = nlu ? handleNlu(state, nlu, deps) : null;
  return second ? { result: second, used: true } : { result: rules, used: false };
}

async function readCardImage(state: SessionState, kind: CardKind, image: Blob | null): Promise<CardData | null> {
  if (!isLive(state)) return mockCard(kind);
  if (!geminiAvailable() || !image) return null; // never show demo data in live mode
  const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
  return readCard(kind, base64, image.type || "image/jpeg");
}

async function complaintSummary(state: SessionState): Promise<string | null> {
  const text = state.values.complaintText;
  if (state.form !== "service_request" || !text) return null;
  const llm = isLive(state) && geminiAvailable() ? await summarizeComplaint(text, state.lang) : null;
  return llm ?? text.slice(0, 140);
}

export async function processTurn(state: SessionState, input: TurnInput): Promise<TurnOutput> {
  await ensureAccounts();
  const started = Date.now();
  const latency: Record<string, number> = {};
  let heard: string | null = null;
  let source: TurnLog["source"] = "tap";
  let result: MachineResult;
  let usedLlm = false;
  let error: string | undefined;

  if (input.kind === "audio" || input.kind === "text") {
    if (input.kind === "audio") {
      const t0 = Date.now();
      try {
        heard = isLive(state) ? await transcribe(input.wav, state.lang) : mockTranscript(state);
      } catch (e) {
        // Network/rate-limit trouble becomes a friendly "please say it again", never a dead end.
        error = e instanceof Error ? e.message : String(e);
        heard = "";
      }
      latency.stt = Date.now() - t0;
      source = isLive(state) ? "voice" : "mock-voice";
    } else {
      heard = input.text;
      source = "typed";
    }
    const rules = handle(state, { type: "text", text: heard }, deps);
    const t1 = Date.now();
    ({ result, used: usedLlm } = await interpretWithLlm(state, heard, rules));
    if (usedLlm) latency.llm = Date.now() - t1;
  } else if (input.kind === "card") {
    const t0 = Date.now();
    const data = await readCardImage(state, input.cardKind, input.image);
    latency.vision = Date.now() - t0;
    source = "card";
    result = handle(state, { type: "card", kind: input.cardKind, data }, deps);
  } else {
    result = handle(state, input.action, deps);
  }

  let next = result.state;
  let say = result.say;
  let issued: TurnOutput["issued"] = null;
  if (next.staffMode && !state.staffMode) {
    // First "call staff" in this session → a real help request in the counter queue.
    await createAssistRequest(next);
    say = `${t(next.lang, "staffComing")} ${askFor(next, deps)}`.trim();
    next = { ...next, lastSay: say };
  }
  if (result.done && next.form) {
    const record = await issueRequest(next, await complaintSummary(next));
    const doneSay = t(next.lang, serviceOf(next.form).doneKey(next.values), {
      code: record.code.replace("-", "").split("").join(" "),
    });
    ({ state: next, say } = markIssued(next, record.id, doneSay, deps));
    issued = { id: record.id, code: record.code, urgent: record.urgent };
  }
  await repo.saveSession(next);
  latency.total = Date.now() - started;
  await appendTurnLog(state.id, {
    at: deps.now(),
    source,
    heard: heard ?? undefined,
    said: say,
    stepBefore: currentStep(state)?.id ?? null,
    usedLlm,
    latencyMs: latency,
    error,
  });
  return { view: buildView(next, deps), say, heard, usedLlm, issued, error: error ? "stt_failed" : undefined };
}
