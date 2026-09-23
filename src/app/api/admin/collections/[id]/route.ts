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
      return NextResponse.json(
        { success: false, error: { message: "Database not configured.", code: "NOT_CONFIGURED" } },
        { status: 503 }
      );
    }

    const { data: collection, error } = await supabaseAdmin
      .from("collections")
      .select(`
        *,
        product_collections (
          product_id
        )
      `)
      .eq("id", id)
      .single();

    if (error || !collection) {
      return NextResponse.json(
        { success: false, error: { message: "Collection not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const pIds = collection.product_collections
      ? collection.product_collections.map((pc: any) => pc.product_id)
      : [];

    const formatted = {
      ...collection,
      productIds: pIds,
      productCount: pIds.length,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch collection.", code: "DB_ERROR" } },
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
      : undefined;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name;
    if (cleanSlug !== undefined) updates.slug = cleanSlug;
    if (body.description !== undefined) updates.description = body.description;
    if (body.tagline !== undefined) updates.tagline = body.tagline;
    if (body.bannerImage !== undefined) updates.banner_image = body.bannerImage;
    if (body.image !== undefined) updates.image = body.image;
    if (body.displayOrder !== undefined) updates.display_order = Number(body.displayOrder);
    if (body.isFeatured !== undefined) updates.is_featured = Boolean(body.isFeatured);
    if (body.status !== undefined) updates.status = body.status;
    if (body.seoTitle !== undefined) updates.seo_title = body.seoTitle;
    if (body.metaDescription !== undefined) updates.meta_description = body.metaDescription;
    if (body.imageAltText !== undefined) updates.image_alt_text = body.imageAltText;

    if (isSupabaseConfigured()) {
      const { data: updated, error } = await supabaseAdmin
        .from("collections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (Array.isArray(body.productIds)) {
        await supabaseAdmin.from("product_collections").delete().eq("collection_id", id);
        if (body.productIds.length > 0) {
          const mappings = body.productIds.map((pId: string) => ({
            collection_id: id,
            product_id: pId,
          }));
          await supabaseAdmin.from("product_collections").insert(mappings);
        }
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Collection updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updates },
      message: "Collection updated successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update collection.", code: "UPDATE_ERROR" } },
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
      const { error } = await supabaseAdmin.from("collections").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete collection.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
