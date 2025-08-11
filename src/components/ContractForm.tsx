"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  mode?: "create" | "edit";
  initial?: Partial<{
    title: string;
    value: number | string;
    currency: string;
    status: "Draft" | "Active" | "Expired" | "Cancelled";
    startDate: string | null;
    endDate: string | null;
    autoRenew: boolean;
    noticeDays: number | string;
    tags: string[];
    notes: string;
    _id: string;
  }>;
};

const statuses = ["Draft", "Active", "Expired", "Cancelled"] as const;
const currencies = ["USD", "EUR", "GBP"] as const;

export default function ContractForm({ mode = "create", initial = {} }: Props) {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState(initial.title ?? "");
  const [value, setValue] = useState(String(initial.value ?? ""));
  const [currency, setCurrency] = useState(initial.currency ?? "USD");
  const [status, setStatus] = useState<(typeof statuses)[number]>(
    (initial.status as any) ?? "Draft"
  );
  const [startDate, setStartDate] = useState(
    initial.startDate ?? ""
  );
  const [endDate, setEndDate] = useState(initial.endDate ?? "");
  const [autoRenew, setAutoRenew] = useState(Boolean(initial.autoRenew ?? false));
  const [noticeDays, setNoticeDays] = useState(String(initial.noticeDays ?? 30));
  const [tags, setTags] = useState((initial.tags ?? []).join(", "));
  const [notes, setNotes] = useState(initial.notes ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // basic client validation
    if (!title.trim()) return setErr("Title is required.");

    setLoading(true);
    try {
      const body = {
        title: title.trim(),
        value: value === "" ? 0 : Number(value),
        currency,
        status,
        startDate: startDate ? startDate : null,
        endDate: endDate ? endDate : null,
        autoRenew,
        noticeDays: noticeDays === "" ? 0 : Number(noticeDays),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        notes,
        id: initial._id, // only used by edit path
      };

      const res = await fetch(
        mode === "create" ? "/api/contracts" : `/api/contracts/${initial._id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      // go back to list on success
      r.push("/contracts?page=1");
      r.refresh();
    } catch (e: any) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {err && (
        <div className="rounded-md bg-red-900/40 border border-red-700 text-red-100 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      <div>
        <label className="block text-xs mb-1">Title</label>
        <input
          className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">Value</label>
          <input
            className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Currency</label>
          <select
            className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1">Status</label>
        <select
          className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-1">Start date</label>
          <input
            type="date"
            className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">End date</label>
          <input
            type="date"
            className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
          />
          <span className="text-sm">Auto‑renew</span>
        </label>

        <div>
          <label className="block text-xs mb-1">Notice days</label>
          <input
            className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
            value={noticeDays}
            onChange={(e) => setNoticeDays(e.target.value)}
            inputMode="numeric"
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1">Tags (comma‑separated)</label>
        <input
          className="w-full rounded-md bg-input/60 border border-white/10 px-3 py-2"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="legal, vendor"
        />
      </div>

      <div>
        <label className="block text-xs mb-1">Notes</label>
        <textarea
          className="w-full min-h-32 rounded-md bg-input/60 border border-white/10 px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="rounded-md bg-gray-800/70 hover:bg-gray-700/70 border border-white/10 px-4 py-2"
          onClick={() => r.back()}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >
          {mode === "create" ? "Create" : "Save changes"}
        </button>
      </div>
    </form>
  );
}