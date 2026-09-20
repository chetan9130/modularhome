import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    let query = supabaseAdmin
      .from("blogs")
      .select("*")
      .order("published_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data: blogs, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: blogs || [],
    });
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch blogs.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      publishedAt,
      status,
      categories,
      tags,
      embeddedVideoUrl,
      seoTitle,
      metaDescription,
      imageAltText,
      canonicalUrl,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: { message: "Title, slug, and content are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const newBlog = {
      title,
      slug: cleanSlug,
      excerpt: excerpt || null,
      content,
      featured_image:
        featuredImage ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      author: author || "ModularHome Editorial Team",
      published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      status: status || "PUBLISHED",
      categories: Array.isArray(categories) ? categories : [],
      tags: Array.isArray(tags) ? tags : [],
      embedded_video_url: embeddedVideoUrl || null,
      seo_title: seoTitle || `${title} | ModularHome.com`,
      meta_description: metaDescription || excerpt || null,
      image_alt_text: imageAltText || title,
      canonical_url: canonicalUrl || null,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("blogs")
        .insert(newBlog)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Blog created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-id", ...newBlog },
      message: "Blog created successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create blog.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
