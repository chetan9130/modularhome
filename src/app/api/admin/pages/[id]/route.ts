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

    const { data: page, error } = await supabaseAdmin
      .from("pages")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !page) {
      return NextResponse.json(
        { success: false, error: { message: "Page not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error("Error fetching page details:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch page.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

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

    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.slug !== undefined) {
      updatePayload.slug = body.slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
    }
    if (body.subtitle !== undefined) updatePayload.subtitle = body.subtitle;
    if (body.content !== undefined) updatePayload.content = body.content;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.featuredImage !== undefined) updatePayload.featured_image = body.featuredImage;
    if (body.featured_image !== undefined) updatePayload.featured_image = body.featured_image;
    if (body.seoTitle !== undefined) updatePayload.seo_title = body.seoTitle;
    if (body.seo_title !== undefined) updatePayload.seo_title = body.seo_title;
    if (body.metaDescription !== undefined) updatePayload.meta_description = body.metaDescription;
    if (body.meta_description !== undefined) updatePayload.meta_description = body.meta_description;
    if (body.canonicalUrl !== undefined) updatePayload.canonical_url = body.canonicalUrl;
    if (body.canonical_url !== undefined) updatePayload.canonical_url = body.canonical_url;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("pages")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Page updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Page updated successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update page.", code: "UPDATE_ERROR" } },
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
        .from("pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete page.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
