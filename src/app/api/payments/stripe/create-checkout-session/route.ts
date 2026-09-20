import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_FLOOR_PLANS } from "@/data/floorPlans";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { floorPlanId, customerName, customerEmail, customerPhone, customerZip } = body;

    if (!floorPlanId || !customerName || !customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Floor plan ID, customer name, and email are required.",
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    // 1. Resolve floor plan from DB or local dataset
    let floorPlan: any = null;
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabaseAdmin
          .from("floor_plans")
          .select("*")
          .or(`id.eq.${floorPlanId},slug.eq.${floorPlanId}`)
          .single();
        floorPlan = data;
      } catch (err: any) {
        console.warn("Supabase floor plan lookup note:", err.message);
      }
    }

    if (!floorPlan) {
      floorPlan = INITIAL_FLOOR_PLANS.find(
        (fp) => fp.id === floorPlanId || fp.slug === floorPlanId
      );
    }

    if (!floorPlan) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Floor plan blueprint package not found.", code: "NOT_FOUND" },
        },
        { status: 404 }
      );
    }

    const price = Number(floorPlan.sale_price || floorPlan.salePrice || floorPlan.price);
    const amountInCents = Math.round(price * 100);
    const orderNumber = `MH-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    let stripeSessionId = `cs_test_mock_${Date.now()}`;
    let checkoutUrl: string | null = null;

    // 2. Create live Stripe Checkout Session if credentials present
    if (isStripeConfigured()) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: customerEmail.toLowerCase().trim(),
          client_reference_id: orderNumber,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Architectural Blueprint Package: ${floorPlan.title}`,
                  description: `Single-build license • ${floorPlan.square_feet || floorPlan.squareFeet} sqft • ${floorPlan.bedrooms || 2} Bed • ${floorPlan.bathrooms || 1} Bath • PDF & CAD DWG included`,
                  images: floorPlan.preview_image || floorPlan.previewImage ? [floorPlan.preview_image || floorPlan.previewImage] : [],
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            orderNumber,
            floorPlanId: floorPlan.id,
            planSlug: floorPlan.slug,
            customerName,
            customerPhone: customerPhone || "",
            customerZip: customerZip || "",
          },
          success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${orderNumber}&title=${encodeURIComponent(
            floorPlan.title
          )}`,
          cancel_url: `${origin}/floor-plans/${floorPlan.slug}`,
        });

        stripeSessionId = session.id;
        checkoutUrl = session.url;
      } catch (stripeErr: any) {
        console.error("Stripe session creation error:", stripeErr);
        // In local development fallback gracefully if invalid test keys
        stripeSessionId = `cs_test_sim_${Date.now()}`;
      }
    }

    // 3. Persist Order in Supabase
    let createdOrder: any = {
      id: `ord_${Date.now()}`,
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail.toLowerCase().trim(),
      customer_phone: customerPhone || null,
      customer_zip: customerZip || null,
      total_amount: price,
      currency: "USD",
      payment_status: "PENDING",
      order_status: "PENDING",
      payment_id: stripeSessionId,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: dbOrder, error: orderErr } = await supabaseAdmin
          .from("orders")
          .insert({
            order_number: orderNumber,
            customer_name: customerName,
            customer_email: customerEmail.toLowerCase().trim(),
            customer_phone: customerPhone || null,
            customer_zip: customerZip || null,
            total_amount: price,
            currency: "USD",
            payment_status: "PENDING",
            order_status: "PENDING",
            payment_id: stripeSessionId,
          })
          .select()
          .single();

        if (!orderErr && dbOrder) {
          createdOrder = dbOrder;
          // Insert order item
          await supabaseAdmin.from("order_items").insert({
            order_id: dbOrder.id,
            floor_plan_id: floorPlan.id.startsWith("fp-") ? null : floorPlan.id,
            title: floorPlan.title,
            price: price,
            quantity: 1,
          });
        }
      } catch (dbErr: any) {
        console.warn("Supabase order creation note:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: createdOrder.id,
        orderNumber,
        amount: price,
        currency: "USD",
        sessionId: stripeSessionId,
        checkoutUrl,
        isStripeLive: Boolean(checkoutUrl),
        floorPlan: {
          title: floorPlan.title,
          category: floorPlan.category,
          dimensions: floorPlan.dimensions,
          sqft: floorPlan.square_feet || floorPlan.squareFeet,
        },
      },
    });
  } catch (error: any) {
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to create checkout session.", code: "SESSION_ERROR" },
      },
      { status: 500 }
    );
  }
}
