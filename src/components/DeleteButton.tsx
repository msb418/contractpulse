"use client";

export default function DeleteButton({ id, className }: { id: string; className?: string }) {
  return (
    <button
      className={`${className ?? ""} rounded bg-red-600/80 px-3 py-2 text-sm`}
      onClick={async () => {
        if (!confirm("Delete this contract?")) return;
        const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
        if (res.ok) location.href = "/contracts";
      }}
    >
      Delete
    </button>
  );
}