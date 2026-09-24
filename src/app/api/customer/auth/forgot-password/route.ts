import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail, saveCustomer, logCustomerEvent } from "@/lib/customerStore";
import { generateSecureToken } from "@/lib/customerAuth";
import { sendPasswordResetEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: { message: "Valid email is required.", code: "MISSING_EMAIL" } },
        { status: 400 }
      );
    }

    const customer = await getCustomerByEmail(email);
    if (!customer) {
      // Don't leak existence
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
      });
    }

    const resetToken = generateSecureToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await saveCustomer({
      ...customer,
      reset_token: resetToken,
      reset_token_expires_at: resetExpires,
      updated_at: new Date().toISOString(),
    });

    await sendPasswordResetEmail({
      email: customer.email,
      name: customer.name,
      token: resetToken,
      customerId: customer.id,
    });

    await logCustomerEvent({
      customer_id: customer.id,
      event_type: "PASSWORD_RESET_REQUESTED",
      actor_type: "CUSTOMER",
      actor_name: customer.name,
      details: { email: customer.email },
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to process request.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
