import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

function normalizeRow(doc: any) {
  const createdRaw = doc?.createdAt ?? doc?.created ?? doc?.created_at ?? null;
  const valueRaw = doc?.value ?? doc?.amount ?? 0;

  return {
    _id: String(doc?._id ?? ""),
    title: String(doc?.title ?? ""),
    status: String(doc?.status ?? doc?.state ?? "Draft"),
    value: Number(valueRaw || 0),
    currency: String(doc?.currency ?? "USD"),
    created: createdRaw instanceof Date ? createdRaw.toISOString() : (createdRaw ?? null),
  };
}

export async function GET(req: Request) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 10)));
  const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
  const status = (searchParams.get("status") || "").trim();

  const db = await getDb();
  const filter: Record<string, any> = { userId: uid };
  if (q) filter.title = { $regex: q, $options: "i" };
  if (status && status !== "All statuses") filter.status = status;

  const col = db.collection("contracts");
  const total = await col.countDocuments(filter);
  const items = await col
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return NextResponse.json({
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    items: items.map(normalizeRow),
  });
}

export async function POST(req: Request) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, any>;

  const now = new Date();
  const doc = {
    userId: uid,
    title: String(body.title ?? ""),
    status: String(body.status ?? "Draft"),
    value: Number(body.value ?? 0),
    currency: String(body.currency ?? "USD"),
    notes: String(body.notes ?? ""),
    tags: Array.isArray(body.tags) ? body.tags : [],
    autoRenew: Boolean(body.autoRenew ?? false),
    noticeDays: Number(body.noticeDays ?? 30),
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  const res = await db.collection("contracts").insertOne(doc);
  return NextResponse.json({ id: String(res.insertedId) }, { status: 201 });
}