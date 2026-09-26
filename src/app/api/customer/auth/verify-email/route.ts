import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByVerificationToken,
  saveCustomer,
  logCustomerEvent,
} from "@/lib/customerStore";
import { createCustomerSession } from "@/lib/customerAuth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.token || request.nextUrl.searchParams.get("token");

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Verification token is required.", code: "MISSING_TOKEN" } },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const customer = await getCustomerByVerificationToken(cleanToken);
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid or expired verification token. Please request a fresh link.", code: "INVALID_TOKEN" },
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
          error: { message: "Verification token has expired. Please request a new verification link.", code: "EXPIRED_TOKEN" },
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

    // Update Supabase Auth user if linked
    if (customer.auth_user_id && isSupabaseConfigured()) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(customer.auth_user_id, {
          email_confirm: true,
        });
      } catch (authErr) {
        console.warn("Supabase auth user confirmation sync note:", authErr);
      }
    }

    await logCustomerEvent({
      customer_id: updated.id,
      event_type: "EMAIL_VERIFIED",
      actor_type: "CUSTOMER",
      actor_name: updated.name,
      details: { email: updated.email },
    });

    // Refresh active customer session
    await createCustomerSession(updated);

    return NextResponse.json({
      success: true,
      customer: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        email_verified: true,
        status: updated.status,
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
