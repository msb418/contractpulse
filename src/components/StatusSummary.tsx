"use client";
type Item = { status?: string; value?: number };

const STATUSES = ["Draft","Active","Pending","Expired","Cancelled"] as const;

export default function StatusSummary({ items }: { items: Item[] }) {
  const counts = Object.fromEntries(STATUSES.map(s => [s, 0])) as Record<(typeof STATUSES)[number], number>;
  for (const it of items) {
    const s = (it.status ?? "Draft") as (typeof STATUSES)[number];
    if (s in counts) counts[s] += 1;
  }
  const total = items.length || 1; // avoid div-by-zero
  return (
    <div className="mb-4 rounded border border-white/10 p-3">
      <div className="mb-2 text-sm font-medium">By status</div>
      <div className="flex h-3 overflow-hidden rounded bg-white/10">
        {STATUSES.map(s => {
          const pct = (counts[s] / total) * 100;
          return (
            <div key={s} className="h-full" style={{ width: `${pct}%` }} title={`${s}: ${counts[s]}`}>
              {/* color blocks via opacity layering */}
              <div className={
                "h-full " +
                (s === "Active" ? "bg-green-500/60" :
                 s === "Pending" ? "bg-yellow-500/60" :
                 s === "Draft" ? "bg-blue-500/60" :
                 s === "Expired" ? "bg-zinc-500/60" :
                 "bg-red-500/60")
              } />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
        {STATUSES.map(s => (
          <span key={s}><span className="inline-block h-2 w-2 align-middle"
            style={{
              background:
                s === "Active" ? "rgba(34,197,94,.6)" :
                s === "Pending" ? "rgba(234,179,8,.6)" :
                s === "Draft" ? "rgba(59,130,246,.6)" :
                s === "Expired" ? "rgba(113,113,122,.6)" :
                "rgba(239,68,68,.6)"
            }} />{" "}
            {s}: {counts[s]}
          </span>
        ))}
      </div>
    </div>
  );
}