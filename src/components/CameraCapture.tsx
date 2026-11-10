"use client";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import type { CardKind, Lang, Mode } from "@/lib/types";

interface Props {
  lang: Lang;
  mode: Mode;
  kind: CardKind;
  disabled: boolean;
  onCapture: (image: Blob | null) => void;
  onCancel?: () => void;
}

const CARD_ASPECT = 1.586; // ID-1 card
const MAX_EDGE = 1280;

/** Camera with a card-shaped framing guide; falls back to the native camera/file picker. */
export function CameraCapture({ lang, mode, kind, disabled, onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((tr) => tr.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setLive(true);
      })
      .catch(() => setLive(false));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  function snap() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    // Crop to the guide frame (80% of width, card aspect, centred).
    const cropW = video.videoWidth * 0.8;
    const cropH = Math.min(cropW / CARD_ASPECT, video.videoHeight);
    const sx = (video.videoWidth - cropW) / 2;
    const sy = (video.videoHeight - cropH) / 2;
    const scale = Math.min(1, MAX_EDGE / cropW);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropW * scale);
    canvas.height = Math.round(cropH * scale);
    canvas.getContext("2d")?.drawImage(video, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => blob && onCapture(blob), "image/jpeg", 0.85);
  }

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink">
        <video ref={videoRef} autoPlay playsInline muted className={`size-full object-cover ${live ? "" : "hidden"}`} />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-xl border-4 border-dashed border-saffron shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
          style={{ aspectRatio: String(CARD_ASPECT) }}
        />
        <p className="absolute inset-x-0 bottom-2 text-center text-sm font-medium text-white">{t(lang, "ui.frameHint")}</p>
        {!live && (
          <p className="absolute inset-x-0 top-3 text-center text-sm text-white/80">
            {kind === "aadhaar" ? "Aadhaar" : kind === "pan" ? "PAN" : "Passbook"}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {live ? (
          <button
            type="button"
            disabled={disabled}
            onClick={snap}
            className="flex-1 rounded-2xl bg-brand py-4 text-xl font-semibold text-white disabled:opacity-40"
          >
            <Camera size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(lang, "ui.takePhoto")}
          </button>
        ) : (
          <label className="flex-1 cursor-pointer rounded-2xl bg-brand py-4 text-center text-xl font-semibold text-white">
            <Camera size={22} aria-hidden className="inline shrink-0 mr-2 -translate-y-px" />{t(lang, "ui.takePhoto")}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={disabled}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onCapture(file);
              }}
            />
          </label>
        )}
        {mode === "mock" && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onCapture(null)}
            className="rounded-2xl border-2 border-brand px-4 py-4 font-semibold text-brand disabled:opacity-40"
          >
            Use sample card
          </button>
        )}
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-2xl px-4 py-4 font-medium text-muted">
            {t(lang, "ui.cancel")}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">{t(lang, "ui.kycNote")}</p>
    </div>
  );
}
