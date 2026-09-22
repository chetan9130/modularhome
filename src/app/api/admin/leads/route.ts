import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { readLeadsFromStore, saveLead } from "@/lib/leadsStore";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let dbLeads: any[] = [];

    if (isSupabaseConfigured()) {
      try {
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

        const { data, error } = await query;
        if (!error && data) {
          dbLeads = data;
        }
      } catch (dbErr) {
        console.warn("Supabase fetch leads warning:", dbErr);
      }
    }

    // Merge with local persistent store
    const localLeads = readLeadsFromStore();
    const existingEmailsOrIds = new Set(
      dbLeads.map((l) => `${l.email || ""}_${l.created_at || ""}`)
    );
    const merged: any[] = [...dbLeads];

    for (const ll of localLeads) {
      const key = `${ll.email || ""}_${ll.created_at || ""}`;
      if (!existingEmailsOrIds.has(key) && !dbLeads.some((d) => d.id === ll.id)) {
        if (!status || status === "ALL" || ll.status === status) {
          if (!source || source === "ALL" || ll.source === source) {
            merged.push(ll);
            existingEmailsOrIds.add(key);
          }
        }
      }
    }

    // Apply search filter if present
    let filtered = merged;
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.name?.toLowerCase().includes(search) ||
          l.email?.toLowerCase().includes(search) ||
          l.phone?.toLowerCase().includes(search) ||
          l.location?.toLowerCase().includes(search) ||
          l.zip?.toLowerCase().includes(search) ||
          l.enquiry_details?.toLowerCase().includes(search)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return NextResponse.json({
      success: true,
      data: filtered,
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
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { name, email, phone, location, zip, enquiryDetails, source, notes, status } = body;

    const leadName = (name || body.fullName || body.customerName || "").trim();
    const leadEmail = (email || body.customerEmail || "").toLowerCase().trim();

    if (!leadName || !leadEmail) {
      return NextResponse.json(
        { success: false, error: { message: "Name and email are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const leadData = {
      name: leadName,
      email: leadEmail,
      phone: phone || null,
      location: location || (zip ? `ZIP: ${zip}` : null),
      zip: zip || null,
      enquiry_details: enquiryDetails || body.enquiry_details || null,
      source: source || "ADMIN_MANUAL",
      status: status || "NEW",
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Save to local store
    const localSaved = saveLead(leadData);

    // 2. Save to Supabase if configured
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
            message: "Lead inquiry registered successfully.",
          });
        }
      } catch (sbErr) {
        console.warn("Supabase lead manual insert warning:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: localSaved,
      message: "Lead inquiry registered successfully.",
    });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to record lead inquiry.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
