import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail, saveCustomer, logCustomerEvent } from "@/lib/customerStore";
import { getCustomerSession, generateSecureToken } from "@/lib/customerAuth";
import { sendVerificationEmail } from "@/lib/emailService";
import { checkResendRateLimit, recordResendAttempt } from "@/lib/rateLimit";

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

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: { message: "Valid email is required to resend verification.", code: "MISSING_EMAIL" } },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Rate Limiting Check (60s cooldown & hourly max)
    const rateCheck = checkResendRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: rateCheck.message || "Please wait before requesting another verification email.",
            code: "RATE_LIMITED",
            cooldownSeconds: rateCheck.cooldownSeconds,
          },
        },
        { status: 429 }
      );
    }

    const customer = await getCustomerByEmail(cleanEmail);
    if (!customer) {
      // Record rate limit attempt even for unknown to prevent enumeration probing
      recordResendAttempt(cleanEmail);
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email address, a new verification link has been sent.",
      });
    }

    if (customer.email_verified) {
      return NextResponse.json({
        success: true,
        message: "Your email address is already verified.",
        verified: true,
      });
    }

    // 2. Generate fresh token
    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await saveCustomer({
      ...customer,
      verification_token: verificationToken,
      verification_token_expires_at: verificationExpires,
      updated_at: new Date().toISOString(),
    });

    recordResendAttempt(cleanEmail);

    // 3. Send email
    await sendVerificationEmail({
      email: customer.email,
      name: customer.name,
      token: verificationToken,
      customerId: customer.id,
    });

    // 4. Log event
    await logCustomerEvent({
      customer_id: customer.id,
      event_type: "VERIFICATION_RESENT",
      actor_type: "CUSTOMER",
      actor_name: customer.name,
      details: { email: customer.email },
    });

    return NextResponse.json({
      success: true,
      message: "A fresh verification link has been emailed to you.",
      cooldownSeconds: 60,
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to resend verification.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
