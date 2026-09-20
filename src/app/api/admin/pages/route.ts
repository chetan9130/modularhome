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
      .from("pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data: pages, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: pages || [],
    });
  } catch (error: any) {
    console.error("Error fetching admin pages:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch pages.", code: "DB_ERROR" } },
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
      subtitle,
      content,
      status,
      featuredImage,
      featured_image,
      seoTitle,
      seo_title,
      metaDescription,
      meta_description,
      canonicalUrl,
      canonical_url,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: { message: "Page title and slug are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const newPage = {
      title,
      slug: cleanSlug,
      subtitle: subtitle || null,
      content: content || null,
      status: status || "PUBLISHED",
      featured_image: featuredImage || featured_image || null,
      seo_title: seoTitle || seo_title || title,
      meta_description: metaDescription || meta_description || subtitle || null,
      canonical_url: canonicalUrl || canonical_url || null,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("pages")
        .insert(newPage)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Page created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-page-id", ...newPage },
      message: "Page created successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create page.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
