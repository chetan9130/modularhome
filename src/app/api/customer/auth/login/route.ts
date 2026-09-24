import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByEmail,
  saveCustomer,
  logCustomerEvent,
} from "@/lib/customerStore";
import {
  verifyCustomerPassword,
  createCustomerSession,
} from "@/lib/customerAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Email and password are required.", code: "MISSING_CREDENTIALS" } },
        { status: 400 }
      );
    }

    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password.", code: "INVALID_CREDENTIALS" } },
        { status: 401 }
      );
    }

    if (customer.status === "DISABLED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Your customer account has been disabled. Please contact customer support.",
            code: "ACCOUNT_DISABLED",
          },
        },
        { status: 403 }
      );
    }

    const isValid = await verifyCustomerPassword(password, customer.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password.", code: "INVALID_CREDENTIALS" } },
        { status: 401 }
      );
    }

    // Update last login
    await saveCustomer({
      ...customer,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Create session
    await createCustomerSession(customer);

    // Log login event
    await logCustomerEvent({
      customer_id: customer.id,
      event_type: "LOGGED_IN",
      actor_type: "CUSTOMER",
      actor_name: customer.name,
      details: { email: customer.email },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        email_verified: customer.email_verified,
        status: customer.status,
      },
      message: "Successfully signed in.",
    });
  } catch (error: any) {
    console.error("Customer login error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to sign in.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
