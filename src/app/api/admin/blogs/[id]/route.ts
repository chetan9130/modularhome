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
      return NextResponse.json(
        { success: false, error: { message: "Database not configured.", code: "NOT_CONFIGURED" } },
        { status: 503 }
      );
    }

    const { data: blog, error } = await supabaseAdmin
      .from("blogs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, error: { message: "Blog article not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    console.error("Error fetching blog details:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch blog.", code: "DB_ERROR" } },
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

    const cleanSlug = body.slug
      ? body.slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-")
      : undefined;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (cleanSlug !== undefined) updates.slug = cleanSlug;
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
    if (body.content !== undefined) updates.content = body.content;
    if (body.featuredImage !== undefined) updates.featured_image = body.featuredImage;
    if (body.author !== undefined) updates.author = body.author;
    if (body.publishedAt !== undefined) updates.published_at = new Date(body.publishedAt).toISOString();
    if (body.status !== undefined) updates.status = body.status;
    if (body.categories !== undefined) updates.categories = Array.isArray(body.categories) ? body.categories : [];
    if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.embeddedVideoUrl !== undefined) updates.embedded_video_url = body.embeddedVideoUrl;
    if (body.seoTitle !== undefined) updates.seo_title = body.seoTitle;
    if (body.metaDescription !== undefined) updates.meta_description = body.metaDescription;
    if (body.imageAltText !== undefined) updates.image_alt_text = body.imageAltText;
    if (body.canonicalUrl !== undefined) updates.canonical_url = body.canonicalUrl;

    if (isSupabaseConfigured()) {
      const { data: updated, error } = await supabaseAdmin
        .from("blogs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Blog article updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updates },
      message: "Blog article updated successfully (offline).",
    });
  } catch (error: any) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update blog.", code: "UPDATE_ERROR" } },
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
      const { error } = await supabaseAdmin.from("blogs").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Blog article deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete blog.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
