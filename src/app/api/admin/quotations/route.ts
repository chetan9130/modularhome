import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    let query = supabaseAdmin
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data: quotations, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: quotations || [],
    });
  } catch (error: any) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch quotations.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerZip,
      modelSlug,
      modelName,
      sqft,
      dimensions,
      options,
      pricingInputs,
      estimatedAmount,
      timeline,
      requirements,
      source,
    } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: { message: "Name and email are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const quoteData = {
      customer_name: customerName,
      customer_email: customerEmail.toLowerCase().trim(),
      customer_phone: customerPhone || null,
      customer_zip: customerZip || null,
      model_slug: modelSlug || null,
      model_name: modelName || null,
      sqft: sqft ? Number(sqft) : null,
      dimensions: dimensions || null,
      options: typeof options === "string" ? JSON.parse(options) : options || [],
      pricing_inputs: typeof pricingInputs === "string" ? JSON.parse(pricingInputs) : pricingInputs || {},
      estimated_amount: estimatedAmount ? Number(estimatedAmount) : null,
      timeline: timeline || null,
      requirements: requirements || null,
      source: source || "QUOTE_WIZARD",
      status: "PENDING",
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("quotations")
        .insert(quoteData)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Quotation recorded successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-quote-id", ...quoteData },
      message: "Quotation recorded successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to record quotation.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
