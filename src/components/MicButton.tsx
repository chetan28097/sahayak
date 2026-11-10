"use client";
import { useEffect, useRef, useState } from "react";
import { MAX_RECORDING_MS, VoiceRecorder } from "@/lib/audio/recorder";
import { t } from "@/lib/i18n";
import type { Lang, Mode } from "@/lib/types";
import type { Status } from "./useConversation";

interface Props {
  lang: Lang;
  mode: Mode;
  status: Status;
  onStatus: (s: Status) => void;
  onAudio: (wav: Blob) => void;
}

const MOCK_LISTEN_MS = 1200;

/** Big tap-to-talk button with a live level ring and a countdown to the 28 s cap. */
export function MicButton({ lang, mode, status, onStatus, onAudio }: Props) {
  const recorder = useRef<VoiceRecorder | null>(null);
  const [level, setLevel] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(MAX_RECORDING_MS / 1000));
  const [micError, setMicError] = useState(false);
  const listening = status === "listening";

  useEffect(() => {
    if (!listening) return;
    const timer = setInterval(() => {
      const elapsed = recorder.current?.elapsedMs() ?? 0;
      setSecondsLeft(Math.max(0, Math.ceil((MAX_RECORDING_MS - elapsed) / 1000)));
    }, 250);
    return () => clearInterval(timer);
  }, [listening]);

  async function finish() {
    const rec = recorder.current;
    recorder.current = null;
    setLevel(0);
    if (!rec) return;
    const wav = await rec.stop();
    onAudio(wav);
  }

  async function begin() {
    setMicError(false);
    setSecondsLeft(Math.round(MAX_RECORDING_MS / 1000));
    // Mock mode never touches the microphone: the server supplies the scripted answer.
    if (mode === "mock") return mockListen();
    if (!VoiceRecorder.supported()) {
      setMicError(true);
      return;
    }
    const rec = new VoiceRecorder();
    try {
      recorder.current = rec;
      onStatus("listening");
      await rec.start({ onLevel: setLevel, onAutoStop: () => void finish() });
    } catch {
      recorder.current = null;
      onStatus("idle");
      setMicError(true);
    }
  }

  function mockListen() {
    onStatus("listening");
    setTimeout(() => onAudio(new Blob([], { type: "audio/wav" })), MOCK_LISTEN_MS);
  }

  function toggle() {
    if (listening) void finish();
    else if (status === "idle" || status === "speaking") void begin();
  }

  const busy = status === "thinking";
  const label = listening ? t(lang, "ui.listening") : busy ? t(lang, "ui.thinking") : t(lang, "ui.tapToSpeak");

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={listening}
        aria-label={label}
        className={`relative grid size-28 place-items-center rounded-full text-white shadow-lg transition active:scale-95 sm:size-32 ${
          listening ? "bg-danger" : "bg-saffron hover:bg-saffron-dark"
        } disabled:opacity-60`}
      >
        {listening && (
          <>
            <span aria-hidden className="pulse-ring absolute inset-0 rounded-full bg-danger" />
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border-[6px] border-white/70 transition-transform"
              style={{ transform: `scale(${1 + level * 0.25})` }}
            />
          </>
        )}
        {busy ? (
          <span aria-hidden className="size-10 animate-spin rounded-full border-4 border-white/40 border-t-white" />
        ) : listening ? (
          <span aria-hidden className="relative size-9 rounded-md bg-white" />
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="relative size-12" fill="currentColor">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-2.07A7 7 0 0 0 19 12h-2Z" />
          </svg>
        )}
      </button>
      <p className="min-h-7 text-lg font-medium" aria-live="polite">
        {label}
        {listening && <span className="ml-2 tabular-nums text-muted">{secondsLeft}s</span>}
      </p>
      {listening && <p className="text-sm text-muted">{t(lang, "ui.tapToStop")}</p>}
      {micError && (
        <p role="alert" className="max-w-xs text-center text-sm text-danger">
          {t(lang, "ui.micBlocked")}
        </p>
      )}
    </div>
  );
}
