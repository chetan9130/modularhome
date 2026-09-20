import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function PUT(
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

    if (body.type !== undefined) updatePayload.type = body.type.toUpperCase();
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.subtitle !== undefined) updatePayload.subtitle = body.subtitle;
    if (body.content !== undefined) {
      updatePayload.content = typeof body.content === "object" ? JSON.stringify(body.content) : body.content;
    }
    if (body.order !== undefined) updatePayload.display_order = Number(body.order);
    if (body.displayOrder !== undefined) updatePayload.display_order = Number(body.displayOrder);
    if (body.display_order !== undefined) updatePayload.display_order = Number(body.display_order);
    if (body.isVisible !== undefined) updatePayload.is_visible = !!body.isVisible;
    if (body.is_visible !== undefined) updatePayload.is_visible = !!body.is_visible;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("page_sections")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Section updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Section updated successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update section.", code: "UPDATE_ERROR" } },
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
        .from("page_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Section deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete section.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
