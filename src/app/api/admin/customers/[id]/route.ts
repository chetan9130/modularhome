import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import {
  getCustomerById,
  saveCustomer,
  getCustomerEvents,
} from "@/lib/customerStore";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const customer = await getCustomerById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: { message: "Customer not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Retrieve customer orders, downloads, events
    let orders: any[] = [];
    let downloads: any[] = [];
    let events = await getCustomerEvents(customer.id);

    if (isSupabaseConfigured()) {
      try {
        const { data: ords } = await supabaseAdmin
          .from("orders")
          .select(`
            *,
            order_items (id, title, price, quantity),
            download_access (id, download_token, expires_at, download_count, max_downloads)
          `)
          .or(`customer_id.eq.${customer.id},customer_email.eq.${customer.email}`)
          .order("created_at", { ascending: false });

        if (ords) {
          orders = ords;
          ords.forEach((o) => {
            if (Array.isArray(o.download_access)) {
              o.download_access.forEach((d: any) => {
                downloads.push({
                  ...d,
                  orderNumber: o.order_number,
                  orderDate: o.created_at,
                  items: o.order_items,
                });
              });
            }
          });
        }
      } catch {}
    }

    // Safe customer object without password hash
    const safeCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      email_verified: customer.email_verified,
      provider: customer.provider || "EMAIL",
      billing_address: customer.billing_address || {},
      last_login_at: customer.last_login_at,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };

    return NextResponse.json({
      success: true,
      customer: safeCustomer,
      orders,
      downloads,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to retrieve customer." } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const customer = await getCustomerById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: { message: "Customer not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, phone, billing_address, status } = body;

    const updated = await saveCustomer({
      ...customer,
      name: name && name.trim() ? name.trim() : customer.name,
      phone: phone !== undefined ? (phone ? String(phone).trim() : null) : customer.phone,
      billing_address: billing_address || customer.billing_address || {},
      status: status === "ACTIVE" || status === "DISABLED" ? status : customer.status,
      updated_at: new Date().toISOString(),
    });

    await logActivity({
      user_id: authResult.id,
      user_name: authResult.name,
      user_role: authResult.role,
      action: "UPDATE_CUSTOMER_PROFILE",
      entity_type: "customers",
      entity_id: customer.id,
      description: `Updated profile details for customer ${updated.name} (${updated.email})`,
      details: { name: updated.name, phone: updated.phone, status: updated.status },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        status: updated.status,
        email_verified: updated.email_verified,
        billing_address: updated.billing_address,
      },
      message: "Customer profile updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update customer." } },
      { status: 500 }
    );
  }
}
