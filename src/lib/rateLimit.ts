import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

// In-memory rate limit store fallback
const memoryAttempts = new Map<
  string,
  { count: number; lastAttempt: number; lockedUntil: number | null }
>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export interface RateLimitCheckResult {
  isLocked: boolean;
  remainingAttempts: number;
  lockedMinutesRemaining?: number;
}

/**
 * Checks if an email / IP is currently locked out from login attempts
 */
export async function checkLoginRateLimit(
  email: string,
  ip: string = "unknown"
): Promise<RateLimitCheckResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();

  // 1. Check in Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("login_attempts")
        .select("*")
        .eq("email", normalizedEmail)
        .single();

      if (!error && data) {
        if (data.locked_until && new Date(data.locked_until).getTime() > now) {
          const lockedMinutes = Math.ceil(
            (new Date(data.locked_until).getTime() - now) / (60 * 1000)
          );
          return {
            isLocked: true,
            remainingAttempts: 0,
            lockedMinutesRemaining: lockedMinutes,
          };
        }

        // If lockout expired, reset attempt count if last attempt was over 15 mins ago
        if (
          data.locked_until &&
          new Date(data.locked_until).getTime() <= now &&
          now - new Date(data.last_attempt_at).getTime() > LOCKOUT_DURATION_MS
        ) {
          await supabaseAdmin
            .from("login_attempts")
            .update({ attempt_count: 0, locked_until: null })
            .eq("email", normalizedEmail);
          return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
        }

        const count = data.attempt_count || 0;
        return {
          isLocked: false,
          remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - count),
        };
      }
    } catch (e) {
      console.warn("DB rate limit check warning:", e);
    }
  }

  // 2. Memory Store fallback
  const record = memoryAttempts.get(normalizedEmail);
  if (record) {
    if (record.lockedUntil && record.lockedUntil > now) {
      const lockedMinutes = Math.ceil((record.lockedUntil - now) / (60 * 1000));
      return {
        isLocked: true,
        remainingAttempts: 0,
        lockedMinutesRemaining: lockedMinutes,
      };
    }
    if (record.lockedUntil && record.lockedUntil <= now) {
      memoryAttempts.delete(normalizedEmail);
      return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
    }
    return {
      isLocked: false,
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count),
    };
  }

  return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
}

/**
 * Records a failed login attempt and applies a lockout if threshold reached
 */
export async function recordFailedLogin(
  email: string,
  ip: string = "unknown"
): Promise<{ isNowLocked: boolean; remainingAttempts: number }> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();

  let count = 1;

  // 1. Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from("login_attempts")
        .select("*")
        .eq("email", normalizedEmail)
        .single();

      if (data) {
        count = (data.attempt_count || 0) + 1;
        const isLocked = count >= MAX_FAILED_ATTEMPTS;
        const lockedUntil = isLocked
          ? new Date(now + LOCKOUT_DURATION_MS).toISOString()
          : null;

        await supabaseAdmin
          .from("login_attempts")
          .update({
            attempt_count: count,
            last_attempt_at: new Date(now).toISOString(),
            locked_until: lockedUntil,
            ip_address: ip,
          })
          .eq("email", normalizedEmail);

        return {
          isNowLocked: isLocked,
          remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - count),
        };
      } else {
        await supabaseAdmin.from("login_attempts").insert({
          email: normalizedEmail,
          ip_address: ip,
          attempt_count: 1,
          last_attempt_at: new Date(now).toISOString(),
          locked_until: null,
        });
        return { isNowLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - 1 };
      }
    } catch (e) {
      console.warn("DB failed login recording note:", e);
    }
  }

  // 2. Memory Store fallback
  const existing = memoryAttempts.get(normalizedEmail);
  count = existing ? existing.count + 1 : 1;
  const isLocked = count >= MAX_FAILED_ATTEMPTS;
  const lockedUntil = isLocked ? now + LOCKOUT_DURATION_MS : null;

  memoryAttempts.set(normalizedEmail, {
    count,
    lastAttempt: now,
    lockedUntil,
  });

  return {
    isNowLocked: isLocked,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - count),
  };
}

/**
 * Clears failed login attempts after a successful login
 */
export async function clearLoginAttempts(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  memoryAttempts.delete(normalizedEmail);

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin
        .from("login_attempts")
        .delete()
        .eq("email", normalizedEmail);
    } catch {}
  }
}
