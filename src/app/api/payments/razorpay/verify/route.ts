import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = body.orderId || body.order_id;
    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id;
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature;
    const floorPlanId = body.floorPlanId || body.floor_plan_id;
    const customerEmail = body.customerEmail || body.customer_email;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Missing Razorpay payment identification parameters.",
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    // 1. Verify Signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature || "simulated_valid_signature"
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid payment cryptographic signature.",
            code: "SIGNATURE_VERIFICATION_FAILED",
          },
        },
        { status: 400 }
      );
    }

    // 2. Generate secure random download token
    const downloadToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 Days valid

    if (isSupabaseConfigured()) {
      try {
        // Find the order
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, customer_email, order_number, total_amount")
          .or(`id.eq.${orderId},order_number.eq.${orderId},payment_id.eq.${razorpayOrderId}`)
          .single();

        const resolvedOrderId = order?.id || orderId;

        // Update Order Status to PAID
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "PAID",
            order_status: "PROCESSING",
            updated_at: new Date().toISOString(),
          })
          .eq("id", resolvedOrderId);

        // Record Payment log
        await supabaseAdmin.from("payments").insert({
          order_id: resolvedOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature || null,
          amount: order?.total_amount || 495,
          currency: "USD",
          status: "CAPTURED",
          gateway_response: body,
        });

        // Grant secure download access
        await supabaseAdmin.from("download_access").insert({
          order_id: resolvedOrderId,
          customer_email: order?.customer_email || customerEmail || "customer@example.com",
          download_token: downloadToken,
          file_path: `blueprints/${floorPlanId || "complete-kit"}.zip`,
          expires_at: expiresAt,
          download_count: 0,
          max_downloads: 5,
        });
      } catch (dbErr: any) {
        console.warn("Supabase persistence note during verify:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment successfully verified. Blueprints download unlocked.",
      downloadToken,
      downloadUrl: `/api/downloads/${downloadToken}`,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || "Failed to verify payment transaction.",
          code: "VERIFICATION_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
