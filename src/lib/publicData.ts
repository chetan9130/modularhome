import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { INITIAL_FLOOR_PLANS, FloorPlan } from "@/data/floorPlans";
import { BUILDING_MODELS, BuildingModel } from "@/data/models";
import { RESOURCE_ARTICLES } from "@/data/resources";

/**
 * Normalizes Supabase floor plan row to FloorPlan interface
 */
export function formatFloorPlan(p: any): FloorPlan {
  return {
    id: p.id,
    title: p.title || "Modern Floor Plan",
    slug: p.slug || p.id,
    tagline: p.tagline || "",
    description: p.description || "",
    price: Number(p.price) || 495,
    salePrice: p.sale_price ? Number(p.sale_price) : undefined,
    currency: p.currency || "USD",
    previewImage: p.preview_image || p.previewImage || "/finallogo.avif",
    gallery: Array.isArray(p.gallery) ? p.gallery : (p.gallery ? [p.gallery] : []),
    filePath: p.file_path,
    fileFormat: p.file_format || "PDF + CAD (DWG)",
    category: p.category || "Cabins",
    bedrooms: Number(p.bedrooms) || 2,
    bathrooms: Number(p.bathrooms) || 1,
    squareFeet: Number(p.square_feet || p.squareFeet) || 800,
    dimensions: p.dimensions || "24x36 ft",
    stories: Number(p.stories) || 1,
    includedItems: Array.isArray(p.included_items) ? p.included_items : [
      "Full Construction Blueprints",
      "Structural Steel Framing & Truss Layouts",
      "Electrical & Plumbing Schematics",
      "Foundation & Engineering Stamp Ready",
    ],
    features: Array.isArray(p.features) ? p.features : [],
    specs: p.specs || {},
    status: p.status || "PUBLISHED",
    isFeatured: !!p.is_featured,
    displayOrder: Number(p.display_order) || 0,
  };
}

/**
 * Normalizes Supabase product row to BuildingModel interface
 */
export function formatProduct(p: any): BuildingModel {
  const specsArray = Array.isArray(p.specs)
    ? p.specs
    : Object.entries(p.specs || {}).map(([label, value]) => ({ label, value: String(value) }));

  const primaryImg = p.hero_image || p.featured_image || p.primary_image || (p.images && p.images[0]) || "/finallogo.avif";
  const galleryImgs = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : (Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : [primaryImg]);

  return {
    id: p.id,
    slug: p.slug || p.id,
    name: p.name || p.title || "Precision Modular Model",
    series: p.series || "Essential Series",
    category: p.category || "Modular Homes",
    architecturalStyle: p.architectural_style || p.architecturalStyle || "Modern Homes",
    tagline: p.tagline || "",
    description: p.description || "",
    sqft: Number(p.sqft) || 800,
    bedrooms: Number(p.bedrooms || p.beds) || 2,
    bathrooms: Number(p.bathrooms || p.baths) || 1,
    stories: Number(p.stories) || 1,
    startingPrice: Number(p.starting_price || p.price) || 89000,
    dimensions: p.dimensions || "24' x 36'",
    frameType: p.frame_type || p.frameType || "100% Commercial-Grade Galvanized Light Gauge Steel",
    roofPitch: p.roof_pitch || p.roofPitch || "4:12 Pitch (Standing Seam Ready)",
    windRating: p.wind_rating || p.windRating || "Up to 150 MPH (Engineered for Extreme Weather)",
    snowLoad: p.snow_load || p.snowLoad || "50 PSF Ground Snow Load Rated",
    warranty: p.warranty || "50-Year Structural Steel Frame Warranty",
    primaryImage: primaryImg,
    image: primaryImg,
    gallery: galleryImgs,
    floorPlanImage: p.floor_plan_image || p.floorPlanImage || "",
    floorPlan: p.floor_plan_image || p.floorPlanImage || "",
    features: Array.isArray(p.features) ? p.features : [
      "Heavy-Gauge Galvanized Steel Chassis",
      "Architectural Grade Insulated Wall Panels",
      "Double-Pane Argon Low-E Windows",
      "Turnkey Assembly Ready",
    ],
    specs: specsArray.length > 0 ? specsArray : [
      { label: "Dimensions", value: p.dimensions || "24' x 36'" },
      { label: "Living Area", value: `${p.sqft || 800} SQ FT` },
      { label: "Bedrooms", value: `${p.bedrooms || 2} Beds` },
      { label: "Bathrooms", value: `${p.bathrooms || 1} Baths` },
    ],
    customizableOptions: Array.isArray(p.customizable_options || p.customizableOptions)
      ? (p.customizable_options || p.customizableOptions)
      : [
          { id: "opt-1", name: "Covered Wrap-Around Timber Deck", price: 12500, description: "Solid timber posts & weather-resistant composite decking" },
          { id: "opt-2", name: "Premium R-38 Closed-Cell Insulation", price: 6800, description: "Extreme thermal envelope for energy cost reduction" },
          { id: "opt-3", name: "16ft Multi-Slide Panoramic Glass Wall", price: 9400, description: "Black aluminum double-pane argon low-E sliders" },
        ],
  };
}

/**
 * Fetches all published floor plans
 */
