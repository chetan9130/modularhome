import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { readBlogsFromStore, saveCustomBlog } from "@/lib/blogStore";
import { RESOURCE_ARTICLES } from "@/data/resources";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let dbBlogs: any[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("blogs")
          .select("*")
          .order("published_at", { ascending: false });

        if (status && status !== "ALL") {
          query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (!error && data) {
          dbBlogs = data;
        }
      } catch (err) {
        console.error("Supabase blogs fetch error:", err);
      }
    }

    // Read local custom blogs
    const localBlogs = readBlogsFromStore();

    // Merge: Supabase + local custom blogs + static seeds if needed
    const existingSlugs = new Set<string>();
    const merged: any[] = [];

    // 1. Add local blogs
    for (const lb of localBlogs) {
      existingSlugs.add(lb.slug.toLowerCase());
      merged.push({
        id: lb.id,
        slug: lb.slug,
        title: lb.title,
        category: lb.category,
        author: lb.author,
        publishedAt: lb.publishedAt || lb.published_at,
        status: lb.status || "PUBLISHED",
        featuredImage: lb.featuredImage || lb.featured_image || lb.image,
        excerpt: lb.excerpt,
        content: lb.content,
      });
    }

    // 2. Add DB blogs
    for (const db of dbBlogs) {
      if (!existingSlugs.has((db.slug || "").toLowerCase())) {
        existingSlugs.add((db.slug || "").toLowerCase());
        merged.push({
          id: db.id,
          slug: db.slug,
          title: db.title,
          category: db.category || (Array.isArray(db.categories) ? db.categories[0] : "Building Guides"),
          author: db.author || db.author_name || "ModularHome Engineering Team",
          publishedAt: db.published_at,
          status: db.status || "PUBLISHED",
          featuredImage: db.featured_image,
          excerpt: db.excerpt,
          content: db.content,
        });
      }
    }

    // 3. Add default static resources if none match
    for (const res of RESOURCE_ARTICLES) {
      if (!existingSlugs.has(res.slug.toLowerCase())) {
        existingSlugs.add(res.slug.toLowerCase());
        merged.push({
          id: res.id,
          slug: res.slug,
          title: res.title,
          category: res.category,
          author: res.author || "ModularHome Engineering Team",
          publishedAt: res.date,
          status: "PUBLISHED",
          featuredImage: res.image,
          excerpt: res.excerpt,
          content: Array.isArray(res.content) ? res.content.join("\n\n") : res.content,
        });
      }
    }

    let filtered = merged;
    if (status && status !== "ALL") {
      filtered = filtered.filter((b) => (b.status || "").toUpperCase() === status.toUpperCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          (b.title || "").toLowerCase().includes(q) ||
          (b.slug || "").toLowerCase().includes(q) ||
          (b.category || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error: any) {
    console.error("Error fetching admin blogs:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch blogs.", code: "DB_ERROR" } },
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
      excerpt,
      content,
      featuredImage,
      author,
      publishedAt,
      status,
      categories,
      tags,
      embeddedVideoUrl,
      seoTitle,
      metaDescription,
      imageAltText,
      canonicalUrl,
      keyTakeaways,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: { message: "Title, slug, and content are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

    // 1. Always save to local persistent custom_blogs.json
    const savedLocal = saveCustomBlog({
      title,
      slug: cleanSlug,
      excerpt: excerpt || null,
      content,
      featuredImage:
        featuredImage ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      featured_image:
        featuredImage ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      author: author || "ModularHome Editorial Team",
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      status: status || "PUBLISHED",
      categories: Array.isArray(categories) ? categories : [],
      category: Array.isArray(categories) && categories.length > 0 ? categories[0] : "Building Guides",
      tags: Array.isArray(tags) ? tags : [],
      embeddedVideoUrl: embeddedVideoUrl || null,
      embedded_video_url: embeddedVideoUrl || null,
      seoTitle: seoTitle || `${title} | ModularHome.com Guide`,
      seo_title: seoTitle || `${title} | ModularHome.com Guide`,
      metaDescription: metaDescription || excerpt || null,
      meta_description: metaDescription || excerpt || null,
      imageAltText: imageAltText || title,
      image_alt_text: imageAltText || title,
      canonicalUrl: canonicalUrl || null,
      canonical_url: canonicalUrl || null,
      keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
    });

    // 2. Also save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const newBlogDb = {
          title,
          slug: cleanSlug,
          excerpt: excerpt || null,
          content,
          featured_image: savedLocal.featuredImage,
          author: savedLocal.author,
          published_at: savedLocal.publishedAt,
          status: savedLocal.status,
          categories: savedLocal.categories,
          tags: savedLocal.tags,
          embedded_video_url: savedLocal.embeddedVideoUrl,
          seo_title: savedLocal.seoTitle,
          meta_description: savedLocal.metaDescription,
          image_alt_text: savedLocal.imageAltText,
          canonical_url: savedLocal.canonicalUrl,
        };

        await supabaseAdmin.from("blogs").upsert(newBlogDb, { onConflict: "slug" });
      } catch (dbErr) {
        console.warn("Supabase upsert warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: savedLocal,
      message: "Blog article created and published successfully.",
    });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create blog.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
