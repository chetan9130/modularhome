import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    let ordersList: any[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data: orders, error } = await supabaseAdmin
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              title,
              price,
              quantity,
              floor_plan_id
            ),
            download_access (
              id,
              download_token,
              expires_at,
              download_count,
              max_downloads
            )
          `)
          .or(`customer_id.eq.${session.id},customer_email.eq.${session.email}`)
          .order("created_at", { ascending: false });

        if (!error && orders) {
          ordersList = orders;
        }
      } catch (e) {
        console.warn("Supabase customer orders query note:", e);
      }
    }

    return NextResponse.json({
      success: true,
      orders: ordersList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to load customer orders." } },
      { status: 500 }
    );
  }
}
