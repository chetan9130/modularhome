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

    const { data: quotation, error } = await supabaseAdmin
      .from("quotations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { success: false, error: { message: "Quotation not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: quotation });
  } catch (error: any) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch quotation.", code: "DB_ERROR" } },
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
    if (body.estimatedAmount !== undefined) updatePayload.estimated_amount = Number(body.estimatedAmount);
    if (body.estimated_amount !== undefined) updatePayload.estimated_amount = Number(body.estimated_amount);
    if (body.requirements !== undefined) updatePayload.requirements = body.requirements;
    if (body.internalNotes !== undefined) updatePayload.internal_notes = body.internalNotes;
    if (body.internal_notes !== undefined) updatePayload.internal_notes = body.internal_notes;
    if (body.assignedTo !== undefined) updatePayload.assigned_to = body.assignedTo;
    if (body.followUpDate !== undefined) updatePayload.follow_up_date = body.followUpDate;
    if (body.quoteHistory !== undefined) updatePayload.quote_history = body.quoteHistory;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("quotations")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Quotation status updated.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Quotation updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update quotation.", code: "UPDATE_ERROR" } },
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
        .from("quotations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Quotation deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete quotation.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
