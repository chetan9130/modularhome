import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { getCustomerById } from "@/lib/customerStore";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const fullCustomer = await getCustomerById(session.id);
    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        name: fullCustomer?.name || session.name,
        phone: fullCustomer?.phone || session.phone,
        email_verified: fullCustomer ? fullCustomer.email_verified : session.email_verified,
        status: fullCustomer?.status || session.status,
        billing_address: fullCustomer?.billing_address || {},
        created_at: fullCustomer?.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
