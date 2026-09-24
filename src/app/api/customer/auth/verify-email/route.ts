import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByVerificationToken,
  saveCustomer,
  logCustomerEvent,
} from "@/lib/customerStore";
import { createCustomerSession } from "@/lib/customerAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token || request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: "Verification token is required.", code: "MISSING_TOKEN" } },
        { status: 400 }
      );
    }

    const customer = await getCustomerByVerificationToken(token);
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid or expired verification token.", code: "INVALID_TOKEN" },
        },
        { status: 400 }
      );
    }

    if (
      customer.verification_token_expires_at &&
      new Date(customer.verification_token_expires_at) < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Verification token has expired. Please request a new one.", code: "EXPIRED_TOKEN" },
        },
        { status: 400 }
      );
    }

    const updated = await saveCustomer({
      ...customer,
      email_verified: true,
      verification_token: null,
      verification_token_expires_at: null,
      updated_at: new Date().toISOString(),
    });

    await logCustomerEvent({
      customer_id: updated.id,
      event_type: "EMAIL_VERIFIED",
      actor_type: "CUSTOMER",
      actor_name: updated.name,
      details: { email: updated.email },
    });

    await createCustomerSession(updated);

    return NextResponse.json({
      success: true,
      customer: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        email_verified: true,
      },
      message: "Email verified successfully! Welcome to your customer portal.",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to verify email.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
