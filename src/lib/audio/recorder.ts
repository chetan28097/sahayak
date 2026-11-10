"use client";
/**
 * Tap-to-talk WAV recorder (AudioWorklet → 16 kHz mono PCM WAV).
 * Never always-listening: records only after a tap, stops on ~1.5 s of
 * silence after speech, or at the 28 s cap (Gnani's limit is 30 s).
 */
import { downsample, encodeWav, rms } from "./wav";

export const MAX_RECORDING_MS = 28_000;
const SILENCE_AFTER_SPEECH_MS = 1_500;
const NO_SPEECH_TIMEOUT_MS = 8_000;
const SPEECH_THRESHOLD = 0.02;

export interface RecorderCallbacks {
  onLevel?: (level: number) => void;
  onAutoStop?: () => void;
}

export class VoiceRecorder {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private chunks: Float32Array[] = [];
  private startedAt = 0;
  private lastSpeechAt = 0;
  private heardSpeech = false;
  private stopped = false;

  static supported(): boolean {
    return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && "AudioWorkletNode" in window;
  }

  async start({ onLevel, onAutoStop }: RecorderCallbacks = {}): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.ctx = new AudioContext();
    await this.ctx.audioWorklet.addModule("/recorder-worklet.js");
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.ctx, "recorder-processor");
    const mute = this.ctx.createGain();
    mute.gain.value = 0;
    source.connect(this.node).connect(mute).connect(this.ctx.destination);

    this.chunks = [];
    this.stopped = false;
    this.heardSpeech = false;
    this.startedAt = performance.now();
    this.lastSpeechAt = this.startedAt;

    this.node.port.onmessage = (e: MessageEvent<Float32Array>) => {
      if (this.stopped) return;
      this.chunks.push(e.data);
      const level = rms(e.data);
      onLevel?.(Math.min(1, level * 8));
      const now = performance.now();
      if (level > SPEECH_THRESHOLD) {
        this.heardSpeech = true;
        this.lastSpeechAt = now;
      }
      const elapsed = now - this.startedAt;
      const silentFor = now - this.lastSpeechAt;
      if (
        elapsed >= MAX_RECORDING_MS ||
        (this.heardSpeech && silentFor >= SILENCE_AFTER_SPEECH_MS) ||
        (!this.heardSpeech && elapsed >= NO_SPEECH_TIMEOUT_MS)
      ) {
        this.stopped = true;
        onAutoStop?.();
      }
    };
  }

  elapsedMs(): number {
    return this.startedAt ? performance.now() - this.startedAt : 0;
  }

  /** Stops the mic (releasing the browser's mic indicator) and returns the WAV. */
  async stop(): Promise<Blob> {
    this.stopped = true;
    const rate = this.ctx?.sampleRate ?? 48000;
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    await this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.stream = null;
    this.node = null;

    const length = this.chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Float32Array(length);
    let offset = 0;
    for (const chunk of this.chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    this.chunks = [];
    return new Blob([encodeWav(downsample(merged, rate))], { type: "audio/wav" });
  }
}
