import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { getAllCustomers } from "@/lib/customerStore";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const verifiedParam = searchParams.get("verified");
    const verified = verifiedParam !== null ? verifiedParam === "true" : undefined;

    const customers = await getAllCustomers({ search, status, verified });

    // Calculate customer order counts and LTV
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
            if (!customerStatsMap[key]) {
              customerStatsMap[key] = { orderCount: 0, ltv: 0 };
            }
            customerStatsMap[key].orderCount += 1;
            if (ord.payment_status === "PAID") {
              customerStatsMap[key].ltv += Number(ord.total_amount || 0);
            }
          });
        }
      } catch {}
    }

    const enhanced = customers.map((c) => {
      const stats = customerStatsMap[c.id] || customerStatsMap[c.email.toLowerCase()] || { orderCount: 0, ltv: 0 };
      return {
        id: c.id,
        email: c.email,
        name: c.name,
        phone: c.phone,
        status: c.status,
        email_verified: c.email_verified,
        provider: c.provider || "EMAIL",
        last_login_at: c.last_login_at,
        created_at: c.created_at,
        orderCount: stats.orderCount,
        ltv: stats.ltv,
      };
    });

    return NextResponse.json({
      success: true,
      customers: enhanced,
      totalCount: enhanced.length,
      metrics: {
        total: enhanced.length,
        verified: enhanced.filter((c) => c.email_verified).length,
        active: enhanced.filter((c) => c.status === "ACTIVE").length,
        purchasers: enhanced.filter((c) => c.orderCount > 0).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to load customers." } },
      { status: 500 }
    );
  }
}