export async function getPublicFloorPlans(params?: {
  category?: string;
  search?: string;
}): Promise<FloorPlan[]> {
  try {
    if (!isSupabaseConfigured()) {
      return filterFloorPlans(INITIAL_FLOOR_PLANS, params);
    }

    let query = supabaseAdmin
      .from("floor_plans")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (params?.category && params.category !== "ALL") {
      query = query.eq("category", params.category);
    }

    const { data: dbPlans, error } = await query;
    if (error || !dbPlans || dbPlans.length === 0) {
      return filterFloorPlans(INITIAL_FLOOR_PLANS, params);
    }

    const formatted = dbPlans.map(formatFloorPlan);

    // Merge any static initial plans not yet in DB
    const existingSlugs = new Set(formatted.map((p) => p.slug));
    const merged = [...formatted];
    for (const staticPlan of INITIAL_FLOOR_PLANS) {
      if (!existingSlugs.has(staticPlan.slug)) {
        merged.push(staticPlan);
      }
    }

    return filterFloorPlans(merged, params);
  } catch (error) {
    console.error("Error fetching public floor plans:", error);
    return filterFloorPlans(INITIAL_FLOOR_PLANS, params);
  }
}

function filterFloorPlans(plans: FloorPlan[], params?: { category?: string; search?: string }): FloorPlan[] {
  let result = plans;
  if (params?.category && params.category !== "ALL") {
    result = result.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  return result;
}

/**
 * Fetches a single published floor plan by slug or ID
 */
export async function getPublicFloorPlanBySlug(slug: string): Promise<FloorPlan | null> {
  try {
    if (isSupabaseConfigured()) {
      const { data: plan, error } = await supabaseAdmin
        .from("floor_plans")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();

      if (!error && plan) {
        return formatFloorPlan(plan);
      }
    }

    const found = INITIAL_FLOOR_PLANS.find((p) => p.slug === slug || p.id === slug);
    return found || null;
  } catch (error) {
    const found = INITIAL_FLOOR_PLANS.find((p) => p.slug === slug || p.id === slug);
    return found || null;
  }
}

/**
 * Fetches all published home models / products
 */
export async function getPublicProducts(params?: {
  category?: string;
  search?: string;
  isFeatured?: boolean;
}): Promise<BuildingModel[]> {
  try {
    if (!isSupabaseConfigured()) {
      return filterProducts(BUILDING_MODELS, params);
    }

    let query = supabaseAdmin
      .from("products")
      .select("*, product_collections(collection_id)")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (params?.category && params.category !== "All" && params.category !== "ALL") {
      query = query.eq("category", params.category);
    }
    if (params?.isFeatured) {
      query = query.eq("is_featured", true);
    }

    const { data: dbProducts, error } = await query;
    if (error || !dbProducts || dbProducts.length === 0) {
      return filterProducts(BUILDING_MODELS, params);
    }

    const formatted = dbProducts.map(formatProduct);

    // Merge with static models so no default catalogue model is lost
    const existingSlugs = new Set(formatted.map((p) => p.slug));
    const merged = [...formatted];
    for (const staticModel of BUILDING_MODELS) {
      if (!existingSlugs.has(staticModel.slug)) {
        merged.push(staticModel);
      }
    }

    return filterProducts(merged, params);
  } catch (error) {
    console.error("Error fetching public products:", error);
    return filterProducts(BUILDING_MODELS, params);
  }
}

function filterProducts(
  models: BuildingModel[],
  params?: { category?: string; search?: string; isFeatured?: boolean }
): BuildingModel[] {
  let result = models;
  if (params?.category && params.category !== "All" && params.category !== "ALL") {
    result = result.filter((m) => m.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.series.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }
  return result;
}

/**
 * Fetches a single home model by slug or ID
 */
export async function getPublicProductBySlug(slug: string): Promise<BuildingModel | null> {
  try {
    if (isSupabaseConfigured()) {
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();

      if (!error && product) {
        return formatProduct(product);
      }
    }

    const found = BUILDING_MODELS.find((m) => m.slug === slug || m.id === slug);
    return found || null;
  } catch (error) {
    const found = BUILDING_MODELS.find((m) => m.slug === slug || m.id === slug);
    return found || null;
  }
}

/**
 * Fetches published articles / blogs
 */
export async function getPublicBlogs(params?: { category?: string; search?: string }) {
  try {
    if (!isSupabaseConfigured()) {
      return RESOURCE_ARTICLES;
    }

    let query = supabaseAdmin
      .from("blogs")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (params?.category && params.category !== "ALL") {
      query = query.eq("category", params.category);
    }

    const { data: blogs, error } = await query;
    if (error || !blogs || blogs.length === 0) {
      return RESOURCE_ARTICLES;
    }

    const mapped = blogs.map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || b.meta_description || "",
      content: Array.isArray(b.content) ? b.content : (typeof b.content === "string" ? [b.content] : []),
      category: b.category || "Building Guides",
      readTime: b.read_time || "5 min read",
      date: b.published_at ? new Date(b.published_at).toLocaleDateString() : "Recent",
      image: b.featured_image || "/finallogo.avif",
      author: b.author_name || "ModularHome Engineering Team",
    }));

    return mapped;
  } catch (e) {
    return RESOURCE_ARTICLES;
  }
}

/**
 * Fetches public global site settings
 */
export async function getPublicSettings() {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data: settings, error } = await supabaseAdmin
      .from("global_settings")
      .select("*")
      .eq("key", "default")
      .single();

    if (error || !settings) return null;
    return settings;
  } catch (e) {
    return null;
  }
}
