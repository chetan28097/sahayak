"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MachineInput, SessionView } from "@/lib/machine";
import type { CardKind } from "@/lib/types";
import { speak, stopSpeaking } from "@/lib/audio/speaker";

export type Status = "idle" | "listening" | "thinking" | "speaking";

type Action = Exclude<MachineInput, { type: "text" } | { type: "card" }>;

interface TurnResponse {
  view: SessionView;
  say: string;
  heard: string | null;
  error?: string;
}

export function useConversation(sessionId: string) {
  const [view, setView] = useState<SessionView | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [heard, setHeard] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsTapToHear, setNeedsTapToHear] = useState(false);
  const viewRef = useRef<SessionView | null>(null);

  const say = useCallback(
    async (text: string, v: SessionView) => {
      setStatus("speaking");
      const result = await speak(text, sessionId, v.lang);
      setNeedsTapToHear(result === "blocked");
      setStatus("idle");
    },
    [sessionId],
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/session/${sessionId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(({ view: v }: { view: SessionView }) => {
        if (cancelled) return;
        setView(v);
        viewRef.current = v;
        if (v.phase !== "ended") void say(v.say, v);
      })
      .catch(() => !cancelled && setError("Session not found."));
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [sessionId, say]);

  const post = useCallback(
    async (body: BodyInit, json: boolean) => {
      stopSpeaking();
      setStatus("thinking");
      setError(null);
      try {
        const res = await fetch("/api/turn", {
          method: "POST",
          headers: json ? { "Content-Type": "application/json" } : undefined,
          body,
        });
        if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "error");
        const data = (await res.json()) as TurnResponse;
        setView(data.view);
        viewRef.current = data.view;
        setHeard(data.heard);
        await say(data.say, data.view);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setStatus("idle");
      }
    },
    [say],
  );

  const sendAudio = useCallback(
    (wav: Blob) => {
      const form = new FormData();
      form.append("sessionId", sessionId);
      form.append("audio", wav, "turn.wav");
      return post(form, false);
    },
    [post, sessionId],
  );

  const sendCard = useCallback(
    (kind: CardKind, image: Blob | null) => {
      const form = new FormData();
      form.append("sessionId", sessionId);
      form.append("card", kind);
      if (image) form.append("image", image, "card.jpg");
      return post(form, false);
    },
    [post, sessionId],
  );

  const sendText = useCallback(
    (text: string) => post(JSON.stringify({ sessionId, text }), true),
    [post, sessionId],
  );

  const sendAction = useCallback(
    (action: Action) => post(JSON.stringify({ sessionId, action }), true),
    [post, sessionId],
  );

  const replay = useCallback(() => {
    const v = viewRef.current;
    if (v) void say(v.say, v);
  }, [say]);

  return { view, status, setStatus, heard, error, needsTapToHear, sendAudio, sendCard, sendText, sendAction, replay };
}
