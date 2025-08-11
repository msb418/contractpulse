// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/jwt";        // ⬅️ correct source
import { createSessionToken, setAuthCookie } from "@/lib/auth";
import hcaptcha from "hcaptcha";

export async function POST(req: Request) {
  const { email, password, captchaToken } = await req.json();

  const captchaRes: any = await hcaptcha.verify(process.env.HCAPTCHA_SECRET || "", captchaToken);
  if (!captchaRes.success) return NextResponse.json({ error: "Captcha failed" }, { status: 400 });

  const users = await db("users");
  const existing = await users.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) return NextResponse.json({ error: "Already exists" }, { status: 409 });

  const hash = await hashPassword(password);
  const now = new Date();
  const { insertedId } = await users.insertOne({
    email: String(email).toLowerCase().trim(),
    hash,
    createdAt: now,
  });

  const token = await createSessionToken(String(insertedId));
  const res = NextResponse.redirect(new URL("/contracts", "http://localhost:3000"));
  setAuthCookie(res, token);                     // ⬅️ pass BOTH args
  return res;
}