import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_FLOOR_PLANS } from "@/data/floorPlans";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured()) {
      const found = INITIAL_FLOOR_PLANS.find((f) => f.id === id || f.slug === id);
      if (!found) {
        return NextResponse.json(
          { success: false, error: { message: "Floor plan not found.", code: "NOT_FOUND" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: found });
    }

    const { data: plan, error } = await supabaseAdmin
      .from("floor_plans")
      .select("*")
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (error || !plan) {
      const fallback = INITIAL_FLOOR_PLANS.find((f) => f.id === id || f.slug === id);
      if (fallback) {
        return NextResponse.json({ success: true, data: fallback });
      }
      return NextResponse.json(
        { success: false, error: { message: "Floor plan not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error: any) {
    console.error("Error fetching floor plan details:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch floor plan.", code: "DB_ERROR" } },
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

    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.slug !== undefined) {
      updatePayload.slug = body.slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
    }
    if (body.tagline !== undefined) updatePayload.tagline = body.tagline;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.price !== undefined) updatePayload.price = Number(body.price);
    if (body.salePrice !== undefined) updatePayload.sale_price = body.salePrice ? Number(body.salePrice) : null;
    if (body.sale_price !== undefined) updatePayload.sale_price = body.sale_price ? Number(body.sale_price) : null;
    if (body.previewImage !== undefined) updatePayload.preview_image = body.previewImage;
    if (body.preview_image !== undefined) updatePayload.preview_image = body.preview_image;
    if (body.gallery !== undefined) updatePayload.gallery = parseJson(body.gallery);
    if (body.filePath !== undefined) updatePayload.file_path = body.filePath;
    if (body.file_path !== undefined) updatePayload.file_path = body.file_path;
    if (body.fileFormat !== undefined) updatePayload.file_format = body.fileFormat;
    if (body.file_format !== undefined) updatePayload.file_format = body.file_format;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.bedrooms !== undefined) updatePayload.bedrooms = Number(body.bedrooms);
    if (body.bathrooms !== undefined) updatePayload.bathrooms = Number(body.bathrooms);
    if (body.squareFeet !== undefined) updatePayload.square_feet = Number(body.squareFeet);
    if (body.square_feet !== undefined) updatePayload.square_feet = Number(body.square_feet);
    if (body.dimensions !== undefined) updatePayload.dimensions = body.dimensions;
    if (body.stories !== undefined) updatePayload.stories = Number(body.stories);
    if (body.includedItems !== undefined) updatePayload.included_items = parseJson(body.includedItems);
    if (body.included_items !== undefined) updatePayload.included_items = parseJson(body.included_items);
    if (body.features !== undefined) updatePayload.features = parseJson(body.features);
    if (body.specs !== undefined) updatePayload.specs = parseJson(body.specs);
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.isFeatured !== undefined) updatePayload.is_featured = body.isFeatured;
    if (body.is_featured !== undefined) updatePayload.is_featured = body.is_featured;
    if (body.displayOrder !== undefined) updatePayload.display_order = Number(body.displayOrder);
    if (body.display_order !== undefined) updatePayload.display_order = Number(body.display_order);
    if (body.seoTitle !== undefined) updatePayload.seo_title = body.seoTitle;
    if (body.seo_title !== undefined) updatePayload.seo_title = body.seo_title;
    if (body.metaDescription !== undefined) updatePayload.meta_description = body.metaDescription;
    if (body.meta_description !== undefined) updatePayload.meta_description = body.meta_description;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("floor_plans")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Floor plan updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updatePayload },
      message: "Floor plan updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating floor plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to update floor plan.", code: "UPDATE_ERROR" },
      },
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
        .from("floor_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Floor plan blueprint deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting floor plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to delete floor plan.", code: "DELETE_ERROR" },
      },
      { status: 500 }
    );
  }
}
