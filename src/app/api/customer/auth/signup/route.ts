import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByEmail,
  saveCustomer,
  logCustomerEvent,
} from "@/lib/customerStore";
import {
  hashCustomerPassword,
  generateSecureToken,
  createCustomerSession,
} from "@/lib/customerAuth";
import { sendVerificationEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Name is required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: { message: "Valid email is required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: "Password must be at least 6 characters.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await getCustomerByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "An account with this email address already exists. Please sign in.",
            code: "EMAIL_EXISTS",
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashCustomerPassword(password);
    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const customerId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newCustomer = await saveCustomer({
      id: customerId,
      email: cleanEmail,
      name: name.trim(),
      phone: phone ? String(phone).trim() : null,
      password_hash: passwordHash,
      status: "ACTIVE",
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires_at: verificationExpires,
      provider: "EMAIL",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Send verification email
    await sendVerificationEmail({
      email: cleanEmail,
      name: newCustomer.name,
      token: verificationToken,
      customerId: newCustomer.id,
    });

    // Log account creation timeline event
    await logCustomerEvent({
      customer_id: newCustomer.id,
      event_type: "ACCOUNT_CREATED",
      actor_type: "CUSTOMER",
      actor_name: newCustomer.name,
      details: { email: cleanEmail, phone: newCustomer.phone },
    });

    // Auto-create initial session
    await createCustomerSession(newCustomer);

    return NextResponse.json({
      success: true,
      customer: {
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email_verified: false,
      },
      message: "Account registered successfully! A verification email has been sent.",
    });
  } catch (error: any) {
    console.error("Customer signup error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to register account.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
