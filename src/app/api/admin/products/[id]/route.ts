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

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*, product_collections(collection_id)")
      .eq("id", id)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: { message: "Product not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const formatted = {
      ...product,
      collectionIds: product.product_collections ? product.product_collections.map((pc: any) => pc.collection_id) : [],
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

    const parseJson = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.slug !== undefined) {
      updatePayload.slug = body.slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
    }
    if (body.tagline !== undefined) updatePayload.tagline = body.tagline;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.shortDescription !== undefined) updatePayload.short_description = body.shortDescription;
    if (body.short_description !== undefined) updatePayload.short_description = body.short_description;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.series !== undefined) updatePayload.series = body.series;
    if (body.architecturalStyle !== undefined) updatePayload.architectural_style = body.architecturalStyle;
    if (body.architectural_style !== undefined) updatePayload.architectural_style = body.architectural_style;
    if (body.sqft !== undefined) updatePayload.sqft = Number(body.sqft);
    if (body.bedrooms !== undefined) updatePayload.bedrooms = Number(body.bedrooms);
    if (body.bathrooms !== undefined) updatePayload.bathrooms = Number(body.bathrooms);
    if (body.stories !== undefined) updatePayload.stories = Number(body.stories);
    if (body.startingPrice !== undefined) updatePayload.starting_price = Number(body.startingPrice);
    if (body.starting_price !== undefined) updatePayload.starting_price = Number(body.starting_price);
    if (body.dimensions !== undefined) updatePayload.dimensions = body.dimensions;
    if (body.frameType !== undefined) updatePayload.frame_type = body.frameType;
    if (body.frame_type !== undefined) updatePayload.frame_type = body.frame_type;
    if (body.roofPitch !== undefined) updatePayload.roof_pitch = body.roofPitch;
    if (body.roof_pitch !== undefined) updatePayload.roof_pitch = body.roof_pitch;
    if (body.windRating !== undefined) updatePayload.wind_rating = body.windRating;
    if (body.wind_rating !== undefined) updatePayload.wind_rating = body.wind_rating;
    if (body.snowLoad !== undefined) updatePayload.snow_load = body.snowLoad;
    if (body.snow_load !== undefined) updatePayload.snow_load = body.snow_load;
    if (body.warranty !== undefined) updatePayload.warranty = body.warranty;
    if (body.primaryImage !== undefined) updatePayload.primary_image = body.primaryImage;
    if (body.primary_image !== undefined) updatePayload.primary_image = body.primary_image;
    if (body.gallery !== undefined) updatePayload.gallery = parseJson(body.gallery);
    if (body.floorPlanImage !== undefined) updatePayload.floor_plan_image = body.floorPlanImage;
    if (body.floor_plan_image !== undefined) updatePayload.floor_plan_image = body.floor_plan_image;
    if (body.videoUrl !== undefined) updatePayload.video_url = body.videoUrl;
    if (body.video_url !== undefined) updatePayload.video_url = body.video_url;
    if (body.features !== undefined) updatePayload.features = parseJson(body.features);
    if (body.specs !== undefined) updatePayload.specs = parseJson(body.specs);
    if (body.customizableOptions !== undefined) updatePayload.customizable_options = parseJson(body.customizableOptions);
    if (body.customizable_options !== undefined) updatePayload.customizable_options = parseJson(body.customizable_options);
    if (body.isPublished !== undefined) updatePayload.is_published = body.isPublished;
    if (body.is_published !== undefined) updatePayload.is_published = body.is_published;
    if (body.isFeatured !== undefined) updatePayload.is_featured = body.isFeatured;
    if (body.is_featured !== undefined) updatePayload.is_featured = body.is_featured;
    if (body.displayOrder !== undefined) updatePayload.display_order = Number(body.displayOrder);
    if (body.display_order !== undefined) updatePayload.display_order = Number(body.display_order);
    if (body.seoTitle !== undefined) updatePayload.seo_title = body.seoTitle;
    if (body.seo_title !== undefined) updatePayload.seo_title = body.seo_title;
    if (body.metaDescription !== undefined) updatePayload.meta_description = body.metaDescription;
    if (body.meta_description !== undefined) updatePayload.meta_description = body.meta_description;
    if (body.imageAltText !== undefined) updatePayload.image_alt_text = body.imageAltText;
    if (body.image_alt_text !== undefined) updatePayload.image_alt_text = body.image_alt_text;
    if (body.canonicalUrl !== undefined) updatePayload.canonical_url = body.canonicalUrl;
    if (body.canonical_url !== undefined) updatePayload.canonical_url = body.canonical_url;

    if (isSupabaseConfigured()) {
      const { data: updatedProduct, error } = await supabaseAdmin
        .from("products")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

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

      return NextResponse.json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Product updated successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update product.", code: "UPDATE_ERROR" } },
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
      const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete product.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
