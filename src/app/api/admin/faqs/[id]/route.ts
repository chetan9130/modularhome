import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.question !== undefined) updates.question = body.question;
    if (body.answer !== undefined) updates.answer = body.answer;
    if (body.category !== undefined) updates.category = body.category;
    if (body.pageSlug !== undefined) updates.page_slug = body.pageSlug;
    if (body.status !== undefined) updates.status = body.status;
    if (body.displayOrder !== undefined) updates.display_order = Number(body.displayOrder);

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("faqs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await logAdminActivity(
        authResult,
        "FAQ_UPDATED",
        "faqs",
        id,
        `Updated FAQ: "${data?.question?.slice(0, 40)}..."`
      );

      return NextResponse.json({
        success: true,
        data,
        message: "FAQ updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updates },
      message: "FAQ updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update FAQ.", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    if (isSupabaseConfigured()) {
      await supabaseAdmin.from("faqs").delete().eq("id", id);
    }

    await logAdminActivity(
      authResult,
      "FAQ_DELETED",
      "faqs",
      id,
      `Deleted FAQ ID: ${id}`
    );

    return NextResponse.json({
      success: true,
      message: "FAQ deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete FAQ.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
