import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isPublishedParam = searchParams.get("isPublished");

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    let query = supabaseAdmin
      .from("products")
      .select("*, product_collections(collection_id)")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (category && category !== "ALL") {
      query = query.eq("category", category);
    }
    if (isPublishedParam !== null && isPublishedParam !== undefined && isPublishedParam !== "") {
      query = query.eq("is_published", isPublishedParam === "true");
    }

    const { data: products, error } = await query;
    if (error) throw error;

    const formattedProducts = (products || []).map((p: any) => ({
      ...p,
      collectionIds: p.product_collections ? p.product_collections.map((pc: any) => pc.collection_id) : [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts,
    });
  } catch (error: any) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch products.", code: "DB_ERROR" } },
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
      tagline,
      description,
      shortDescription,
      category,
      series,
      architecturalStyle,
      sqft,
      bedrooms,
      bathrooms,
      stories,
      startingPrice,
      dimensions,
      frameType,
      roofPitch,
      windRating,
      snowLoad,
      warranty,
      primaryImage,
      gallery,
      floorPlanImage,
      videoUrl,
      features,
      specs,
      customizableOptions,
      isPublished,
      isFeatured,
      displayOrder,
      seoTitle,
      metaDescription,
      imageAltText,
      canonicalUrl,
      collectionIds,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: { message: "Product name and slug are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const parseJson = (val: any, fallback: any) => {
      if (val === undefined || val === null) return fallback;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      }
      return val;
    };

    const newProduct = {
      name,
      slug: cleanSlug,
      tagline: tagline || null,
      description: description || null,
      short_description: shortDescription || tagline || null,
      category: category || "Residential",
      series: series || null,
      architectural_style: architecturalStyle || "Modern Architectural",
      sqft: Number(sqft) || 1000,
      bedrooms: Number(bedrooms) || 2,
      bathrooms: Number(bathrooms) || 2,
      stories: Number(stories) || 1,
      starting_price: Number(startingPrice) || 50000,
      dimensions: dimensions || null,
      frame_type: frameType || null,
      roof_pitch: roofPitch || null,
      wind_rating: windRating || null,
      snow_load: snowLoad || null,
      warranty: warranty || "10-Year Structural",
      primary_image:
        primaryImage ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      gallery: parseJson(gallery, []),
      floor_plan_image: floorPlanImage || null,
      video_url: videoUrl || null,
      features: parseJson(features, []),
      specs: parseJson(specs, []),
      customizable_options: parseJson(customizableOptions, []),
      is_published: isPublished !== undefined ? isPublished : true,
      is_featured: isFeatured !== undefined ? isFeatured : false,
      display_order: Number(displayOrder) || 0,
      seo_title: seoTitle || `${name} | ModularHome.com`,
      meta_description: metaDescription || description || null,
      image_alt_text: imageAltText || name,
      canonical_url: canonicalUrl || null,
    };

    if (isSupabaseConfigured()) {
      const { data: createdProduct, error } = await supabaseAdmin
        .from("products")
        .insert(newProduct)
        .select()
        .single();

      if (error) throw error;

      if (Array.isArray(collectionIds) && collectionIds.length > 0) {
        const mappings = collectionIds.map((cid: string) => ({
          product_id: createdProduct.id,
          collection_id: cid,
        }));
        await supabaseAdmin.from("product_collections").insert(mappings);
      }

      return NextResponse.json({
        success: true,
        data: createdProduct,
        message: "Product created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-product-id", ...newProduct },
      message: "Product created successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create product.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
