import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Stripe from "stripe";
import { constructStripeWebhookEvent, isStripeConfigured } from "@/lib/stripe";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { isWebhookProcessed, logWebhookEvent, logCustomerEvent } from "@/lib/customerStore";
import { sendOrderConfirmationEmail, sendRefundConfirmationEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (isStripeConfigured() && signature) {
      try {
        event = constructStripeWebhookEvent(rawBody, signature);
      } catch (err: any) {
        console.error("Stripe webhook signature error:", err.message);
        return NextResponse.json(
          { error: `Webhook Signature Verification Failed: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // In development / testing mode
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
      }
    }

    const eventId = event.id || `evt_sim_${Date.now()}`;

    // 1. Idempotency Check: Prevent duplicate webhook execution
    const alreadyProcessed = await isWebhookProcessed(eventId);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, idempotent: true, note: "Event already processed." });
    }

    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const orderNumber = session.metadata?.orderNumber || session.client_reference_id;
        const planSlug = session.metadata?.primaryPlanSlug || "architectural-blueprint";
        const customerName = session.metadata?.customerName || session.customer_details?.name || "Customer";
        const customerEmail = session.customer_details?.email || session.customer_email || "customer@example.com";
        const customerId = session.metadata?.customerId || null;
        const amount = (session.amount_total || 0) / 100;

        let resolvedOrderId = `ord_${Date.now()}`;
        let orderItemsList: Array<{ title: string; price: number; quantity: number }> = [];

        if (isSupabaseConfigured()) {
          try {
            // Find order
            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id, total_amount, customer_id, order_items(title, price, quantity)")
              .or(`payment_id.eq.${sessionId},order_number.eq.${orderNumber}`)
              .single();

            if (order) {
              resolvedOrderId = order.id;
              if (Array.isArray(order.order_items) && order.order_items.length > 0) {
                orderItemsList = order.order_items;
              }
            }

            // Mark Order as PAID
            await supabaseAdmin
              .from("orders")
              .update({
                payment_status: "PAID",
                order_status: "COMPLETED",
                customer_id: customerId || order?.customer_id || null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", resolvedOrderId);

            // Record Payment Transaction Log
            await supabaseAdmin.from("payments").insert({
              order_id: resolvedOrderId,
              stripe_session_id: sessionId,
              stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : `pi_${sessionId.slice(-12)}`,
              amount: amount || order?.total_amount || 495,
              currency: "USD",
              status: "CAPTURED",
              gateway_response: session,
            });

            // Grant secure download access token (7-day validity, 5 downloads)
            const downloadToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            await supabaseAdmin.from("download_access").insert({
              order_id: resolvedOrderId,
              customer_email: customerEmail.toLowerCase().trim(),
              download_token: downloadToken,
              file_path: `blueprints/${planSlug}.pdf`,
              expires_at: expiresAt,
              download_count: 0,
              max_downloads: 5,
            });

            // Send Order Confirmation & Invoice Email
            await sendOrderConfirmationEmail({
              email: customerEmail,
              name: customerName,
              orderNumber: orderNumber || resolvedOrderId,
              orderId: resolvedOrderId,
              customerId: customerId || undefined,
              amount: amount || 495,
              items: orderItemsList.length > 0 ? orderItemsList : [{ title: "Architectural Blueprint Set", price: amount || 495, quantity: 1 }],
              downloadToken,
            });

            // Log customer activity timeline event if customer exists
            if (customerId) {
              await logCustomerEvent({
                customer_id: customerId,
                event_type: "ORDER_PLACED",
                actor_type: "CUSTOMER",
                actor_name: customerName,
                details: { orderNumber, amount, sessionId },
              });
            }
          } catch (dbErr: any) {
            console.warn("Supabase webhook processing note:", dbErr.message);
          }
        }

        // Log Webhook processed for idempotency
        await logWebhookEvent({
          stripe_event_id: eventId,
          event_type: event.type,
          order_id: resolvedOrderId,
          status: "PROCESSED",
          payload: { orderNumber, amount, customerEmail },
        });

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : "";
        const refundAmount = (charge.amount_refunded || 0) / 100;

        if (isSupabaseConfigured() && paymentIntent) {
          try {
            const { data: paymentRecord } = await supabaseAdmin
              .from("payments")
              .select("order_id, orders(customer_name, customer_email, order_number, customer_id)")
              .eq("stripe_payment_intent_id", paymentIntent)
              .maybeSingle();

            if (paymentRecord && paymentRecord.order_id) {
              await supabaseAdmin
                .from("orders")
                .update({
                  payment_status: "REFUNDED",
                  refunded_amount: refundAmount,
                  refund_reason: "Customer refund processed via Stripe",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", paymentRecord.order_id);

              const ord: any = paymentRecord.orders;
              if (ord) {
                await sendRefundConfirmationEmail({
                  email: ord.customer_email,
                  name: ord.customer_name,
                  orderNumber: ord.order_number,
                  refundAmount,
                  orderId: paymentRecord.order_id,
                  customerId: ord.customer_id,
                });
              }
            }
          } catch (err: any) {
            console.warn("Supabase refund webhook processing note:", err.message);
          }
        }

        await logWebhookEvent({
          stripe_event_id: eventId,
          event_type: event.type,
          status: "PROCESSED",
          payload: { paymentIntent, refundAmount },
        });

        break;
      }

      default:
        await logWebhookEvent({
          stripe_event_id: eventId,
          event_type: event.type,
          status: "PROCESSED",
          payload: { type: event.type },
        });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: error?.message || "Webhook processing failed." }, { status: 500 });
  }
}
