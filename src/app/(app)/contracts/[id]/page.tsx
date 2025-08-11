// src/app/(app)/contracts/[id]/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import DeleteButton from "@/components/DeleteButton";

type Contract = {
  _id: string;
  title: string;
  value: number;
  status: string;
  notes?: string;
  createdAt?: string | Date;
  created?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  tags?: string[];
  noticeDays?: number;
};

async function loadContract(id: string): Promise<Contract | null> {
  // Resolve same-origin absolute base URL and capture cookies for auth
  let baseUrl: string | undefined;
  let cookie = "";
  try {
    const h = (await headers()) as unknown as Headers; // await per Next 15
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    cookie = h.get("cookie") ?? "";
    if (host) baseUrl = `${proto}://${host}`;
  } catch (_) {
    // headers() can throw in some edge contexts; fall through to env
  }
  if (!baseUrl) {
    baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`;
  }

  const url = `${baseUrl}/api/contracts/${id}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.item ?? data) as Contract | null;
  } catch {
    return null;
  }
}

export default async function ContractViewPage(props: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // Next 15 may provide params as a Promise in some cases
  const { id } =
    typeof (props.params as any).then === "function"
      ? await (props.params as Promise<{ id: string }>)
      : (props.params as { id: string });

  const contract = await loadContract(id);

  if (!contract) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
          <div className="mb-4 text-lg font-semibold">Not found</div>
          <p className="mb-6 opacity-80">
            We couldn’t load that contract. It may have been deleted or the link
            is invalid.
          </p>
          <Link
            href="/contracts"
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  const createdRaw = contract.createdAt ?? (contract as any).created;
  const created =
    createdRaw &&
    new Date(createdRaw).toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

  const start =
    contract.startDate &&
    new Date(contract.startDate).toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

  const end =
    contract.endDate &&
    new Date(contract.endDate).toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

  const tags = Array.isArray(contract.tags)
    ? contract.tags.filter(Boolean).join(", ")
    : (typeof (contract as any).tags === "string" ? (contract as any).tags : "");

  const noticeDays = (contract as any).noticeDays as number | undefined;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
        <h2 className="mb-4 text-lg font-semibold">Details</h2>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{contract.title || "—"}</h1>
          <div className="space-x-2 flex items-center">
            <Link
              href={`/contracts/${contract._id}/edit`}
              className="inline-flex h-10 items-center rounded-md bg-blue-600 px-3 text-sm font-medium hover:bg-blue-500"
            >
              Edit
            </Link>
            <DeleteButton
              id={contract._id}
              className="inline-flex h-10 items-center rounded-md bg-red-600 text-sm font-medium hover:bg-red-500 px-3"
            />
            <Link
              href="/contracts"
              className="inline-flex h-10 items-center rounded-md bg-white/10 px-3 text-sm font-medium hover:bg-white/20"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-black/40 p-4">
            <div className="text-xs uppercase tracking-wider opacity-60">
              Status
            </div>
            <div className="mt-1 text-sm">{contract.status ?? "—"}</div>
          </div>

          <div className="rounded-lg bg-black/40 p-4">
            <div className="text-xs uppercase tracking-wider opacity-60">
              Value
            </div>
            <div className="mt-1 text-sm">
              {typeof contract.value === "number"
                ? contract.value.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })
                : "—"}
            </div>
          </div>

          <div className="rounded-lg bg-black/40 p-4">
            <div className="text-xs uppercase tracking-wider opacity-60">Start date</div>
            <div className="mt-1 text-sm">{start || "—"}</div>
          </div>

          <div className="rounded-lg bg-black/40 p-4">
            <div className="text-xs uppercase tracking-wider opacity-60">End date</div>
            <div className="mt-1 text-sm">{end || "—"}</div>
          </div>

          <div className="rounded-lg bg-black/40 p-4">
            <div className="text-xs uppercase tracking-wider opacity-60">Notice days</div>
            <div className="mt-1 text-sm">{typeof noticeDays === "number" ? noticeDays : "—"}</div>
          </div>

          <div className="rounded-lg bg-black/40 p-4 md:col-span-2">
            <div className="text-xs uppercase tracking-wider opacity-60">Created</div>
            <div className="mt-1 text-sm">{created || "—"}</div>
          </div>

          <div className="rounded-lg bg-black/40 p-4 md:col-span-2">
            <div className="text-xs uppercase tracking-wider opacity-60">Tags</div>
            <div className="mt-1 text-sm">{tags || "—"}</div>
          </div>

          <div className="rounded-lg bg-black/40 p-4 md:col-span-2">
            <div className="text-xs uppercase tracking-wider opacity-60">
              Notes
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm">
              {contract.notes || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}