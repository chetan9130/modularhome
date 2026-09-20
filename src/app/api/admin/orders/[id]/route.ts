import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          id,
          order_number: "MH-ORD-892102",
          customer_name: "Sarah Jenkins",
          customer_email: "sarah.jenkins@example.com",
          total_amount: 595,
          payment_status: "PAID",
          order_status: "COMPLETED",
        },
      });
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*), payments(*), download_access(*)")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: { message: "Order not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error("Error fetching order detail:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch order.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.orderStatus !== undefined) updatePayload.order_status = body.orderStatus;
    if (body.order_status !== undefined) updatePayload.order_status = body.order_status;
    if (body.paymentStatus !== undefined) updatePayload.payment_status = body.paymentStatus;
    if (body.payment_status !== undefined) updatePayload.payment_status = body.payment_status;
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Order updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Order updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update order.", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}
