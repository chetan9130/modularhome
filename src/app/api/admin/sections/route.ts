import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  saveSection,
  getPageSections,
  reorderSections,
  toggleSectionVisibility,
  isUuidString,
  readSectionsFromStore,
} from "@/lib/pageStore";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    let dbSections: any[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("page_sections")
          .select("*")
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (pageId && isUuidString(pageId)) {
          query = query.eq("page_id", pageId);
        }

        const { data, error } = await query;
        if (!error && data) {
          dbSections = data;
        }
      } catch (dbErr) {
        console.warn("Supabase fetch sections warning:", dbErr);
      }
    }

    // Fetch from local persistent store
    const localSections = pageId ? getPageSections(pageId) : readSectionsFromStore();

    // Merge DB sections and local sections
    const existingIds = new Set(dbSections.map((s) => s.id));
    const merged: any[] = [...dbSections];

    for (const ls of localSections) {
      if (!existingIds.has(ls.id)) {
        merged.push(ls);
        existingIds.add(ls.id);
      }
    }

    // Normalize property names for UI convenience
    const formatted = merged.map((s, idx) => ({
      id: s.id || s._id,
      pageId: s.pageId || s.page_id,
      page_id: s.page_id || s.pageId,
      type: (s.type || "HERO").toUpperCase(),
      title: s.title || "",
      subtitle: s.subtitle || "",
      content: s.content || "",
      order: s.display_order ?? s.displayOrder ?? idx + 1,
      displayOrder: s.display_order ?? s.displayOrder ?? idx + 1,
      display_order: s.display_order ?? s.displayOrder ?? idx + 1,
      isVisible: (s.isVisible !== undefined ? s.isVisible : s.is_visible) !== false,
      is_visible: (s.is_visible !== undefined ? s.is_visible : s.isVisible) !== false,
    })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return NextResponse.json({
      success: true,
      data: formatted,
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

    const isVis = (isVisible !== undefined ? isVisible : is_visible) ?? true;
    const finalOrder = Number(order ?? displayOrder ?? 1);
    const finalContent = typeof content === "object" ? JSON.stringify(content) : content || "";

    // 1. Save locally in persistent store
    const localSaved = saveSection({
      pageId,
      type: type.toUpperCase(),
      title: title || "",
      subtitle: subtitle || "",
      content: finalContent,
      displayOrder: finalOrder,
      isVisible: isVis,
    });

    // 2. Also save to Supabase if configured and pageId is a valid UUID
    if (isSupabaseConfigured() && isUuidString(pageId)) {
      try {
        const newSection = {
          page_id: pageId,
          type: type.toUpperCase(),
          title: title || null,
          subtitle: subtitle || null,
          content: finalContent || null,
          display_order: finalOrder,
          is_visible: isVis,
        };

        const { data, error } = await supabaseAdmin
          .from("page_sections")
          .insert(newSection)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            data: {
              ...data,
              order: data.display_order,
              displayOrder: data.display_order,
              isVisible: data.is_visible,
            },
            message: "Section created successfully.",
          });
        }
      } catch (sbErr) {
        console.warn("Supabase insert section warning, saved locally:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...localSaved,
        order: localSaved.displayOrder,
        isVisible: localSaved.isVisible,
      },
      message: "Section created successfully.",
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
      // 1. Reorder in local store
      reorderSections(
        reorderedItems.map((item: any, index: number) => ({
          id: item.id || item._id,
          order: index + 1,
        }))
      );

      // 2. Reorder in Supabase for UUID items
      if (isSupabaseConfigured()) {
        try {
          const updatePromises = reorderedItems
            .filter((item: any) => isUuidString(item.id || item._id))
            .map((item: any, index: number) => {
              const id = item.id || item._id;
              return supabaseAdmin
                .from("page_sections")
                .update({ display_order: index + 1, updated_at: new Date().toISOString() })
                .eq("id", id);
            });
          await Promise.all(updatePromises);
        } catch (sbErr) {
          console.warn("Supabase reorder warning:", sbErr);
        }
      }

      return NextResponse.json({ success: true, message: "Sections reordered successfully." });
    }

    if (action === "toggleVisibility" && sectionId) {
      // 1. Toggle locally
      toggleSectionVisibility(sectionId, !!isVisible);

      // 2. Toggle in Supabase if UUID
      if (isSupabaseConfigured() && isUuidString(sectionId)) {
        try {
          await supabaseAdmin
            .from("page_sections")
            .update({ is_visible: !!isVisible, updated_at: new Date().toISOString() })
            .eq("id", sectionId);
        } catch (sbErr) {
          console.warn("Supabase toggle visibility warning:", sbErr);
        }
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
