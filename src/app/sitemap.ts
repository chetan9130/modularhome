import { MetadataRoute } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_FLOOR_PLANS } from "@/data/floorPlans";
import { BUILDING_MODELS, BuildingModel } from "@/data/models";

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
      // Products
      const { data: products } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("is_published", true);

      if (products) {
        products.forEach((p: { slug: string; updated_at?: string }) => {
          dynamicRoutes.push({
            url: `${baseUrl}/buildings/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.8,
          });
        });
      }

      // Floor Plans
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

      // Blogs
      const { data: blogs } = await supabase
        .from("blogs")
        .select("slug, updated_at")
        .eq("status", "PUBLISHED");

      if (blogs) {
        blogs.forEach((b: { slug: string; updated_at?: string }) => {
          dynamicRoutes.push({
            url: `${baseUrl}/resources/${b.slug}`,
            lastModified: b.updated_at ? new Date(b.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        });
      }

      // CMS Pages
      const { data: pages } = await supabase
        .from("pages")
        .select("slug, updated_at")
        .eq("status", "PUBLISHED");

      if (pages) {
        pages.forEach((page: { slug: string; updated_at?: string }) => {
          dynamicRoutes.push({
            url: `${baseUrl}/${page.slug}`,
            lastModified: page.updated_at ? new Date(page.updated_at) : now,
            changeFrequency: "monthly",
            priority: 0.6,
          });
        });
      }
    } catch (e) {
      console.error("Error generating dynamic sitemap:", e);
    }
  }

  // Fallback if dynamic fetch is empty
  if (dynamicRoutes.length === 0) {
    BUILDING_MODELS.forEach((m: BuildingModel) => {
      dynamicRoutes.push({
        url: `${baseUrl}/buildings/${m.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    INITIAL_FLOOR_PLANS.forEach((fp) => {
      dynamicRoutes.push({
        url: `${baseUrl}/floor-plans/${fp.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  }

  return [...staticRoutes, ...dynamicRoutes];
}
