import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail, saveCustomer } from "@/lib/customerStore";
import { getCustomerSession, generateSecureToken } from "@/lib/customerAuth";
import { sendVerificationEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let email = body.email;

    if (!email) {
      const session = await getCustomerSession();
      if (session) {
        email = session.email;
      }
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: "Email is required to resend verification.", code: "MISSING_EMAIL" } },
        { status: 400 }
      );
    }

    const customer = await getCustomerByEmail(email);
    if (!customer) {
      // Return ok to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists, a new verification link has been sent.",
      });
    }

    if (customer.email_verified) {
      return NextResponse.json({
        success: true,
        message: "Your email address is already verified.",
      });
    }

    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await saveCustomer({
      ...customer,
      verification_token: verificationToken,
      verification_token_expires_at: verificationExpires,
      updated_at: new Date().toISOString(),
    });

    await sendVerificationEmail({
      email: customer.email,
      name: customer.name,
      token: verificationToken,
      customerId: customer.id,
    });

    return NextResponse.json({
      success: true,
      message: "A fresh verification link has been emailed to you.",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to resend verification.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
