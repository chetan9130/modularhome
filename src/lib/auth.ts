import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

const COOKIE_NAME = "admin_session";
const SESSION_EXPIRY_DAYS = 7; // Admin session lasts 7 days

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

interface StoredAdminSession {
  session_token: string;
  user_id: string;
  user: AdminSessionUser;
  expires_at: number;
  created_at: string;
}

const ADMIN_SESSIONS_FILE = path.join(process.cwd(), "src", "data", "custom_admin_sessions.json");

function ensureSessionsFile() {
  try {
    if (!fs.existsSync(ADMIN_SESSIONS_FILE)) {
      const dir = path.dirname(ADMIN_SESSIONS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ADMIN_SESSIONS_FILE, "[]", "utf-8");
    }
  } catch {}
}

function readLocalAdminSessions(): StoredAdminSession[] {
  try {
    ensureSessionsFile();
    if (!fs.existsSync(ADMIN_SESSIONS_FILE)) return [];
    const raw = fs.readFileSync(ADMIN_SESSIONS_FILE, "utf-8");
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function writeLocalAdminSessions(sessions: StoredAdminSession[]): void {
  try {
    ensureSessionsFile();
    fs.writeFileSync(ADMIN_SESSIONS_FILE, JSON.stringify(sessions.slice(0, 1000), null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write local admin sessions:", e);
  }
}

// In-memory session store for ultra-fast lookup
const memorySessions = new Map<
  string,
  { user: AdminSessionUser; expiresAt: number }
>();

/**
 * Creates a secure session token and persists to Memory, Local File, and Supabase (and sets HttpOnly cookie)
 */
export async function createAdminSession(
  userId: string,
  userFallback?: AdminSessionUser
): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const createdAt = new Date().toISOString();

  const user: AdminSessionUser = userFallback || {
    id: userId,
    email: "admin@modularhome.com",
    name: "Admin User",
    role: "SUPER_ADMIN",
  };

  // 1. In-memory cache
  memorySessions.set(sessionToken, { user, expiresAt });

  // 2. Persistent file store
  try {
    const list = readLocalAdminSessions().filter((s) => s.expires_at > Date.now());
    list.unshift({
      session_token: sessionToken,
      user_id: userId,
      user,
      expires_at: expiresAt,
      created_at: createdAt,
    });
    writeLocalAdminSessions(list);
  } catch (err) {
    console.warn("Local admin session write note:", err);
  }

  // 3. Supabase database table
  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from("sessions").insert({
        session_token: sessionToken,
        user_id: userId !== "admin-root" ? userId : null,
        expires_at: expiresAt,
      });
    } catch (e) {
      console.warn("Could not persist session to Supabase sessions table:", e);
    }
  }

  // 4. Set HttpOnly cookie
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    });
  } catch (cookieErr) {
    console.warn("Admin session cookie store note:", cookieErr);
  }

  return sessionToken;
}

/**
 * Retrieves the current authenticated admin session with multi-tier fallback
 */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    let token: string | undefined;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      return null;
    }

    if (!token) return null;

    // 1. Check in-memory store
    const mem = memorySessions.get(token);
    if (mem) {
      if (Date.now() > mem.expiresAt) {
        memorySessions.delete(token);
        return null;
      }
      return mem.user;
    }

    // 2. Check local persistent session file
    const localList = readLocalAdminSessions();
    const localMatch = localList.find((s) => s.session_token === token);
    if (localMatch && localMatch.expires_at > Date.now()) {
      // Re-populate memory cache
      memorySessions.set(token, { user: localMatch.user, expiresAt: localMatch.expires_at });
      return localMatch.user;
    }

    // 3. Query Supabase database
    if (isSupabaseConfigured()) {
      try {
        const { data: sessionData, error: sessError } = await supabaseAdmin
          .from("sessions")
          .select("session_token, expires_at, user_id")
          .eq("session_token", token)
          .maybeSingle();

        if (!sessError && sessionData) {
          if (Number(sessionData.expires_at) < Date.now()) {
            await supabaseAdmin.from("sessions").delete().eq("session_token", token);
            return null;
          }

          if (sessionData.user_id) {
            const { data: dbUser } = await supabaseAdmin
              .from("admin_users")
              .select("id, email, name, role, status")
              .eq("id", sessionData.user_id)
              .maybeSingle();

            if (dbUser && dbUser.status === "ACTIVE") {
              const sessionUser: AdminSessionUser = {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role || "SUPER_ADMIN",
              };
              memorySessions.set(token, { user: sessionUser, expiresAt: Number(sessionData.expires_at) });
              return sessionUser;
            }
          }
        }
      } catch (dbErr) {
        console.warn("Supabase session check error note:", dbErr);
      }
    }

    return null;
  } catch (error) {
    console.error("Error retrieving admin session:", error);
    return null;
  }
}

/**
 * Destroys current session across memory, local file, DB and clears auth cookie
 */
export async function destroyAdminSession(): Promise<void> {
  try {
    let token: string | undefined;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {}

    if (token) {
      memorySessions.delete(token);

      try {
        const remaining = readLocalAdminSessions().filter((s) => s.session_token !== token);
        writeLocalAdminSessions(remaining);
      } catch {}

      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin.from("sessions").delete().eq("session_token", token);
        } catch {}
      }
    }

    try {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
    } catch {}
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
        error: { message: "Unauthorized. Admin session expired or invalid. Please sign in.", code: "UNAUTHORIZED" },
      },
      { status: 401 }
    );
  }
  return session;
}

/**
 * Route protection helper that verifies the current admin user possesses one of the allowed roles
 */
export async function requireAdminRole(
  allowedRoles: string[]
): Promise<NextResponse | AdminSessionUser> {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userRole = (authResult.role || "SUPER_ADMIN").toUpperCase();
  const normalizedRole =
    userRole === "ADMIN" ? "SUPER_ADMIN" : userRole === "EDITOR" ? "CONTENT_ADMIN" : userRole;

  const normalizedAllowed = allowedRoles.map((r) =>
    r.toUpperCase() === "ADMIN" ? "SUPER_ADMIN" : r.toUpperCase() === "EDITOR" ? "CONTENT_ADMIN" : r.toUpperCase()
  );

  if (!normalizedAllowed.includes(normalizedRole) && normalizedRole !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: `Forbidden. Your role (${authResult.role}) does not have permission for this action.`,
          code: "FORBIDDEN",
        },
      },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Invalidates all active sessions for a specific user across all devices
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  // 1. Remove from memory store
  for (const [token, record] of Array.from(memorySessions.entries())) {
    if (record.user.id === userId) {
      memorySessions.delete(token);
    }
  }

  // 2. Remove from local file store
  try {
    const list = readLocalAdminSessions().filter((s) => s.user_id !== userId && s.user.id !== userId);
    writeLocalAdminSessions(list);
  } catch {}

  // 3. Remove from Supabase sessions
  if (isSupabaseConfigured() && userId !== "admin-root") {
    try {
      await supabaseAdmin.from("sessions").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Could not invalidate sessions in Supabase:", e);
    }
  }
}
