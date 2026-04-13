import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars";
const SECRET = new TextEncoder().encode(JWT_SECRET);

// ─────────────────────────────────────────────
// Dev fallback user (when DB is unavailable)
// ─────────────────────────────────────────────

export const DEV_USER = {
  id: "dev-user-001",
  firstName: "Lionel",
  lastName: "Ntumba",
  email: "lionel@test.com",
  phone: "+33612345678",
  country: "FR",
  kycStatus: "not_started",
  kycLevel: 0,
  phoneVerified: true,
  referralCode: "LIONEL2024",
  isActive: true,
  createdAt: new Date().toISOString(),
};

export function isDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const msg = (error as any)?.message || "";
  const code = (error as any)?.code || "";
  return (
    msg.includes("Can't reach database") ||
    msg.includes("Connection refused") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("connect ETIMEDOUT") ||
    msg.includes("PrismaClientInitializationError") ||
    msg.includes("PrismaClientKnownRequestError") ||
    msg.includes("prisma") ||
    msg.includes("FATAL") ||
    msg.includes("getaddrinfo") ||
    msg.includes("DATABASE_URL") ||
    msg.includes("environment variable not found") ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1003" ||
    code === "P1008" ||
    code === "P1017" ||
    (error as any)?.name === "PrismaClientInitializationError" ||
    (error as any)?.name === "PrismaClientKnownRequestError"
  );
}

const COOKIE_NAME = "tinda_session";
const TOKEN_TTL = "7d"; // 7 days

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  kycStatus: string;
}

// ─────────────────────────────────────────────
// Token operations
// ─────────────────────────────────────────────

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Session management (cookies)
// ─────────────────────────────────────────────

export async function setSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

// ─────────────────────────────────────────────
// Get current authenticated user
// ─────────────────────────────────────────────

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    // Verify session is still active in DB
    const session = await db.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            kycStatus: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || session.userId !== payload.userId) {
      return null;
    }

    return session.user as AuthUser;
  } catch (error) {
    if (isDbError(error)) {
      console.warn("[auth] DB unavailable, returning dev user from JWT payload");
      // Return dev user with userId from JWT token
      return {
        id: payload.userId,
        firstName: DEV_USER.firstName,
        lastName: DEV_USER.lastName,
        email: DEV_USER.email,
        phone: DEV_USER.phone,
        kycStatus: DEV_USER.kycStatus,
      };
    }
    throw error;
  }
}

// ─────────────────────────────────────────────
// Password hashing (using Web Crypto API — edge-compatible)
// ─────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  // Use bcrypt via Node.js when available, fallback to Web Crypto
  // In production, install bcryptjs: npm i bcryptjs @types/bcryptjs
  try {
    const bcrypt = await import("bcryptjs");
    return bcrypt.hash(password, 12);
  } catch {
    // Fallback: PBKDF2 via Web Crypto (edge-compatible)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    const hashHex = Buffer.from(bits).toString("hex");
    const saltHex = Buffer.from(salt).toString("hex");
    return `pbkdf2:${saltHex}:${hashHex}`;
  }
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (hash.startsWith("pbkdf2:")) {
    const [, saltHex, storedHash] = hash.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    const hashHex = Buffer.from(bits).toString("hex");
    return hashHex === storedHash;
  }

  // bcrypt hash
  try {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// OTP generation
// ─────────────────────────────────────────────

export function generateOtp(): string {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

export function otpExpiresAt(minutes = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
