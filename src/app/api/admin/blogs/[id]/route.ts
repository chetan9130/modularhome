import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getCustomBlogByIdOrSlug, saveCustomBlog, deleteCustomBlog } from "@/lib/blogStore";
import { RESOURCE_ARTICLES } from "@/data/resources";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    // 1. Check local store
    const localBlog = getCustomBlogByIdOrSlug(id);
    if (localBlog) {
      return NextResponse.json({ success: true, data: localBlog });
    }

    // 2. Check Supabase
    if (isSupabaseConfigured()) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const orFilter = isUuid ? `id.eq.${id},slug.eq.${id}` : `slug.eq.${id}`;

      const { data: blog, error } = await supabaseAdmin
        .from("blogs")
        .select("*")
        .or(orFilter)
        .maybeSingle();

      if (!error && blog) {
        return NextResponse.json({ success: true, data: blog });
      }
    }

    // 3. Check static RESOURCE_ARTICLES
    const staticRes = RESOURCE_ARTICLES.find(
      (r) => r.id === id || r.slug.toLowerCase() === id.toLowerCase()
    );
    if (staticRes) {
      return NextResponse.json({
        success: true,
        data: {
          id: staticRes.id,
          slug: staticRes.slug,
          title: staticRes.title,
          category: staticRes.category,
          readTime: staticRes.readTime,
          excerpt: staticRes.excerpt,
          content: Array.isArray(staticRes.content) ? staticRes.content.join("\n\n") : staticRes.content,
          featuredImage: staticRes.image,
          featured_image: staticRes.image,
          author: staticRes.author || "ModularHome Engineering Team",
          status: "PUBLISHED",
          publishedAt: staticRes.date,
          tags: staticRes.tags || [],
          keyTakeaways: staticRes.keyTakeaways || [],
        },
      });
    }

    return NextResponse.json(
      { success: false, error: { message: "Blog article not found.", code: "NOT_FOUND" } },
      { status: 404 }
    );
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
      : id.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    // 1. Update in local store
    const savedLocal = saveCustomBlog({
      id,
      slug: cleanSlug,
      title: body.title || "Untitled Article",
      excerpt: body.excerpt,
      content: body.content,
      featuredImage: body.featuredImage || body.featured_image,
      featured_image: body.featuredImage || body.featured_image,
      author: body.author || body.author_name,
      publishedAt: body.publishedAt || body.published_at,
      status: body.status || "PUBLISHED",
      categories: Array.isArray(body.categories) ? body.categories : (body.category ? [body.category] : []),
      category: body.category || (Array.isArray(body.categories) && body.categories.length > 0 ? body.categories[0] : "Building Guides"),
      tags: Array.isArray(body.tags) ? body.tags : [],
      embeddedVideoUrl: body.embeddedVideoUrl || body.embedded_video_url,
      seoTitle: body.seoTitle || body.seo_title,
      metaDescription: body.metaDescription || body.meta_description,
      imageAltText: body.imageAltText || body.image_alt_text,
      canonicalUrl: body.canonicalUrl || body.canonical_url,
      keyTakeaways: body.keyTakeaways || body.key_takeaways,
    });

    // 2. Also update in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
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

        await supabaseAdmin
          .from("blogs")
          .update(updates)
          .or(`id.eq.${id},slug.eq.${cleanSlug}`);
      } catch (dbErr) {
        console.warn("Supabase update warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: savedLocal,
      message: "Blog article updated successfully.",
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

    // 1. Delete from local store
    deleteCustomBlog(id);

    // 2. Delete from Supabase
    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const orFilter = isUuid ? `id.eq.${id},slug.eq.${id}` : `slug.eq.${id}`;
        await supabaseAdmin.from("blogs").delete().or(orFilter);
      } catch (dbErr) {
        console.warn("Supabase delete warning:", dbErr);
      }
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
