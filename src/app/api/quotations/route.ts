import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

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

    const name = (customerName || body.name || body.customer_name || "").trim();
    const email = (customerEmail || body.email || body.customer_email || "").toLowerCase().trim();
    const phone = customerPhone || body.phone || body.customer_phone || null;
    const zip = customerZip || body.zip || body.customer_zip || null;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: { message: "Name and email are required to request a quote.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const quoteData = {
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_zip: zip,
      model_slug: modelSlug || body.model_slug || null,
      model_name: modelName || body.model_name || "Custom Plan / Model",
      sqft: sqft ? Number(sqft) : null,
      dimensions: dimensions || body.dimensions || null,
      options: typeof options === "string" ? JSON.parse(options) : options || [],
      pricing_inputs: typeof pricingInputs === "string" ? JSON.parse(pricingInputs) : pricingInputs || {},
      estimated_amount: estimatedAmount ? Number(estimatedAmount) : body.estimated_amount ? Number(body.estimated_amount) : null,
      timeline: timeline || body.timeline || null,
      requirements: requirements || body.notes || body.description || body.enquiry_details || null,
      source: source || body.source || "QUOTE_WIZARD",
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      // 1. Insert into quotations table
      const { data: quoteRecord, error: quoteError } = await supabaseAdmin
        .from("quotations")
        .insert(quoteData)
        .select()
        .single();

      if (quoteError) {
        console.error("Supabase quotations insert error:", quoteError);
        throw quoteError;
      }

      // 2. Also register as a lead so it appears in CRM / leads list
      try {
        const leadData = {
          name,
          email,
          phone,
          zip,
          location: zip ? `ZIP: ${zip}` : null,
          enquiry_details: `Quote Request: ${quoteData.model_name} (${quoteData.sqft ? `${quoteData.sqft} sq ft` : "Standard Sizing"})${quoteData.estimated_amount ? ` - Est: $${quoteData.estimated_amount.toLocaleString()}` : ""}${quoteData.requirements ? ` - Notes: ${quoteData.requirements}` : ""}`,
          source: quoteData.source,
          status: "NEW",
          notes: `Generated from Online Quote Wizard (Quote ID: ${quoteRecord?.id || "N/A"})`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabaseAdmin.from("leads").insert(leadData);
      } catch (leadErr) {
        console.warn("Could not mirror quotation into leads table:", leadErr);
      }

      return NextResponse.json({
        success: true,
        data: quoteRecord,
        message: "Your quote request has been submitted successfully! An architectural specialist will review and follow up.",
      });
    }

    // Offline fallback for development without Supabase
    return NextResponse.json({
      success: true,
      data: { id: `offline-${Date.now()}`, ...quoteData },
      message: "Quote recorded successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Public quote submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || "Failed to submit quote request. Please try again or contact us directly.",
          code: "QUOTE_SUBMISSION_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
