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
    const search = searchParams.get("search");

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    let query = supabaseAdmin
      .from("products")
      .select(`
        id,
        handle,
        title,
        description_html,
        vendor,
        product_type,
        status,
        seo_title,
        seo_description,
        source_id,
        published_at,
        created_at,
        updated_at,
        product_variants (
          price
        ),
        product_media (
          source_url,
          position
        ),
        product_collections (
          collection_id
        )
      `)
      .order("created_at", { ascending: false });

    if (category && category !== "ALL") {
      query = query.ilike("product_type", `%${category}%`);
    }

    if (isPublishedParam !== null && isPublishedParam !== undefined && isPublishedParam !== "") {
      if (isPublishedParam === "true") {
        query = query.or("status.eq.active,status.is.null");
      } else {
        query = query.eq("status", "draft");
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`title.ilike.%${s}%,handle.ilike.%${s}%,product_type.ilike.%${s}%`);
    }

    const { data: products, error } = await query;
    if (error) {
      console.error("Supabase products query error:", error);
      throw error;
    }

    const formattedProducts = (products || []).map((p: any) => {
      // Find position 1 media or first available
      let primaryImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80";
      if (p.product_media && Array.isArray(p.product_media) && p.product_media.length > 0) {
        const sortedMedia = [...p.product_media].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        primaryImg = sortedMedia[0].source_url || primaryImg;
      }

      let startingPrice = 89000;
      if (p.product_variants && Array.isArray(p.product_variants) && p.product_variants.length > 0) {
        const prices = p.product_variants
          .map((v: any) => Number(v.price))
          .filter((pr: number) => !isNaN(pr) && pr > 0);
        if (prices.length > 0) {
          startingPrice = Math.min(...prices);
        }
      }

      const collectionIds = p.product_collections
        ? p.product_collections.map((pc: any) => pc.collection_id)
        : [];

      return {
        id: p.id,
        _id: p.id,
        name: p.title || p.name || "",
        title: p.title || p.name || "",
        slug: p.handle || p.slug || "",
        handle: p.handle || p.slug || "",
        category: p.product_type || "Modular Homes",
        product_type: p.product_type || "Modular Homes",
        vendor: p.vendor || "ModularHome",
        description: p.description_html || "",
        description_html: p.description_html || "",
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        source_id: p.source_id,
        status: p.status || "active",
        isPublished: p.status !== "draft" && p.status !== "archived",
        primaryImage: primaryImg,
        image: primaryImg,
        startingPrice,
        sqft: 800,
        bedrooms: 2,
        bathrooms: 1,
        stories: 1,
        collectionIds,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      totalCount: formattedProducts.length,
    });
  } catch (error: any) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to fetch products.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const name = body.name || body.title;
    const rawSlug = body.slug || body.handle;

    if (!name || !rawSlug) {
      return NextResponse.json(
        { success: false, error: { message: "Product name/title and slug/handle are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = rawSlug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const newProduct = {
      handle: cleanSlug,
      title: name,
      description_html: body.description || body.description_html || null,
      vendor: body.vendor || "ModularHome",
      product_type: body.category || body.product_type || "Modular Homes",
      status: body.isPublished === false || body.status === "draft" ? "draft" : "active",
      seo_title: body.seoTitle || body.seo_title || `${name} | ModularHome`,
      seo_description: body.metaDescription || body.seo_description || (body.description ? body.description.replace(/<[^>]*>?/gm, "").slice(0, 160) : null),
      source_id: body.source_id || body.sourceId || null,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data: prod, error } = await supabaseAdmin
        .from("products")
        .insert(newProduct)
        .select()
        .single();

      if (error) throw error;

      // Insert primary media if provided
      if (body.primaryImage) {
        await supabaseAdmin.from("product_media").insert({
          product_id: prod.id,
          source_url: body.primaryImage,
          alt_text: name,
          position: 1,
        });
      }

      // Insert primary variant if price provided
      if (body.startingPrice) {
        await supabaseAdmin.from("product_variants").insert({
          product_id: prod.id,
          title: "Standard Package",
          price: Number(body.startingPrice) || 89000,
          position: 1,
        });
      }

      // Link collections
      if (Array.isArray(body.collectionIds) && body.collectionIds.length > 0) {
        const mappings = body.collectionIds.map((colId: string) => ({
          product_id: prod.id,
          collection_id: colId,
        }));
        await supabaseAdmin.from("product_collections").insert(mappings);
      }

      return NextResponse.json({
        success: true,
        data: {
          ...prod,
          name: prod.title,
          slug: prod.handle,
          category: prod.product_type,
          isPublished: prod.status === "active",
        },
        message: "Home model created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-id", ...newProduct },
      message: "Home model created successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create product model.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
