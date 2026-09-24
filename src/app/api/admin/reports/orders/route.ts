import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let ordersList: any[] = [];
    if (isSupabaseConfigured()) {
      let query = supabaseAdmin.from("orders").select(`
        *,
        order_items (id, title, price, quantity),
        download_access (id, download_token, expires_at, download_count)
      `).order("created_at", { ascending: false });

      if (status && status !== "ALL") {
        query = query.eq("payment_status", status);
      }

      const { data, error } = await query;
      if (!error && data) ordersList = data;
    }

    return NextResponse.json({
      success: true,
      orders: ordersList,
      totalCount: ordersList.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to load orders report." } },
      { status: 500 }
    );
  }
}
