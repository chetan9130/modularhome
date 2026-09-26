import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByEmail,
  saveCustomer,
  saveTermsConsent,
  logCustomerEvent,
} from "@/lib/customerStore";
import {
  hashCustomerPassword,
  generateSecureToken,
  createCustomerSession,
} from "@/lib/customerAuth";
import { sendVerificationEmail } from "@/lib/emailService";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      name,
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      phone,
      agree_terms,
      terms_version = "v1.0",
    } = body;

    // 1. Resolve & validate Name
    let fullName = name ? String(name).trim() : "";
    const fName = first_name ? String(first_name).trim() : "";
    const lName = last_name ? String(last_name).trim() : "";

    if (!fullName && (fName || lName)) {
      fullName = `${fName} ${lName}`.trim();
    }

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Please provide your full name (at least 2 characters).", code: "VALIDATION_ERROR" },
        },
        { status: 400 }
      );
    }

    // 2. Validate Email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Please provide a valid email address.", code: "VALIDATION_ERROR" },
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 3. Validate Password & Strength
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Password must be at least 8 characters long and contain both letters and numbers.",
            code: "WEAK_PASSWORD",
          },
        },
        { status: 400 }
      );
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (!hasLetters || !hasNumbers) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Password must contain at least one letter and one number.",
            code: "WEAK_PASSWORD",
          },
        },
        { status: 400 }
      );
    }

    // 4. Password Confirmation check if provided
    if (confirm_password !== undefined && password !== confirm_password) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Passwords do not match. Please re-enter your password.", code: "PASSWORD_MISMATCH" },
        },
        { status: 400 }
      );
    }

    // 5. Terms of Service & Privacy Policy acceptance
    if (agree_terms === false) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "You must accept the Terms of Service and Privacy Policy to create an account.",
            code: "TERMS_NOT_ACCEPTED",
          },
        },
        { status: 400 }
      );
    }

    // 6. Duplicate Account Protection
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

    // 7. Supabase Auth User Integration (if configured)
    let authUserId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: false,
          user_metadata: {
            name: fullName,
            first_name: fName || undefined,
            last_name: lName || undefined,
            phone: phone ? String(phone).trim() : undefined,
          },
        });

        if (!authError && authUser?.user) {
          authUserId = authUser.user.id;
        } else if (authError && authError.message?.includes("already been registered")) {
          // If auth user already registered in Supabase auth table
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
        } else if (authError) {
          console.warn("Supabase auth user creation note:", authError.message);
        }
      } catch (authErr) {
        console.warn("Supabase auth creation exception (using customer record):", authErr);
      }
    }

    // 8. Generate Password Hash & Secure Tokens
    const passwordHash = await hashCustomerPassword(password);
    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const customerId = `cust-${Date.now()}-${generateSecureToken().substring(0, 8)}`;
    const nowIso = new Date().toISOString();

    // 9. Save Customer Record
    const newCustomer = await saveCustomer({
      id: customerId,
      auth_user_id: authUserId,
      email: cleanEmail,
      name: fullName,
      first_name: fName || null,
      last_name: lName || null,
      phone: phone ? String(phone).trim() : null,
      password_hash: passwordHash,
      status: "ACTIVE",
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires_at: verificationExpires,
      terms_accepted_at: nowIso,
      terms_version: terms_version,
      provider: "EMAIL",
      created_at: nowIso,
      updated_at: nowIso,
    });

    // 10. Audit Record for Terms Consent
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || null;

    await saveTermsConsent({
      customer_id: newCustomer.id,
      email: cleanEmail,
      policy_version: terms_version,
      ip_address: clientIp,
      user_agent: userAgent,
      accepted_at: nowIso,
    });

    // 11. Send Branded Verification Email
    await sendVerificationEmail({
      email: cleanEmail,
      name: newCustomer.name,
      token: verificationToken,
      customerId: newCustomer.id,
    });

    // 12. Log Account Creation Event
    await logCustomerEvent({
      customer_id: newCustomer.id,
      event_type: "ACCOUNT_CREATED",
      actor_type: "CUSTOMER",
      actor_name: newCustomer.name,
      details: {
        email: cleanEmail,
        phone: newCustomer.phone,
        terms_version: terms_version,
        auth_user_id: authUserId,
      },
    });

    // 13. Create Customer Session (unverified state)
    await createCustomerSession(newCustomer);

    // 14. Return Safe Customer Response (No sensitive hashes or tokens)
    return NextResponse.json({
      success: true,
      customer: {
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email_verified: false,
        status: newCustomer.status,
      },
      message: "Account registered successfully! A verification email has been sent.",
    });
  } catch (error: any) {
    console.error("Customer signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to register account.", code: "SERVER_ERROR" },
      },
      { status: 500 }
    );
  }
}
