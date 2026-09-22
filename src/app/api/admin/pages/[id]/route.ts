import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  saveCustomPage,
  deleteCustomPage,
  readPagesFromStore,
  getPageSections,
  isUuidString,
} from "@/lib/pageStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    let foundPage: any = null;

    if (isSupabaseConfigured() && isUuidString(id)) {
      try {
        const { data: page, error } = await supabaseAdmin
          .from("pages")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && page) {
          foundPage = page;
        }
      } catch {}
    }

    if (!foundPage) {
      const localPages = readPagesFromStore();
      const local = localPages.find((p) => p.id === id || p.slug === id);
      if (local) {
        foundPage = local;
      }
    }

    if (!foundPage) {
      return NextResponse.json(
        { success: false, error: { message: "Page not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Attach all associated sections
    const sections = getPageSections(foundPage.id || foundPage.slug || id);
    const result = {
      ...foundPage,
      sections,
      sectionCount: sections.length,
      _count: { sections: sections.length },
    };

    return NextResponse.json({ success: true, data: result });
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
      id,
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

    // 1. Save locally
    const savedLocal = saveCustomPage({
      id,
      title: body.title || "Custom Page",
      slug: body.slug || id,
      subtitle: body.subtitle,
      content: body.content,
      status: body.status,
      featuredImage: body.featuredImage || body.featured_image,
      seoTitle: body.seoTitle || body.seo_title,
      metaDescription: body.metaDescription || body.meta_description,
      canonicalUrl: body.canonicalUrl || body.canonical_url,
    });

    // 2. Save in Supabase if UUID
    if (isSupabaseConfigured() && isUuidString(id)) {
      try {
        const { data, error } = await supabaseAdmin
          .from("pages")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            data,
            message: "Page updated successfully.",
          });
        }
      } catch (sbErr) {
        console.warn("Supabase update warning, updated locally:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: savedLocal,
      message: "Page updated successfully.",
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

    // 1. Delete locally
    deleteCustomPage(id);

    // 2. Delete from Supabase if UUID
    if (isSupabaseConfigured() && isUuidString(id)) {
      try {
        await supabaseAdmin
          .from("pages")
          .delete()
          .eq("id", id);
      } catch (err) {}
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
