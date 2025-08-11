import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_NAME = "cp.session";

// ---- cookie helpers ----
export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    // let it be a session cookie; add maxAge if you want persistence
  });
}

export function clearAuthCookie(res: NextResponse) {
  // delete by overwriting with maxAge 0
  res.cookies.set(SESSION_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

// ---- session token helpers ----
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function createSessionToken(uid: string) {
  return await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookie = (await cookies()).get(SESSION_NAME)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, secret);
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}