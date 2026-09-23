import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, verifyPassword, invalidateAllUserSessions } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { generateTotpSecret, generateOtpAuthUrl, verifyTotpCode, generateRecoveryCodes } from "@/lib/totp";
import { logAdminActivity } from "@/lib/activityLog";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "";

  try {
    const body = await request.json();
    const { action } = body;

    // 1. Setup 2FA: Generate secret, OTPAuth URL, and recovery codes
    if (action === "setup_2fa") {
      const { base32 } = generateTotpSecret();
      const otpAuthUrl = generateOtpAuthUrl(authResult.email, base32, "ModularHome Admin");
      const recoveryCodes = generateRecoveryCodes(8);

      return NextResponse.json({
        success: true,
        data: {
          secret: base32,
          otpAuthUrl,
          recoveryCodes,
        },
      });
    }

    // 2. Verify and Enable 2FA
    if (action === "verify_and_enable_2fa") {
      const { secret, code, recoveryCodes } = body;

      if (!secret || !code) {
        return NextResponse.json(
          { success: false, error: { message: "Secret and verification code are required.", code: "VALIDATION_ERROR" } },
          { status: 400 }
        );
      }

      const isValid = verifyTotpCode(String(code).trim(), secret);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: { message: "Invalid 6-digit code. Please verify the code on your authenticator app.", code: "INVALID_CODE" } },
          { status: 400 }
        );
      }

      if (isSupabaseConfigured() && authResult.id && authResult.id !== "admin-root") {
        await supabaseAdmin
          .from("admin_users")
          .update({
            two_factor_secret: secret,
            two_factor_enabled: true,
            two_factor_recovery_codes: Array.isArray(recoveryCodes) ? recoveryCodes : [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", authResult.id);
      }

      await logAdminActivity(
        authResult,
        "2FA_ENABLED",
        "admin_users",
        authResult.id,
        `Enabled 2FA for admin user ${authResult.email}`,
        {},
        ip,
        userAgent
      );

      return NextResponse.json({
        success: true,
        message: "Two-factor authentication enabled successfully!",
      });
    }

    // 3. Disable 2FA
    if (action === "disable_2fa") {
      const { password } = body;
      if (!password) {
        return NextResponse.json(
          { success: false, error: { message: "Current password is required to disable 2FA.", code: "PASSWORD_REQUIRED" } },
          { status: 400 }
        );
      }

      if (isSupabaseConfigured() && authResult.id && authResult.id !== "admin-root") {
        const { data: user } = await supabaseAdmin
          .from("admin_users")
          .select("password_hash")
          .eq("id", authResult.id)
          .single();

        if (user && user.password_hash) {
          const isValid = await verifyPassword(password, user.password_hash);
          if (!isValid) {
            return NextResponse.json(
              { success: false, error: { message: "Incorrect password.", code: "INVALID_PASSWORD" } },
              { status: 401 }
            );
          }
        }

        await supabaseAdmin
          .from("admin_users")
          .update({
            two_factor_secret: null,
            two_factor_enabled: false,
            two_factor_recovery_codes: [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", authResult.id);
      }

      await logAdminActivity(
        authResult,
        "2FA_DISABLED",
        "admin_users",
        authResult.id,
        `Disabled 2FA for admin user ${authResult.email}`,
        {},
        ip,
        userAgent
      );

      return NextResponse.json({
        success: true,
        message: "Two-factor authentication disabled.",
      });
    }

    // 4. Logout All Sessions / Invalidate Other Devices
    if (action === "logout_all_sessions") {
      await invalidateAllUserSessions(authResult.id);

      await logAdminActivity(
        authResult,
        "LOGOUT_ALL_SESSIONS",
        "admin_users",
        authResult.id,
        `Terminated all active sessions for ${authResult.email}`,
        {},
        ip,
        userAgent
      );

      return NextResponse.json({
        success: true,
        message: "All active sessions have been invalidated.",
      });
    }

    return NextResponse.json(
      { success: false, error: { message: "Unknown action specified.", code: "BAD_ACTION" } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin security API error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Internal server error.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
