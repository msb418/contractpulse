import { getDb } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

function toISODate(d: Date) {
  // Format: YYYY-MM-DD (works with string comparison in Mongo)
  return d.toISOString().slice(0, 10);
}

export default async function Dashboard() {
  const uid = await getCurrentUserId();
  if (!uid) return null;

  const db = await getDb();
  const contractsCollection = db.collection("contracts");

  const today = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);

  // endDate is stored as "YYYY-MM-DD" string; filter with string bounds
  const items = await contractsCollection
    .find({
      userId: uid,
      status: { $in: ["Active", "Pending"] },
      endDate: { $gte: toISODate(today), $lte: toISODate(soon) },
    })
    .project({ title: 1, endDate: 1, status: 1 })
    .sort({ endDate: 1 })
    .limit(20)
    .toArray();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="mb-4 text-xl font-semibold">
        Renewals in next 30 days
      </h1>
      <ul className="divide-y divide-white/10 rounded border border-white/10 bg-black/40 backdrop-blur-sm">
        {items.map((c: any) => (
          <li key={String(c._id)} className="p-3">
            <a
              href={`/contracts/${String(c._id)}`}
              className="font-medium hover:underline"
            >
              {c.title}
            </a>
            <div className="text-sm text-white/60">
              {c.status} • Ends {c.endDate || "—"}
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-3 text-white/60">
            No upcoming renewals.
          </li>
        )}
      </ul>
    </div>
  );
}