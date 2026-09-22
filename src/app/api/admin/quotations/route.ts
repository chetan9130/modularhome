import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

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

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`customer_name.ilike.%${s}%,customer_email.ilike.%${s}%,model_name.ilike.%${s}%,customer_phone.ilike.%${s}%`);
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
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

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

    const name = customerName || body.name || body.customer_name;
    const email = customerEmail || body.email || body.customer_email;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: { message: "Name and email are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const quoteData = {
      customer_name: name,
      customer_email: email.toLowerCase().trim(),
      customer_phone: customerPhone || body.phone || null,
      customer_zip: customerZip || body.zip || null,
      model_slug: modelSlug || body.model_slug || null,
      model_name: modelName || body.model_name || null,
      sqft: sqft ? Number(sqft) : null,
      dimensions: dimensions || null,
      options: typeof options === "string" ? JSON.parse(options) : options || [],
      pricing_inputs: typeof pricingInputs === "string" ? JSON.parse(pricingInputs) : pricingInputs || {},
      estimated_amount: estimatedAmount ? Number(estimatedAmount) : null,
      timeline: timeline || null,
      requirements: requirements || body.notes || null,
      source: source || "QUOTE_WIZARD",
      status: body.status || "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      data: { id: `mock-${Date.now()}`, ...quoteData },
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
