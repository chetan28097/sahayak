"use client";
import { Landmark, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffOption[] | null>(null);
  const [staffId, setStaffId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/console/login")
      .then((r) => r.json())
      .then((d: { staff: StaffOption[] }) => setStaff(d.staff))
      .catch(() => setError("Can't reach the server. Check the connection and reload."));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/console/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, staffId }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      router.push("/console");
      router.refresh();
    } else {
      setError(((await res?.json().catch(() => null)) as { error?: string } | null)?.error ?? "Could not sign in");
      setPin("");
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-brand px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        <span aria-hidden className="mb-4 grid size-12 place-items-center rounded-xl bg-brand text-white"><Landmark size={24} /></span>
        <h1 className="text-2xl font-semibold">Staff sign-in</h1>
        <p className="mb-5 text-sm text-muted">Your actions are recorded under your name.</p>

        <label htmlFor="who" className="mb-1 block text-sm font-medium">Who are you?</label>
        {staff === null && !error ? (
          <p className="flex items-center gap-2 py-2 text-muted"><Loader2 size={16} className="animate-spin" aria-hidden /> Loading staff list…</p>
        ) : (
          <select id="who" required value={staffId} onChange={(e) => setStaffId(e.target.value)} className="mb-4 w-full rounded-lg border-2 border-line bg-card px-3 py-2.5">
            <option value="" disabled>Choose your name</option>
            {(staff ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        <label htmlFor="pin" className="mb-1 block text-sm font-medium">Branch PIN</label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-lg border-2 border-line px-4 py-2.5 text-center text-2xl tracking-[0.5em]"
        />
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
        <button disabled={busy || pin.length < 4 || !staffId} className="mt-4 w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-40">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
