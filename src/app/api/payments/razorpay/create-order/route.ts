import { NextRequest, NextResponse } from "next/server";
import { razorpay, isRazorpayConfigured } from "@/lib/razorpay";
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

    // 1. Resolve floor plan item from DB or mock data
    let floorPlan: any = null;
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from("floor_plans")
        .select("*")
        .or(`id.eq.${floorPlanId},slug.eq.${floorPlanId}`)
        .single();
      floorPlan = data;
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
          error: { message: "Floor plan item not found.", code: "NOT_FOUND" },
        },
        { status: 404 }
      );
    }

    const price = Number(floorPlan.sale_price || floorPlan.salePrice || floorPlan.price);
    const amountInSmallestUnit = Math.round(price * 100); // cents / paise
    const orderNumber = `MH-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    let razorpayOrderId = `rzp_ord_mock_${Date.now()}`;

    // 2. Create Razorpay order if configured
    if (isRazorpayConfigured()) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInSmallestUnit,
          currency: "USD",
          receipt: orderNumber,
          notes: {
            floorPlanId: floorPlan.id,
            planTitle: floorPlan.title,
            customerEmail,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr: any) {
        console.error("Razorpay order creation error:", rzpErr);
        // Fallback to simulated test order in development
        razorpayOrderId = `rzp_test_sim_${Date.now()}`;
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
      payment_id: razorpayOrderId,
    };

    if (isSupabaseConfigured()) {
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
          payment_id: razorpayOrderId,
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
    }

    return NextResponse.json({
      success: true,
      order: {
        id: createdOrder.id,
        orderNumber,
        amount: price,
        currency: "USD",
        razorpayOrderId,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_public_key",
        floorPlan: {
          title: floorPlan.title,
          category: floorPlan.category,
          dimensions: floorPlan.dimensions,
          sqft: floorPlan.square_feet || floorPlan.squareFeet,
        },
      },
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to create order.", code: "ORDER_ERROR" },
      },
      { status: 500 }
    );
  }
}
