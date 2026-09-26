import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

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
      .order("title", { ascending: true });

    if (status && status !== "ALL") {
      if (status === "PUBLISHED") {
        query = query.eq("published", true);
      } else if (status === "DRAFT") {
        query = query.eq("published", false);
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`title.ilike.%${s}%,handle.ilike.%${s}%`);
    }

    const { data: collections, error } = await query;

    if (error) throw error;

    const formatted = (collections || []).map((col: any) => {
      const pIds = col.product_collections ? col.product_collections.map((pc: any) => pc.product_id) : [];
      const title = col.title || col.name || "";
      const handle = col.handle || col.slug || "";
      return {
        id: col.id,
        name: title,
        title: title,
        slug: handle,
        handle: handle,
        description: col.description_html || col.description || "",
        description_html: col.description_html || col.description || "",
        seo_title: col.seo_title,
        seo_description: col.seo_description,
        source_id: col.source_id,
        published: col.published !== false,
        status: col.published !== false ? "PUBLISHED" : "DRAFT",
        is_featured: false,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        productIds: pIds,
        productCount: pIds.length,
        created_at: col.created_at,
        updated_at: col.updated_at,
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
    const name = body.name || body.title;
    const slug = body.slug || body.handle;
    const description = body.description || body.description_html;
    const seoTitle = body.seoTitle || body.seo_title;
    const seoDescription = body.metaDescription || body.seo_description || body.seoDescription;
    const published = body.published !== undefined ? Boolean(body.published) : body.status !== "DRAFT";
    const sourceId = body.source_id || body.sourceId || null;
    const productIds = body.productIds;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: { message: "Collection name/title and slug/handle are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const newCollection = {
      handle: cleanSlug,
      title: name,
      description_html: description || null,
      seo_title: seoTitle || `${name} | ModularHome`,
      seo_description: seoDescription || (description ? description.replace(/<[^>]*>?/gm, "").slice(0, 160) : null),
      source_id: sourceId,
      published,
      updated_at: new Date().toISOString(),
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
        data: {
          ...col,
          name: col.title,
          slug: col.handle,
          status: col.published ? "PUBLISHED" : "DRAFT",
          productIds: productIds || [],
          productCount: (productIds || []).length,
        },
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
