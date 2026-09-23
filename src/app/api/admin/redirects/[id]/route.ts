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

    const updates: Record<string, any> = {};

    if (body.sourcePath !== undefined) {
      updates.source_path = body.sourcePath.startsWith("/") ? body.sourcePath : `/${body.sourcePath}`;
    }
    if (body.targetPath !== undefined) {
      updates.target_path = body.targetPath.startsWith("/") || body.targetPath.startsWith("http")
        ? body.targetPath
        : `/${body.targetPath}`;
    }
    if (body.statusCode !== undefined) updates.status_code = Number(body.statusCode);
    if (body.isActive !== undefined) updates.is_active = Boolean(body.isActive);
    if (body.notes !== undefined) updates.notes = body.notes;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("redirects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await logAdminActivity(
        authResult,
        "REDIRECT_UPDATED",
        "redirects",
        id,
        `Updated redirect: ${data?.source_path} -> ${data?.target_path}`
      );

      return NextResponse.json({
        success: true,
        data,
        message: "Redirect rule updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updates },
      message: "Redirect updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating redirect:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update redirect.", code: "UPDATE_ERROR" } },
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
      await supabaseAdmin.from("redirects").delete().eq("id", id);
    }

    await logAdminActivity(
      authResult,
      "REDIRECT_DELETED",
      "redirects",
      id,
      `Deleted redirect rule ID: ${id}`
    );

    return NextResponse.json({
      success: true,
      message: "Redirect deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting redirect:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete redirect.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
