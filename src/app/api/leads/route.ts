import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { saveLead } from "@/lib/leadsStore";
import { getCustomerSession } from "@/lib/customerAuth";
import { getCustomerByEmail } from "@/lib/customerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      location,
      zip,
      enquiryDetails,
      source,
      notes,
    } = body;

    const leadName = (name || body.fullName || body.customerName || "Website Visitor").trim();
    const leadEmail = (email || body.customerEmail || "").toLowerCase().trim();
    const leadPhone = phone || body.customerPhone || null;
    const leadZip = zip || body.customerZip || null;
    const leadLocation = location || (leadZip ? `ZIP: ${leadZip}` : null);
    const leadEnquiry = enquiryDetails || body.message || body.requirements || body.details || null;
    const leadSource = source || body.leadSource || "WEBSITE";

    if (!leadEmail) {
      return NextResponse.json(
        { success: false, error: { message: "Email is required to submit an inquiry.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    // Check if customer session exists
    let customerNote = "";
    try {
      const session = await getCustomerSession();
      if (session) {
        customerNote = `[Registered Customer: ${session.name} (${session.id})] `;
      } else {
        const existing = await getCustomerByEmail(leadEmail);
        if (existing) {
          customerNote = `[Existing Customer: ${existing.name} (${existing.id})] `;
        }
      }
    } catch {}

    const leadData = {
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      location: leadLocation,
      zip: leadZip,
      enquiry_details: leadEnquiry,
      source: leadSource,
      status: "NEW" as const,
      notes: customerNote ? `${customerNote}${notes || ""}`.trim() : notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Immediately save to persistent local store (ensures 100% data capture)
    const localLead = saveLead(leadData);

    // 2. Also save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .insert(leadData)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            data,
            message: "Your inquiry has been received. Our team will contact you shortly.",
          });
        }
      } catch (sbErr) {
        console.warn("Supabase lead insert warning, captured locally:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: localLead,
      message: "Your inquiry has been received. Our team will contact you shortly.",
    });
  } catch (error: any) {
    console.error("Public lead submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || "Failed to submit inquiry. Please try again.",
          code: "LEAD_SUBMISSION_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
