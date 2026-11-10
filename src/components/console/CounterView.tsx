"use client";
import { Camera, Clock, Hand, ScanLine, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FilledForm } from "@/lib/bankForms";
import type { ServiceId } from "@/lib/types";
import { ServiceIcon, STATUS_META } from "../serviceMeta";
import { BankFormView } from "./BankFormView";
import { RequestWorkbench } from "./RequestWorkbench";

interface QueueRow {
  id: string;
  code: string;
  kind: "application" | "assist";
  service: ServiceId;
  status: string;
  urgent: boolean;
  escalated: boolean;
  needsStaff: boolean;
  assignedTo: string | null;
  customerName: string | null;
  title: string;
  createdAt: string;
  pending: number;
}

type Filter = "all" | "urgent" | "help" | "needs_info";
const POLL_MS = 5000;

function waited(iso: string, now: number) {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  return m < 1 ? "now" : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

interface Detector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}

/** Webcam QR scan where the browser supports BarcodeDetector (Chrome/Edge on Android, ChromeOS). */
function CameraScan({ onToken, onClose }: { onToken: (t: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    const Ctor = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    if (!Ctor) return;
    const detector = new Ctor({ formats: ["qr_code"] });
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(async (s) => {
        stream = s;
        if (!video.current) return;
        video.current.srcObject = s;
        await video.current.play();
        while (!stopped) {
          const codes = await detector.detect(video.current).catch(() => []);
          if (codes[0]?.rawValue) return onToken(codes[0].rawValue);
          await new Promise((r) => setTimeout(r, 300));
        }
      })
      .catch(() => onClose());
    return () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onToken, onClose]);
  return (
    <div className="relative">
      <video ref={video} muted playsInline className="aspect-video w-full rounded-lg bg-ink object-cover" />
      <button type="button" onClick={onClose} aria-label="Close camera" className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-card">
        <X size={18} />
      </button>
    </div>
  );
}

