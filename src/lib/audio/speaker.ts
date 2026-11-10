"use client";
/** Plays assistant speech: cached/live Gnani audio from /api/tts, else browser speechSynthesis. */
import { LANG_CODES, type Lang } from "../types";

let current: HTMLAudioElement | null = null;

export function stopSpeaking(): void {
  current?.pause();
  current = null;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

function browserSpeak(text: string, lang: Lang): Promise<void> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) return resolve();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODES[lang];
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92; // a little slower for elderly listeners
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    synth.speak(utterance);
  });
}

export async function speak(text: string, sessionId: string, lang: Lang): Promise<"played" | "blocked"> {
  stopSpeaking();
  if (!text.trim()) return "played";
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sessionId }),
    });
    if (res.status === 200) {
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      current = audio;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(reject);
      });
      URL.revokeObjectURL(url);
      return "played";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "NotAllowedError") return "blocked";
  }
  await browserSpeak(text, lang);
  return "played";
}
