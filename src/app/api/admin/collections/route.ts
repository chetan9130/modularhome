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
      .from("collections")
      .select(`
        *,
        product_collections (
          product_id
        )
      `)
      .order("display_order", { ascending: true });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data: collections, error } = await query;

    if (error) throw error;

    const formatted = (collections || []).map((col: any) => {
      const pIds = col.product_collections ? col.product_collections.map((pc: any) => pc.product_id) : [];
      return {
        ...col,
        productIds: pIds,
        productCount: pIds.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching admin collections:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch collections.", code: "DB_ERROR" } },
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
      name,
      slug,
      description,
      tagline,
      bannerImage,
      image,
      displayOrder,
      isFeatured,
      status,
      seoTitle,
      metaDescription,
      imageAltText,
      productIds,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: { message: "Collection name and slug are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const newCollection = {
      name,
      slug: cleanSlug,
      description: description || null,
      tagline: tagline || null,
      banner_image: bannerImage || null,
      image:
        image ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      display_order: Number(displayOrder) || 0,
      is_featured: Boolean(isFeatured),
      status: status || "PUBLISHED",
      seo_title: seoTitle || `${name} | ModularHome.com Collection`,
      meta_description: metaDescription || description || null,
      image_alt_text: imageAltText || name,
    };

    if (isSupabaseConfigured()) {
      const { data: col, error } = await supabaseAdmin
        .from("collections")
        .insert(newCollection)
        .select()
        .single();

      if (error) throw error;

      if (Array.isArray(productIds) && productIds.length > 0) {
        const mappings = productIds.map((pId) => ({
          collection_id: col.id,
          product_id: pId,
        }));
        await supabaseAdmin.from("product_collections").insert(mappings);
      }

      return NextResponse.json({
        success: true,
        data: col,
        message: "Collection created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-id", ...newCollection },
      message: "Collection created successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create collection.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
