import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Stripe from "stripe";
import { constructStripeWebhookEvent, isStripeConfigured } from "@/lib/stripe";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

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

    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const orderNumber = session.metadata?.orderNumber || session.client_reference_id;
        const planSlug = session.metadata?.planSlug || "alpine-sanctuary-900";
        const customerEmail = session.customer_details?.email || session.customer_email || "customer@example.com";
        const amount = (session.amount_total || 0) / 100;

        if (isSupabaseConfigured()) {
          try {
            // Find order
            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id, total_amount")
              .or(`payment_id.eq.${sessionId},order_number.eq.${orderNumber}`)
              .single();

            const resolvedOrderId = order?.id || `ord_${Date.now()}`;

            // Mark Order as PAID
            await supabaseAdmin
              .from("orders")
              .update({
                payment_status: "PAID",
                order_status: "PROCESSING",
                updated_at: new Date().toISOString(),
              })
              .eq("id", resolvedOrderId);

            // Record Payment
            await supabaseAdmin.from("payments").insert({
              order_id: resolvedOrderId,
              stripe_session_id: sessionId,
              stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : `pi_${sessionId.slice(-12)}`,
              amount: amount || order?.total_amount || 495,
              currency: "USD",
              status: "CAPTURED",
              gateway_response: session,
            });

            // Grant download access if not already granted
            const downloadToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            await supabaseAdmin.from("download_access").insert({
              order_id: resolvedOrderId,
              customer_email: customerEmail,
              download_token: downloadToken,
              file_path: `blueprints/${planSlug}.zip`,
              expires_at: expiresAt,
              download_count: 0,
              max_downloads: 5,
            });
          } catch (dbErr: any) {
            console.warn("Supabase webhook processing note:", dbErr.message);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn("Stripe payment intent failed:", paymentIntent.id, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: error?.message || "Webhook processing failed." }, { status: 500 });
  }
}
