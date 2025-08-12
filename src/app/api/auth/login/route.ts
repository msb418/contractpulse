export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/jwt";
import { createSessionToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import hcaptcha from "hcaptcha";

export async function POST(req: Request) {
  const { email, password, captchaToken } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (!captchaToken) {
    return NextResponse.json({ error: "Captcha required" }, { status: 400 });
  }

  // Verify HCaptcha
  const captchaSecret = process.env.HCAPTCHA_SECRET;
  if (!captchaSecret) {
    return NextResponse.json({ error: "Captcha secret not configured" }, { status: 500 });
  }
  try {
    const captchaRes: any = await hcaptcha.verify(captchaSecret, captchaToken);
    if (!captchaRes?.success) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Captcha verification error" }, { status: 500 });
  }

  const users = await db("users");
  const user = await users.findOne({
    email: String(email).toLowerCase().trim(),
  });

  // Return 401 and be sure to clear any stale cookie on the response we send.
  if (!user) {
    const res = NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    clearAuthCookie(res);
    return res;
  }

  const ok = await comparePassword(password, user.hash);
  if (!ok) {
    const res = NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    clearAuthCookie(res);
    return res;
  }

  const token = await createSessionToken(String(user._id));

  // Set a fresh session cookie and return JSON response for frontend to handle redirect.
  const res = NextResponse.json({ message: "Login successful", redirectTo: "/contracts" });
  setAuthCookie(res, token);
  return res;
} 