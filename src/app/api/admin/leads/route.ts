import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    let query = supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }
    if (source && source !== "ALL") {
      query = query.eq("source", source);
    }

    const { data: leads, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: leads || [],
    });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch leads.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, location, zip, enquiryDetails, source, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: { message: "Name and email are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const leadData = {
      name,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      location: location || null,
      zip: zip || null,
      enquiry_details: enquiryDetails || null,
      source: source || "WEBSITE",
      status: "NEW",
      notes: notes || null,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .insert(leadData)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Lead inquiry registered successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-lead-id", ...leadData },
      message: "Lead inquiry registered successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to record lead inquiry.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
