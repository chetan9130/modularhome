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

    if (body.customerName !== undefined) updates.customer_name = body.customerName;
    if (body.location !== undefined) updates.location = body.location;
    if (body.rating !== undefined) updates.rating = Number(body.rating);
    if (body.reviewText !== undefined) updates.review_text = body.reviewText;
    if (body.projectTitle !== undefined) updates.project_title = body.projectTitle;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.status !== undefined) updates.status = body.status;
    if (body.isFeatured !== undefined) updates.is_featured = Boolean(body.isFeatured);
    if (body.displayOrder !== undefined) updates.display_order = Number(body.displayOrder);

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await logAdminActivity(
        authResult,
        "REVIEW_UPDATED",
        "reviews",
        id,
        `Updated testimonial for ${data?.customer_name || id}`
      );

      return NextResponse.json({
        success: true,
        data,
        message: "Review updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updates },
      message: "Review updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update review.", code: "UPDATE_ERROR" } },
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
      await supabaseAdmin.from("reviews").delete().eq("id", id);
    }

    await logAdminActivity(
      authResult,
      "REVIEW_DELETED",
      "reviews",
      id,
      `Deleted review ${id}`
    );

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete review.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
