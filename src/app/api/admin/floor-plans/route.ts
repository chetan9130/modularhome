import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_FLOOR_PLANS } from "@/data/floorPlans";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    if (!isSupabaseConfigured()) {
      let filtered = [...INITIAL_FLOOR_PLANS];
      if (category && category !== "ALL") {
        filtered = filtered.filter((f) => f.category === category);
      }
      return NextResponse.json({
        success: true,
        data: filtered,
      });
    }

    let query = supabaseAdmin
      .from("floor_plans")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (category && category !== "ALL") {
      query = query.eq("category", category);
    }
    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data: plans, error } = await query;
    if (error) {
      console.warn("Supabase query error on floor_plans, falling back to static dataset:", error.message);
      return NextResponse.json({
        success: true,
        data: INITIAL_FLOOR_PLANS,
      });
    }

    return NextResponse.json({
      success: true,
      data: plans && plans.length > 0 ? plans : INITIAL_FLOOR_PLANS,
    });
  } catch (error: any) {
    console.error("Error fetching floor plans, falling back to static dataset:", error);
    return NextResponse.json({
      success: true,
      data: INITIAL_FLOOR_PLANS,
    });
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
      tagline,
      description,
      price,
      salePrice,
      previewImage,
      gallery,
      filePath,
      fileFormat,
      category,
      bedrooms,
      bathrooms,
      squareFeet,
      dimensions,
      stories,
      includedItems,
      features,
      specs,
      status,
      isFeatured,
      displayOrder,
      seoTitle,
      metaDescription,
    } = body;

    if (!title || !slug || !price) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Title, slug, and price are required.", code: "VALIDATION_ERROR" },
        },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const parseJson = (val: any, fallback: any) => {
      if (!val) return fallback;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      }
      return val;
    };

    const newPlan = {
      title,
      slug: cleanSlug,
      tagline: tagline || null,
      description: description || null,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      preview_image:
        previewImage ||
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
      gallery: parseJson(gallery, []),
      file_path: filePath || null,
      file_format: fileFormat || "PDF + CAD (DWG)",
      category: category || "Cabins",
      bedrooms: Number(bedrooms) || 2,
      bathrooms: Number(bathrooms) || 1,
      square_feet: Number(squareFeet) || 800,
      dimensions: dimensions || "24x36 ft",
      stories: Number(stories) || 1,
      included_items: parseJson(includedItems, [
        "Full Construction Blueprints",
        "Structural Steel Framing & Truss Layouts",
        "Electrical & Plumbing Schematics",
      ]),
      features: parseJson(features, []),
      specs: parseJson(specs, {}),
      status: status || "PUBLISHED",
      is_featured: isFeatured !== undefined ? isFeatured : false,
      display_order: Number(displayOrder) || 0,
      seo_title: seoTitle || `${title} Blueprint Package | ModularHome`,
      meta_description: metaDescription || description?.slice(0, 160) || null,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("floor_plans")
        .insert(newPlan)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Floor plan blueprint created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-fp-id", ...newPlan },
      message: "Floor plan blueprint created successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating floor plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to create floor plan.", code: "CREATE_ERROR" },
      },
      { status: 500 }
    );
  }
}
