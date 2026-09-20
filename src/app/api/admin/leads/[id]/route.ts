import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !lead) {
      return NextResponse.json(
        { success: false, error: { message: "Lead not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
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

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Lead status updated.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Lead updated (offline fallback).",
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

    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin
        .from("leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
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
