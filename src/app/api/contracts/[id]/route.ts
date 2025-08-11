import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

type Params = { id: string };

function normalizeItem(doc: any) {
  const createdRaw = doc?.createdAt ?? doc?.created ?? doc?.created_at ?? null;
  const updatedRaw = doc?.updatedAt ?? doc?.updated ?? doc?.updated_at ?? null;
  const valueRaw = doc?.value ?? doc?.amount ?? 0;

  // Normalize tags from array or comma-separated string
  const rawTags = doc?.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.filter((t) => typeof t === "string")
    : typeof rawTags === "string"
    ? rawTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Coerce noticeDays from number or string; default 30 if missing
  const noticeDaysRaw = doc?.noticeDays ?? doc?.notice_days;
  const noticeDays =
    noticeDaysRaw === undefined || noticeDaysRaw === null || noticeDaysRaw === ""
      ? 30
      : Number(noticeDaysRaw) || 30;

  const toIso = (v: any) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  return {
    _id: String(doc?._id ?? ""),
    title: String(doc?.title ?? ""),
    status: String(doc?.status ?? doc?.state ?? "Draft"),
    value: Number(valueRaw || 0),
    currency: String(doc?.currency ?? "USD"),
    notes: String(doc?.notes ?? ""),
    tags,
    autoRenew: Boolean(doc?.autoRenew ?? doc?.auto_renew ?? false),
    noticeDays,
    startDate: doc?.startDate ?? null,
    endDate: doc?.endDate ?? null,
    created: toIso(createdRaw),
    updated: toIso(updatedRaw),
  };
}

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = await getDb();
  const doc = await db.collection("contracts").findOne({ _id: new ObjectId(id), userId: uid });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ item: normalizeItem(doc), timeline: [] });
}

export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const uid = await getCurrentUserId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Parse incoming JSON
    let incoming: Record<string, unknown> = {};
    try {
      incoming = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Helpers to coerce types safely
    const coerceDate = (v: unknown) => {
      if (v === null || v === undefined || v === "") return null;
      const d = new Date(String(v));
      return isNaN(d.getTime()) ? null : d;
    };
    const coerceNumber = (v: unknown) => {
      if (typeof v === "number") return v;
      if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };
    const coerceBoolean = (v: unknown) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (s === "true") return true;
        if (s === "false") return false;
      }
      return undefined;
    };

    // Whitelist and build update doc
    const update: Record<string, unknown> = {};
    if (typeof incoming.title === "string") update.title = incoming.title.trim();
    if (typeof incoming.status === "string") update.status = incoming.status;
    if (typeof incoming.currency === "string") update.currency = incoming.currency;
    if (typeof incoming.notes === "string") update.notes = incoming.notes;

    const value = coerceNumber(incoming.value);
    if (value !== undefined) update.value = value;

    const noticeDays = coerceNumber(incoming.noticeDays);
    if (noticeDays !== undefined) update.noticeDays = noticeDays;

    const autoRenew = coerceBoolean(incoming.autoRenew);
    if (autoRenew !== undefined) update.autoRenew = autoRenew;

    const startDate = coerceDate(incoming.startDate);
    if (startDate !== undefined) update.startDate = startDate; // allow null

    const endDate = coerceDate(incoming.endDate);
    if (endDate !== undefined) update.endDate = endDate; // allow null

    if (Array.isArray(incoming.tags)) {
      update.tags = incoming.tags.filter((t) => typeof t === "string");
    } else if (typeof incoming.tags === "string") {
      update.tags = incoming.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    update.updatedAt = new Date();

    const db = await getDb();
    const result = await db.collection("contracts").findOneAndUpdate(
      { _id: new ObjectId(id), userId: uid },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result || !result.value) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ item: normalizeItem(result.value), timeline: [] });
  } catch (err) {
    console.error("PUT /api/contracts/[id] failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  const uid = await getCurrentUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = await getDb();
  await db.collection("contracts").deleteOne({ _id: new ObjectId(id), userId: uid });
  return NextResponse.json({ ok: true });
}