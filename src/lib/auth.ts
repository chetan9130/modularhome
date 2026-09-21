import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

const COOKIE_NAME = "admin_session";
const SESSION_EXPIRY_HOURS = 1; // Admin session is valid for exactly 1 hour

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// In-memory session store fallback if database is offline during dev/build
const memorySessions = new Map<
  string,
  { user: AdminSessionUser; expiresAt: number }
>();

/**
 * Creates a secure session token and persists to Supabase (and cookie)
 */
export async function createAdminSession(
  userId: string,
  userFallback?: AdminSessionUser
): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000;

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from("sessions").insert({
        session_token: sessionToken,
        user_id: userId,
        expires_at: expiresAt,
      });
    } catch (e) {
      console.warn("Could not persist session to Supabase, falling back to memory:", e);
    }
  }

  if (userFallback) {
    memorySessions.set(sessionToken, { user: userFallback, expiresAt });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60, // 3600 seconds (1 hour)
  });

  return sessionToken;
}

/**
 * Retrieves the current authenticated admin session
 */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    // 1. Check memory store first for rapid response / offline fallback
    const mem = memorySessions.get(token);
    if (mem) {
      if (Date.now() > mem.expiresAt) {
        memorySessions.delete(token);
        return null;
      }
      return mem.user;
    }

    // 2. Query Supabase database
    if (isSupabaseConfigured()) {
      const { data: sessionData, error } = await supabaseAdmin
        .from("sessions")
        .select(`
          session_token,
          expires_at,
          user_id,
          admin_users (
            id,
            email,
            name,
            role,
            status
          )
        `)
        .eq("session_token", token)
        .single();

      if (!error && sessionData && sessionData.admin_users) {
        if (Number(sessionData.expires_at) < Date.now()) {
          // Expired
          await supabaseAdmin.from("sessions").delete().eq("session_token", token);
          return null;
        }

        const user = Array.isArray(sessionData.admin_users)
          ? sessionData.admin_users[0]
          : sessionData.admin_users;

        if (user && user.status === "ACTIVE") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error retrieving admin session:", error);
    return null;
  }
}

/**
 * Destroys current session and removes auth cookie
 */
export async function destroyAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      memorySessions.delete(token);
      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin.from("sessions").delete().eq("session_token", token);
        } catch {}
      }
    }

    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
  } catch (error) {
    console.error("Error destroying admin session:", error);
  }
}

/**
 * Route protection helper that validates admin session or returns 401 response
 */
export async function requireAdminAuth(): Promise<NextResponse | AdminSessionUser> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Unauthorized. Admin session required.", code: "UNAUTHORIZED" },
      },
      { status: 401 }
    );
  }
  return session;
}

