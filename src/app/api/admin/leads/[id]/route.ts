import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { updateLead, deleteLead, readLeadsFromStore } from "@/lib/leadsStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    if (isSupabaseConfigured()) {
      try {
        const { data: lead, error } = await supabaseAdmin
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && lead) {
          return NextResponse.json({ success: true, data: lead });
        }
      } catch {}
    }

    const localLeads = readLeadsFromStore();
    const found = localLeads.find((l) => l.id === id);
    if (found) {
      return NextResponse.json({ success: true, data: found });
    }

    return NextResponse.json(
      { success: false, error: { message: "Lead not found.", code: "NOT_FOUND" } },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch lead.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.notes !== undefined) updatePayload.notes = body.notes;
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.location !== undefined) updatePayload.location = body.location;
    if (body.zip !== undefined) updatePayload.zip = body.zip;
    if (body.enquiryDetails !== undefined) updatePayload.enquiry_details = body.enquiryDetails;
    if (body.enquiry_details !== undefined) updatePayload.enquiry_details = body.enquiry_details;
    if (body.assignedTo !== undefined) updatePayload.assigned_to = body.assignedTo;
    if (body.followUpDate !== undefined) updatePayload.follow_up_date = body.followUpDate;
    if (body.leadHistory !== undefined) updatePayload.lead_history = body.leadHistory;

    // 1. Update in local store
    const localUpdated = updateLead(id, updatePayload);

    // 2. Update in Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            data,
            message: "Lead status updated.",
          });
        }
      } catch (sbErr) {
        console.warn("Supabase lead patch warning:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: localUpdated || { id, ...updatePayload },
      message: "Lead status updated.",
    });
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update lead.", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    // 1. Delete from local store
    deleteLead(id);

    // 2. Delete from Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin
          .from("leads")
          .delete()
          .eq("id", id);
      } catch (err) {}
    }

    return NextResponse.json({
      success: true,
      message: "Lead record deleted.",
    });
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete lead.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
