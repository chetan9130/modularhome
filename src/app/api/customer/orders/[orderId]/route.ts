import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { message: "Order ID required", code: "MISSING_ID" } },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: { message: "Database not configured", code: "DB_UNAVAILABLE" } },
        { status: 503 }
      );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    const filter = isUuid ? `id.eq.${orderId}` : `order_number.eq.${orderId}`;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          title,
          price,
          quantity,
          floor_plan_id,
          floor_plans (
            title,
            slug,
            preview_image,
            dimensions,
            square_feet
          )
        ),
        download_access (
          id,
          download_token,
          expires_at,
          download_count,
          max_downloads
        )
      `)
      .or(filter)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: { message: "Order not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Strict ownership verification: order must belong to authenticated customer
    const isOwner =
      order.customer_id === session.id ||
      (order.customer_email && order.customer_email.toLowerCase() === session.email.toLowerCase());

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Forbidden. You do not have permission to access this order.",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to retrieve order." } },
      { status: 500 }
    );
  }
}
