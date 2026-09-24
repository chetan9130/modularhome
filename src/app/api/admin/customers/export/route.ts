import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { getAllCustomers } from "@/lib/customerStore";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLog";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const customers = await getAllCustomers();

    // Map order counts and LTV
    let customerStatsMap: Record<string, { orderCount: number; ltv: number }> = {};
    if (isSupabaseConfigured()) {
      try {
        const { data: orders } = await supabaseAdmin
          .from("orders")
          .select("customer_id, customer_email, total_amount, payment_status");

        if (orders) {
          orders.forEach((ord) => {
            const key = ord.customer_id || ord.customer_email?.toLowerCase();
            if (!key) return;
            if (!customerStatsMap[key]) customerStatsMap[key] = { orderCount: 0, ltv: 0 };
            customerStatsMap[key].orderCount += 1;
            if (ord.payment_status === "PAID") {
              customerStatsMap[key].ltv += Number(ord.total_amount || 0);
            }
          });
        }
      } catch {}
    }

    // Build CSV Content
    const headers = [
      "Customer ID",
      "Full Name",
      "Email Address",
      "Phone",
      "Account Status",
      "Email Verified",
      "Total Orders",
      "Lifetime Value (USD)",
      "Registered Date",
      "Last Login",
    ];

    const rows = customers.map((c) => {
      const stats = customerStatsMap[c.id] || customerStatsMap[c.email.toLowerCase()] || { orderCount: 0, ltv: 0 };
      return [
        `"${c.id}"`,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `"${c.phone || ""}"`,
        `"${c.status}"`,
        `"${c.email_verified ? "YES" : "NO"}"`,
        stats.orderCount,
        stats.ltv.toFixed(2),
        `"${new Date(c.created_at).toISOString()}"`,
        `"${c.last_login_at ? new Date(c.last_login_at).toISOString() : ""}"`,
      ].join(",");
    });

    const csvData = [headers.join(","), ...rows].join("\n");

    await logActivity({
      user_id: authResult.id,
      user_name: authResult.name,
      user_role: authResult.role,
      action: "EXPORT_CUSTOMER_DATA",
      entity_type: "customers",
      description: `Admin exported ${customers.length} customer records to CSV`,
    });

    const filename = `modularhome-customers-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to export customer data." } },
      { status: 500 }
    );
  }
}