export function CounterView() {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scanned, setScanned] = useState<{ form: FilledForm; code: string } | null>(null);
  const [lookup, setLookup] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [camera, setCamera] = useState(false);
  const [canScan, setCanScan] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => setCanScan("BarcodeDetector" in window), []);

  const loadQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/console/requests?open=1&limit=200", { cache: "no-store" });
      if (res.status === 401) return window.location.assign("/console/login");
      setRows(((await res.json()) as { requests: QueueRow[] }).requests);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
    setNow(Date.now());
  }, []);

  useEffect(() => {
    void loadQueue();
    const timer = setInterval(() => document.visibilityState === "visible" && void loadQueue(), POLL_MS);
    return () => clearInterval(timer);
  }, [loadQueue]);

  const find = useCallback(async (value: string) => {
    const v = value.trim();
    if (!v) return;
    setMessage(null);
    const body = v.startsWith("v3.") || (v.includes(".") && v.length > 20) ? { token: v } : { code: v };
    const res = await fetch("/api/console/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (!res) return setMessage("Connection problem. Try again.");
    const data = (await res.json()) as { valid: boolean; reason?: string; requestId?: string | null; payload?: { form: FilledForm; c: string } };
    if (!data.valid) {
      return setMessage(data.reason === "no request with this token" ? `No request has token ${v.toUpperCase()}.` : `QR not accepted: ${data.reason}.`);
    }
    setLookup("");
    if (data.requestId) {
      setScanned(null);
      setSelectedId(data.requestId);
    } else if (data.payload) {
      // Signed QR from elsewhere: still readable offline.
      setSelectedId(null);
      setScanned({ form: data.payload.form, code: data.payload.c });
    }
  }, []);

  const onScanned = useCallback((t: string) => {
    setCamera(false);
    void find(t);
  }, [find]);
  const closeCamera = useCallback(() => setCamera(false), []);

  const queue = useMemo(() => {
    const list = (rows ?? []).filter((r) =>
      filter === "urgent" ? r.urgent || r.escalated : filter === "help" ? r.kind === "assist" : filter === "needs_info" ? r.status === "needs_info" : true,
    );
    return list.sort((a, b) => {
      const rank = (r: QueueRow) => (r.urgent ? 0 : r.kind === "assist" ? 1 : r.escalated ? 2 : 3);
      return rank(a) - rank(b) || a.createdAt.localeCompare(b.createdAt);
    });
  }, [rows, filter]);

  const count = (f: Filter) =>
    (rows ?? []).filter((r) => (f === "urgent" ? r.urgent || r.escalated : f === "help" ? r.kind === "assist" : f === "needs_info" ? r.status === "needs_info" : true)).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr] lg:items-start">
      <aside className="space-y-3 lg:sticky lg:top-[4.75rem]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void find(lookup);
          }}
        >
          <label htmlFor="lookup" className="mb-1 block text-sm font-medium text-muted">Scan the QR or type the token</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ScanLine aria-hidden size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="lookup"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                placeholder="K7Q-4M2"
                autoComplete="off"
                className="w-full rounded-lg border-2 border-line bg-card py-2.5 pl-10 pr-3 text-lg font-semibold tracking-wider focus:border-brand"
              />
            </div>
            <button className="grid size-12 place-items-center rounded-lg bg-brand text-white" aria-label="Find">
              <Search size={20} />
            </button>
            {canScan && (
              <button type="button" onClick={() => setCamera(true)} className="grid size-12 place-items-center rounded-lg border-2 border-line bg-card" aria-label="Scan with camera">
                <Camera size={20} />
              </button>
            )}
          </div>
        </form>
        {camera && <CameraScan onToken={onScanned} onClose={closeCamera} />}
        {message && <p role="status" className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand">{message}</p>}

        <div role="tablist" aria-label="Queue filter" className="flex flex-wrap gap-1.5 pt-1">
          {([
            ["all", "All open"],
            ["urgent", "Urgent"],
            ["help", "Help calls"],
            ["needs_info", "Needs info"],
          ] as [Filter, string][]).map(([f, label]) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-2.5 py-1.5 text-sm font-medium ${filter === f ? "bg-ink text-white" : "bg-card text-muted hover:text-ink"}`}
            >
              {label} <span className="tabular-nums opacity-70">{rows ? count(f) : ""}</span>
            </button>
          ))}
        </div>

        {loadError && <p role="alert" className="text-sm text-danger">Can&apos;t reach the server. Retrying…</p>}
        {rows === null ? (
          <p className="text-muted">Loading the queue…</p>
        ) : queue.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-muted">
            {filter === "all" ? "No one is waiting." : "Nothing here."}
          </p>
        ) : (
          <ul className="max-h-[calc(100dvh-19rem)] space-y-1.5 overflow-y-auto pr-1">
            {queue.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    setScanned(null);
                    setSelectedId(r.id);
                  }}
                  aria-current={selectedId === r.id ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg border bg-card p-2.5 text-left transition-colors duration-150 ${
                    selectedId === r.id ? "border-brand ring-2 ring-brand/15" : r.urgent ? "border-danger/60" : "border-line hover:border-brand/40"
                  }`}
                >
                  {r.kind === "assist" ? (
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-saffron-soft text-saffron-dark"><Hand size={18} /></span>
                  ) : (
                    <ServiceIcon service={r.service} size="sm" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold tracking-wide">{r.code}</span>
                      {r.urgent && <span className="rounded bg-danger px-1.5 text-xs font-semibold text-white">Urgent</span>}
                      {r.escalated && <span className="rounded bg-[#5b3aa6] px-1.5 text-xs font-semibold text-white">Esc.</span>}
                    </span>
                    <span className="block truncate text-sm">{r.kind === "assist" ? "Needs help at the kiosk" : r.customerName ?? "New customer"}</span>
                    <span className="block truncate text-xs text-muted">{r.title}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1 text-xs">
                    <span className="inline-flex items-center gap-1 text-muted"><Clock size={12} aria-hidden />{waited(r.createdAt, now)}</span>
                    <span className={`rounded px-1.5 py-0.5 font-medium ${STATUS_META[r.status]?.tone ?? ""}`}>{STATUS_META[r.status]?.label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section aria-live="polite" className="min-w-0">
        {selectedId ? (
          <RequestWorkbench key={selectedId} id={selectedId} onChanged={loadQueue} />
        ) : scanned ? (
          <div className="space-y-3">
            <p className="rounded-lg bg-ok-soft px-3 py-2 text-ok">Signature verified for {scanned.code}. This request is not in this branch&apos;s queue.</p>
            <BankFormView form={scanned.form} />
          </div>
        ) : (
          <div className="grid min-h-[60dvh] place-items-center rounded-xl border border-dashed border-line bg-card p-8 text-center">
            <div>
              <ScanLine aria-hidden size={40} className="mx-auto text-muted" />
              <p className="mt-3 text-lg font-semibold">Scan the customer&apos;s token</p>
              <p className="text-muted">or pick someone from the queue. Their application opens here, already filled.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
