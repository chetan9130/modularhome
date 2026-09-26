import { MetadataRoute } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modularhome.com";
  const now = new Date();

  // 1. Static Core Landing Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/buildings`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/floor-plans`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quote`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/upload-floor-plan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  if (isSupabaseConfigured()) {
    try {
      // 1. Migrated & Dynamic Products
      const { data: products } = await supabase
        .from("products")
        .select("handle, updated_at, status")
        .or("status.eq.active,status.is.null");

      if (products && products.length > 0) {
        products.forEach((p: { handle?: string; updated_at?: string }) => {
          if (p.handle) {
            dynamicRoutes.push({
              url: `${baseUrl}/buildings/${p.handle}`,
              lastModified: p.updated_at ? new Date(p.updated_at) : now,
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
        });
      }

      // 2. Migrated Collections
      const { data: collections } = await supabase
        .from("collections")
        .select("handle, updated_at")
        .eq("is_published", true);

      if (collections && collections.length > 0) {
        collections.forEach((c: { handle?: string; updated_at?: string }) => {
          if (c.handle) {
            dynamicRoutes.push({
              url: `${baseUrl}/buildings?category=${encodeURIComponent(c.handle)}`,
              lastModified: c.updated_at ? new Date(c.updated_at) : now,
              changeFrequency: "weekly",
              priority: 0.85,
            });
          }
        });
      }

      // 3. Floor Plans
      const { data: floorPlans } = await supabase
        .from("floor_plans")
        .select("slug, updated_at")
        .eq("status", "PUBLISHED");

      if (floorPlans) {
        floorPlans.forEach((fp: { slug: string; updated_at?: string }) => {
          dynamicRoutes.push({
            url: `${baseUrl}/floor-plans/${fp.slug}`,
            lastModified: fp.updated_at ? new Date(fp.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.8,
          });
        });
      }

      // 4. Migrated Blog Posts & Articles
      const { data: blogPosts } = await supabase
        .from("blog_posts")
        .select("handle, updated_at, status")
        .or("status.eq.active,status.is.null");

      if (blogPosts && blogPosts.length > 0) {
        blogPosts.forEach((b: { handle?: string; updated_at?: string }) => {
          if (b.handle) {
            dynamicRoutes.push({
              url: `${baseUrl}/resources/${b.handle}`,
              lastModified: b.updated_at ? new Date(b.updated_at) : now,
              changeFrequency: "weekly",
              priority: 0.7,
            });
          }
        });
      }

      // 5. Migrated CMS Pages
      const { data: pages } = await supabase
        .from("pages")
        .select("handle, updated_at, status")
        .or("status.eq.active,status.is.null");

      if (pages && pages.length > 0) {
        pages.forEach((page: { handle?: string; updated_at?: string }) => {
          if (page.handle) {
            dynamicRoutes.push({
              url: `${baseUrl}/${page.handle}`,
              lastModified: page.updated_at ? new Date(page.updated_at) : now,
              changeFrequency: "monthly",
              priority: 0.6,
            });
          }
        });
      }
    } catch (e) {
      console.error("Error generating dynamic sitemap:", e);
    }
  }

  return [...staticRoutes, ...dynamicRoutes];
}
