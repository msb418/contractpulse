// src/lib/jwt.ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

// keep your existing JWT helpers below...