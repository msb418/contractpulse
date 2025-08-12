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
    if (!email || !password || !captchaToken) {
      return NextResponse.json({ error: "Email, password, and captchaToken are required" }, { status: 400 });
    }

    // Verify hCaptcha
    let captchaRes: any;
    try {
      captchaRes = await hcaptcha.verify(process.env.HCAPTCHA_SECRET || "", captchaToken);
    } catch (error) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }
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
    await users.insertOne({
      email: lower,
      hash,
      createdAt: now,
    });

    // ✅ Return JSON success message for confirmation before redirecting
    return NextResponse.json({ success: true, message: "Account created" }, { status: 201 });
  } catch (err) {
    console.error("/api/auth/register error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}