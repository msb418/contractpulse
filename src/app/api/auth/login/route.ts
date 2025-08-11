import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/jwt";
import { createSessionToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

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

  // Redirect back to /contracts on the same origin as the incoming request.
  const res = NextResponse.redirect(new URL("/contracts", req.url));
  clearAuthCookie(res);      // clear any old cookie
  setAuthCookie(res, token); // set a fresh session cookie
  return res;
}