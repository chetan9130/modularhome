import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByResetToken,
  saveCustomer,
  revokeAllCustomerSessions,
  logCustomerEvent,
} from "@/lib/customerStore";
import { hashCustomerPassword, createCustomerSession } from "@/lib/customerAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: "Reset token is required.", code: "MISSING_TOKEN" } },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: "Password must be at least 6 characters.", code: "INVALID_PASSWORD" } },
        { status: 400 }
      );
    }

    const customer = await getCustomerByResetToken(token);
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid or expired password reset token.", code: "INVALID_TOKEN" },
        },
        { status: 400 }
      );
    }

    if (customer.reset_token_expires_at && new Date(customer.reset_token_expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Password reset link has expired. Please request a new one.", code: "EXPIRED_TOKEN" },
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashCustomerPassword(password);
    const updated = await saveCustomer({
      ...customer,
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires_at: null,
      updated_at: new Date().toISOString(),
    });

    // Invalidate existing sessions across all devices
    await revokeAllCustomerSessions(customer.id);

    // Create fresh session
    await createCustomerSession(updated);

    await logCustomerEvent({
      customer_id: updated.id,
      event_type: "PASSWORD_RESET_COMPLETED",
      actor_type: "CUSTOMER",
      actor_name: updated.name,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You are now logged in.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to reset password.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
