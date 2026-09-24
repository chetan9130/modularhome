import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { logActivity } from "@/lib/activityLog";
import { sendRefundConfirmationEmail } from "@/lib/emailService";
import { logCustomerEvent } from "@/lib/customerStore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN"]);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason, amount: customAmount } = body;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: { message: "Database not configured" } },
        { status: 503 }
      );
    }

    // Retrieve order and payment intent
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        payments (
          stripe_payment_intent_id,
          stripe_session_id,
          amount
        )
      `)
      .eq("id", id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { success: false, error: { message: "Order not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    if (order.payment_status === "REFUNDED") {
      return NextResponse.json(
        { success: false, error: { message: "Order has already been refunded.", code: "ALREADY_REFUNDED" } },
        { status: 400 }
      );
    }

    const refundAmount = Number(customAmount) || Number(order.total_amount) || 0;
    const paymentRecord = Array.isArray(order.payments) ? order.payments[0] : order.payments;
    const paymentIntentId = paymentRecord?.stripe_payment_intent_id;

    // Process Stripe refund if live
    if (isStripeConfigured() && paymentIntentId && !paymentIntentId.startsWith("pi_mock")) {
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: Math.round(refundAmount * 100),
          reason: "requested_by_customer",
        });
      } catch (stripeErr: any) {
        console.warn("Stripe refund call warning:", stripeErr.message);
      }
    }

    // Update order status in Supabase
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "REFUNDED",
        order_status: "CANCELLED",
        refunded_amount: refundAmount,
        refund_reason: reason || "Administrative refund approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // Revoke download tokens associated with refunded order
    await supabaseAdmin
      .from("download_access")
      .update({
        expires_at: new Date().toISOString(),
      })
      .eq("order_id", order.id);

    // Send refund confirmation email
    await sendRefundConfirmationEmail({
      email: order.customer_email,
      name: order.customer_name,
      orderNumber: order.order_number,
      refundAmount,
      reason: reason || "Administrative refund approved",
      orderId: order.id,
      customerId: order.customer_id,
    });

    // Record admin activity log
    await logActivity({
      user_id: authResult.id,
      user_name: authResult.name,
      user_role: authResult.role,
      action: "REFUND_ORDER",
      entity_type: "orders",
      entity_id: order.id,
      description: `Refunded order ${order.order_number} for $${refundAmount.toLocaleString()}`,
      details: { orderNumber: order.order_number, refundAmount, reason },
    });

    if (order.customer_id) {
      await logCustomerEvent({
        customer_id: order.customer_id,
        event_type: "ORDER_REFUNDED",
        actor_type: "ADMIN",
        actor_name: authResult.name,
        details: { orderNumber: order.order_number, refundAmount, reason },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order ${order.order_number} refunded successfully ($${refundAmount.toLocaleString()}).`,
    });
  } catch (error: any) {
    console.error("Order refund error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to process refund." } },
      { status: 500 }
    );
  }
}
