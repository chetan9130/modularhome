import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  saveCustomPage,
  readPagesFromStore,
  getPageSectionCounts,
  getPageSections,
  isUuidString,
} from "@/lib/pageStore";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let dbPages: any[] = [];
    const dbSectionCounts: Record<string, number> = {};

    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("pages")
          .select("*")
          .order("created_at", { ascending: false });

        if (status && status !== "ALL") {
          query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (!error && data) {
          dbPages = data;
        }

        // Also fetch Supabase page sections count
        const { data: dbSecs } = await supabaseAdmin
          .from("page_sections")
          .select("id, page_id");

        if (dbSecs) {
          for (const s of dbSecs) {
            if (s.page_id) {
              dbSectionCounts[s.page_id] = (dbSectionCounts[s.page_id] || 0) + 1;
            }
          }
        }
      } catch (dbErr) {
        console.warn("Supabase fetch pages warning:", dbErr);
      }
    }

    // Merge with local persistent store
    const localPages = readPagesFromStore();
    const localSectionCounts = getPageSectionCounts();
    const existingSlugs = new Set(dbPages.map((p) => p.slug?.toLowerCase()));
    const merged: any[] = [...dbPages];

    for (const lp of localPages) {
      if (!existingSlugs.has(lp.slug?.toLowerCase())) {
        if (!status || status === "ALL" || lp.status === status) {
          merged.push(lp);
          existingSlugs.add(lp.slug?.toLowerCase());
        }
      }
    }

    // Apply optional search filter
    let filtered = merged;
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.slug?.toLowerCase().includes(search) ||
          p.subtitle?.toLowerCase().includes(search)
      );
    }

    // Attach accurate section count to every page
    const formattedPages = filtered.map((page) => {
      const pageId = page.id || page._id;
      const slug = page.slug;

      const dbCount = (pageId && dbSectionCounts[pageId]) || 0;
      const localCount =
        (pageId && localSectionCounts[pageId]) ||
        (slug && localSectionCounts[slug]) ||
        0;
      const inlineCount = Array.isArray(page.sections) ? page.sections.length : 0;

      const finalCount = Math.max(dbCount, localCount, inlineCount);

      return {
        ...page,
        id: pageId,
        sectionCount: finalCount,
        _count: {
          sections: finalCount,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedPages,
    });
  } catch (error: any) {
    console.error("Error fetching admin pages:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch pages.", code: "DB_ERROR" } },
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
      title,
      slug,
      subtitle,
      content,
      status,
      featuredImage,
      featured_image,
      seoTitle,
      seo_title,
      metaDescription,
      meta_description,
      canonicalUrl,
      canonical_url,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: { message: "Page title and slug are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    const newPage = {
      title,
      slug: cleanSlug,
      subtitle: subtitle || null,
      content: content || null,
      status: status || "PUBLISHED",
      featured_image: featuredImage || featured_image || null,
      seo_title: seoTitle || seo_title || title,
      meta_description: metaDescription || meta_description || subtitle || null,
      canonical_url: canonicalUrl || canonical_url || null,
    };

    // 1. Immediately save into persistent local store (ensures 100% instant availability)
    const localSaved = saveCustomPage({
      title,
      slug: cleanSlug,
      subtitle: subtitle || "",
      content: content || "",
      status: status || "PUBLISHED",
      featuredImage: featuredImage || featured_image || "",
      seoTitle: seoTitle || seo_title || title,
      metaDescription: metaDescription || meta_description || subtitle || "",
      canonicalUrl: canonicalUrl || canonical_url || "",
    });

    // 2. Also save into Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("pages")
          .insert(newPage)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            data: { ...data, sectionCount: 0, _count: { sections: 0 } },
            message: "Page created successfully.",
          });
        }
      } catch (sbErr) {
        console.warn("Supabase insert warning, saved locally:", sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...localSaved, sectionCount: 0, _count: { sections: 0 } },
      message: "Page created successfully.",
    });
  } catch (error: any) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create page.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
