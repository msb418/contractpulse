"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Filters() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setStatus(params.get("status") ?? "");
  }, [params]);

  function apply() {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    router.push(`/contracts?${sp.toString()}`);
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <input className="rounded bg-zinc-900 p-2" placeholder="Search title or tags" value={q} onChange={(e)=>setQ(e.target.value)} />
      <select className="rounded bg-zinc-900 p-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {["Draft","Active","Pending","Expired","Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={apply} className="rounded bg-white/10 px-3 py-2">Apply</button>
    </div>
  );
}