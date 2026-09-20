import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    let query = supabaseAdmin
      .from("page_sections")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (pageId) {
      query = query.eq("page_id", pageId);
    }

    const { data: sections, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: sections || [],
    });
  } catch (error: any) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch sections.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { pageId, type, title, subtitle, content, order, displayOrder, isVisible, is_visible } = body;

    if (!pageId || !type) {
      return NextResponse.json(
        { success: false, error: { message: "Page ID and Section Type are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const newSection = {
      page_id: pageId,
      type: type.toUpperCase(),
      title: title || null,
      subtitle: subtitle || null,
      content: typeof content === "object" ? JSON.stringify(content) : content || null,
      display_order: Number(order ?? displayOrder ?? 1),
      is_visible: (isVisible !== undefined ? isVisible : is_visible) ?? true,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("page_sections")
        .insert(newSection)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Section created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: "mock-section-id", ...newSection },
      message: "Section created successfully (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create section.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}

// Bulk reorder or visibility toggle
export async function PUT(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { action, reorderedItems, sectionId, isVisible } = body;

    if (action === "reorder" && Array.isArray(reorderedItems)) {
      if (isSupabaseConfigured()) {
        const updatePromises = reorderedItems.map((item: any, index: number) => {
          const id = item.id || item._id;
          return supabaseAdmin
            .from("page_sections")
            .update({ display_order: index + 1, updated_at: new Date().toISOString() })
            .eq("id", id);
        });
        await Promise.all(updatePromises);
      }
      return NextResponse.json({ success: true, message: "Sections reordered successfully." });
    }

    if (action === "toggleVisibility" && sectionId) {
      if (isSupabaseConfigured()) {
        await supabaseAdmin
          .from("page_sections")
          .update({ is_visible: !!isVisible, updated_at: new Date().toISOString() })
          .eq("id", sectionId);
      }
      return NextResponse.json({ success: true, message: "Visibility updated." });
    }

    return NextResponse.json(
      { success: false, error: { message: "Invalid action specified.", code: "INVALID_ACTION" } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error updating sections:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to process section update.", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}
