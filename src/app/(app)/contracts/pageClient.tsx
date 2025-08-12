"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";

type Row = {
  _id: string;
  title: string;
  status: string;
  value: number;
  currency: string;
  created: string | Date | null;
};

export default function ContractsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All statuses");
  const pageSize = 10;

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    if (q) p.set("q", q);
    // don’t send the sentinel “All statuses”
    if (status && status !== "All statuses") p.set("status", status);
    return p.toString();
  }, [page, pageSize, q, status]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/contracts?${query}`, { cache: "no-store" });
    const data = await res.json();
    setRows(data.items ?? []);
    setPage(data.page ?? 1);
    setTotalPages(data.totalPages ?? 1);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/contracts?${query}`, { cache: "no-store" });
      const data = await res.json();
      if (!cancelled) {
        setRows(data.items ?? []);
        setPage(data.page ?? 1);
        setTotalPages(data.totalPages ?? 1);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this contract?");
    if (!ok) return;
    const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    if (res.ok) {
      // quick client-side removal for snappy UI, then refresh list
      setRows((r) => r.filter((x) => x._id !== id));
      await load();
    } else {
      alert("Failed to delete.");
    }
  }

  // tiny button styles to match your dark theme quickly
  const btn = {
    base:
      "inline-block px-2 py-1 rounded text-sm font-medium border transition",
    view:
      "border-gray-500 text-gray-200 hover:bg-gray-700",
    edit:
      "border-blue-500 text-white bg-blue-600/80 hover:bg-blue-600",
    del:
      "border-red-600 text-white bg-red-600/80 hover:bg-red-600",
    disabled: "opacity-50 cursor-not-allowed",
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left group: search + status side-by-side */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full sm:flex-1 rounded-md bg-[#0f2336] text-gray-100 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
            type="text"
            placeholder="Search contracts..."
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
          <select
            className="w-full sm:w-56 rounded-md bg-[#0f2336] text-gray-100 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option>All statuses</option>
            <option>Draft</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Right: primary action */}
        <Link
          href="/contracts/new"
          className={`${btn.base} ${btn.edit} self-start sm:self-auto`}
        >
          New Contract
        </Link>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table
          className="min-w-[720px] w-full text-sm border-collapse rounded-lg overflow-hidden"
          style={{ borderSpacing: 0 }}
        >
        <thead className="bg-white/5 text-gray-300">
          <tr>
            <th className="text-left px-4 py-3">Title</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Value</th>
            <th className="text-left px-4 py-3">Created</th>
            <th className="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white/2 text-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center px-4 py-6 text-gray-400">
                No contracts found.
              </td>
            </tr>
          ) : (
            rows.map(({ _id, title, status, value, currency, created }) => (
              <tr key={_id} className="border-t border-white/10">
                <td className="px-4 py-3">{title}</td>
                <td className="px-4 py-3 whitespace-nowrap">{status}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency,
                  }).format(value)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {created ? new Date(created).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/contracts/${_id}`}
                      className={`${btn.base} ${btn.view}`}
                    >
                      View
                    </Link>
                    <Link
                      href={`/contracts/${_id}/edit`}
                      className={`${btn.base} ${btn.edit}`}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(_id)}
                      className={`${btn.base} ${btn.del}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3 text-gray-300">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className={`${btn.base} ${btn.view} ${page <= 1 ? btn.disabled : ""}`}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className={`${btn.base} ${btn.view} ${
            page >= totalPages ? btn.disabled : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}