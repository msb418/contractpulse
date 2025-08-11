import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res);          // remove the session cookie on this response
  return res;
}