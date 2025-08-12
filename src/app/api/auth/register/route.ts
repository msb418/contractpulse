export const runtime = "nodejs";

// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/jwt";        // ⬅️ correct source
import hcaptcha from "hcaptcha";

export async function POST(req: Request) {
  try {
    const { email, password, captchaToken } = await req.json();

    // Basic input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Verify hCaptcha
    const captchaRes: any = await hcaptcha.verify(process.env.HCAPTCHA_SECRET || "", captchaToken);
    if (!captchaRes?.success) {
      return NextResponse.json({ error: "Captcha failed" }, { status: 400 });
    }

    const users = await db("users");
    const lower = String(email).toLowerCase().trim();

    const existing = await users.findOne({ email: lower });
    if (existing) {
      return NextResponse.json({ error: "Already exists" }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const now = new Date();
    const { insertedId } = await users.insertOne({
      email: lower,
      hash,
      createdAt: now,
    });

    // ✅ Return JSON success only; front-end will redirect to /login
    return NextResponse.json({ success: true, id: String(insertedId) }, { status: 201 });
  } catch (err) {
    console.error("/api/auth/register error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}