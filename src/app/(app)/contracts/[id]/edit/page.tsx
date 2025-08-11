"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Contract = {
  _id: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
};

async function loadContract(id: string): Promise<Contract | null> {
  const res = await fetch(`/api/contracts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.item ?? null;
}

export default function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = React.useState<string>("");
  const [form, setForm] = React.useState<Contract | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string>("");
  const router = useRouter();

  function showToast(msg: string, ms = 1500) {
    setToast(msg);
    window.setTimeout(() => setToast(""), ms);
  }

  // unwrap params (Next 15)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await params;
      if (!mounted) return;
      setId(p.id);
      const item = await loadContract(p.id);
      setForm(item);
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !form) return;
    setSaving(true);
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Contract updated successfully");
      window.setTimeout(() => {
        router.replace(`/contracts/${id}`);
        router.refresh();
      }, 800);
    } else {
      // optional: surface error
      console.error("Save failed", await res.text());
    }
  }

  if (!form) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-slate-300">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-slate-900/60 p-6"
      >
        <h1 className="mb-6 text-xl font-semibold text-slate-100">
          Edit Contract
        </h1>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase text-slate-400">Title</span>
            <input
              className="rounded-lg bg-slate-900/50 px-3 py-2 text-slate-100 outline-none ring-1 ring-white/10 focus:ring-2"
              value={form.title ?? ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase text-slate-400">Currency</span>
            <select
              className="rounded-lg bg-slate-900/50 px-3 py-2 text-slate-100 outline-none ring-1 ring-white/10 focus:ring-2"
              value={form.currency ?? "USD"}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase text-slate-400">Value</span>
            <input
              type="number"
              step="0.01"
              className="rounded-lg bg-slate-900/50 px-3 py-2 text-slate-100 outline-none ring-1 ring-white/10 focus:ring-2"
              value={Number(form.value ?? 0)}
              onChange={(e) =>
                setForm({ ...form, value: Number(e.target.value || 0) })
              }
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase text-slate-400">Status</span>
            <select
              className="rounded-lg bg-slate-900/50 px-3 py-2 text-slate-100 outline-none ring-1 ring-white/10 focus:ring-2"
              value={form.status ?? "Draft"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Draft</option>
              <option>Active</option>
              <option>Expired</option>
              <option>Cancelled</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase text-slate-400">Start Date</span>
            <input
              type="date"
              className="rounded-lg bg-slate-900/50 px-3 py-2 text-slate-100 outline-none ring-1 ring-white/10 focus:ring-2"
              value={form.startDate ? form.startDate.slice(0, 10) : ""}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase text-slate-400">End Date</span>
            <input
              type="date"
              className="rounded-lg bg-slate-900/50 px-3 py-2 text-slate-100 outline-none ring-1 ring-white/10 focus:ring-2"
              value={form.endDate ? form.endDate.slice(0, 10) : ""}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>

          <label className="col-span-1 md:col-span-2 flex flex-col gap-2">
            <span className="text-xs uppercase text-slate-400">Notes</span>
            <textarea
              rows={6}
              className="rounded-lg bg-slate-900/50 px-3 py-2 text-slate-100 outline-none ring-1 ring-white/10 focus:ring-2"
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-slate-800 px-4 py-2 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
      {toast && (
        <div className="fixed right-4 top-[calc(var(--nav-h)+1rem)] z-50 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}