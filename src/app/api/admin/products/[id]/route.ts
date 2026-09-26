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

    const { data: p, error } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*), product_media(*), product_collections(collection_id)")
      .or(`id.eq.${id},handle.eq.${id}`)
      .single();

    if (error || !p) {
      return NextResponse.json(
        { success: false, error: { message: "Product not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const primaryImg =
      p.product_media && Array.isArray(p.product_media) && p.product_media.length > 0
        ? p.product_media[0].source_url
        : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

    const gallery =
      p.product_media && Array.isArray(p.product_media) && p.product_media.length > 0
        ? p.product_media.map((m: any) => m.source_url)
        : [primaryImg];

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

    const formatted = {
      id: p.id,
      _id: p.id,
      name: p.title || p.name || "",
      title: p.title || p.name || "",
      slug: p.handle || p.slug || "",
      handle: p.handle || p.slug || "",
      tagline: `Engineered ${p.title || "Modular Home"}`,
      description: p.description_html || p.description || "",
      description_html: p.description_html || p.description || "",
      shortDescription: p.description_html ? p.description_html.replace(/<[^>]*>?/gm, "").slice(0, 180) : "",
      category: p.product_type || p.category || "Modular Homes",
      product_type: p.product_type || p.category || "Modular Homes",
      vendor: p.vendor || "ModularHome",
      series: "Essential Series",
      architecturalStyle: "Modern Minimalist",
      sqft: 800,
      bedrooms: 2,
      bathrooms: 1,
      stories: 1,
      startingPrice,
      dimensions: "24' x 36'",
      frameType: "100% Commercial-Grade Galvanized Light Gauge Steel",
      roofPitch: "4:12 Pitch",
      windRating: "Up to 150 MPH",
      snowLoad: "50 PSF",
      warranty: "50-Year Structural Steel Frame Warranty",
      primaryImage: primaryImg,
      gallery,
      isPublished: p.status !== "draft" && p.status !== "archived",
      status: p.status || "active",
      seoTitle: p.seo_title || `${p.title} | ModularHome`,
      metaDescription: p.seo_description || (p.description_html ? p.description_html.replace(/<[^>]*>?/gm, "").slice(0, 160) : ""),
      collectionIds,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch product.", code: "DB_ERROR" } },
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

    const rawSlug = body.slug || body.handle;
    const cleanSlug = rawSlug
      ? rawSlug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-")
      : undefined;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined || body.title !== undefined) {
      updatePayload.title = body.name || body.title;
    }
    if (cleanSlug !== undefined) {
      updatePayload.handle = cleanSlug;
    }
    if (body.description !== undefined || body.description_html !== undefined) {
      updatePayload.description_html = body.description || body.description_html;
    }
    if (body.category !== undefined || body.product_type !== undefined) {
      updatePayload.product_type = body.category || body.product_type;
    }
    if (body.vendor !== undefined) {
      updatePayload.vendor = body.vendor;
    }
    if (body.isPublished !== undefined) {
      updatePayload.status = body.isPublished ? "active" : "draft";
    } else if (body.status !== undefined) {
      updatePayload.status = body.status;
    }
    if (body.seoTitle !== undefined || body.seo_title !== undefined) {
      updatePayload.seo_title = body.seoTitle || body.seo_title;
    }
    if (body.metaDescription !== undefined || body.seo_description !== undefined) {
      updatePayload.seo_description = body.metaDescription || body.seo_description;
    }

    if (isSupabaseConfigured()) {
      const { data: updatedProduct, error } = await supabaseAdmin
        .from("products")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update collections junction
      if (Array.isArray(body.collectionIds)) {
        await supabaseAdmin.from("product_collections").delete().eq("product_id", id);
        if (body.collectionIds.length > 0) {
          const mappings = body.collectionIds.map((cid: string) => ({
            product_id: id,
            collection_id: cid,
          }));
          await supabaseAdmin.from("product_collections").insert(mappings);
        }
      }

      // Update primary image if passed
      if (body.primaryImage) {
        const { data: existingMedia } = await supabaseAdmin
          .from("product_media")
          .select("id")
          .eq("product_id", id)
          .eq("position", 1)
          .maybeSingle();

        if (existingMedia) {
          await supabaseAdmin
            .from("product_media")
            .update({ source_url: body.primaryImage })
            .eq("id", existingMedia.id);
        } else {
          await supabaseAdmin.from("product_media").insert({
            product_id: id,
            source_url: body.primaryImage,
            position: 1,
          });
        }
      }

      // Update starting price if passed
      if (body.startingPrice) {
        const { data: existingVar } = await supabaseAdmin
          .from("product_variants")
          .select("id")
          .eq("product_id", id)
          .maybeSingle();

        if (existingVar) {
          await supabaseAdmin
            .from("product_variants")
            .update({ price: Number(body.startingPrice) })
            .eq("id", existingVar.id);
        } else {
          await supabaseAdmin.from("product_variants").insert({
            product_id: id,
            title: "Standard",
            price: Number(body.startingPrice),
            position: 1,
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          ...updatedProduct,
          name: updatedProduct.title,
          slug: updatedProduct.handle,
          category: updatedProduct.product_type,
          isPublished: updatedProduct.status === "active",
          collectionIds: body.collectionIds || [],
        },
        message: "Home model updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Home model updated successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update home model.", code: "UPDATE_ERROR" } },
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
      const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Home model deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete home model.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
