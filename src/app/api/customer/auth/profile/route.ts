import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { getCustomerById, saveCustomer, logCustomerEvent } from "@/lib/customerStore";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const customer = await getCustomerById(session.id);
    if (!customer) {
      return NextResponse.json({ success: false, error: { message: "Customer not found" } }, { status: 404 });
    }

    // Fetch stats (orders count, total spend, downloads)
    let orderCount = 0;
    let totalSpend = 0;
    let downloadsCount = 0;

    if (isSupabaseConfigured()) {
      try {
        const { data: orders } = await supabaseAdmin
          .from("orders")
          .select("id, total_amount, payment_status")
          .or(`customer_id.eq.${customer.id},customer_email.eq.${customer.email}`);
        
        if (orders) {
          orderCount = orders.length;
          totalSpend = orders
            .filter((o) => o.payment_status === "PAID")
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        }

        const { count } = await supabaseAdmin
          .from("download_access")
          .select("*", { count: "exact", head: true })
          .eq("customer_email", customer.email);
        
        if (typeof count === "number") downloadsCount = count;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        billing_address: customer.billing_address || {},
        email_verified: customer.email_verified,
        provider: customer.provider || "EMAIL",
        status: customer.status,
        created_at: customer.created_at,
        stats: {
          orderCount,
          totalSpend,
          downloadsCount,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const customer = await getCustomerById(session.id);
    if (!customer) {
      return NextResponse.json({ success: false, error: { message: "Customer not found" } }, { status: 404 });
    }

    const body = await request.json();
    const { name, phone, billing_address } = body;

    const updated = await saveCustomer({
      ...customer,
      name: name && name.trim() ? name.trim() : customer.name,
      phone: phone !== undefined ? (phone ? String(phone).trim() : null) : customer.phone,
      billing_address: billing_address || customer.billing_address || {},
      updated_at: new Date().toISOString(),
    });

    await logCustomerEvent({
      customer_id: customer.id,
      event_type: "PROFILE_UPDATED",
      actor_type: "CUSTOMER",
      actor_name: updated.name,
      details: { name: updated.name, phone: updated.phone },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        billing_address: updated.billing_address,
        email_verified: updated.email_verified,
      },
      message: "Profile updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}
