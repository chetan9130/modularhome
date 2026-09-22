import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { updateSection, deleteSection, isUuidString } from "@/lib/pageStore";

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

    // 1. Update in local store
    const localUpdated = updateSection(id, {
      type: body.type,
      title: body.title,
      subtitle: body.subtitle,
      content: body.content,
      displayOrder: body.order ?? body.displayOrder ?? body.display_order,
      isVisible: body.isVisible !== undefined ? body.isVisible : body.is_visible,
    });

    // 2. Update in Supabase if UUID
    if (isSupabaseConfigured() && isUuidString(id)) {
      try {
        const { data, error } = await supabaseAdmin
          .from("page_sections")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            data,
            message: "Section updated successfully.",
          });
        }
      } catch (sbErr) {
        console.warn("Supabase update section warning:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: localUpdated || { id, ...updatePayload },
      message: "Section updated successfully.",
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

    // 1. Delete from local store
    deleteSection(id);

    // 2. Delete from Supabase if UUID
    if (isSupabaseConfigured() && isUuidString(id)) {
      try {
        await supabaseAdmin
          .from("page_sections")
          .delete()
          .eq("id", id);
      } catch (sbErr) {
        console.warn("Supabase delete section warning:", sbErr);
      }
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
