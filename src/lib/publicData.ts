import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { FloorPlan } from "@/data/floorPlans";
import { BuildingModel } from "@/data/models";
import { ResourceArticle } from "@/data/resources";
import { getPublicGlobalSettings } from "./settings";
import { matchProductCategory } from "@/utils/categoryMatching";

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

  const primaryImg =
    p.primary_image_url ||
    p.hero_image ||
    p.featured_image ||
    p.primary_image ||
    (Array.isArray(p.images) && p.images[0]) ||
    (p.product_media && p.product_media.length > 0 ? p.product_media[0].source_url : "") ||
    "/finallogo.avif";

  const galleryImgs =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : p.product_media && Array.isArray(p.product_media) && p.product_media.length > 0
      ? p.product_media.map((m: any) => m.source_url)
      : Array.isArray(p.gallery) && p.gallery.length > 0
      ? p.gallery
      : [primaryImg];

  // Extract starting price from variants if present
  let startingPrice = Number(p.price || p.starting_price);
  if ((!startingPrice || isNaN(startingPrice)) && p.product_variants && Array.isArray(p.product_variants) && p.product_variants.length > 0) {
    const validPrices = p.product_variants
      .map((v: any) => Number(v.price))
      .filter((pr: number) => !isNaN(pr) && pr > 0);
    if (validPrices.length > 0) {
      startingPrice = Math.min(...validPrices);
    }
  }
  if (!startingPrice || isNaN(startingPrice)) startingPrice = 89000;

  return {
    id: p.id,
    slug: p.handle || p.slug || p.id,
    name: p.title || p.name || "Precision Modular Model",
    series: p.product_type || p.series || "Essential Series",
    category: p.category || p.product_type || "Modular Homes",
    architecturalStyle: p.architectural_style || p.architecturalStyle || "Modern Homes",
    tagline: p.tagline || "",
    description: p.description || p.description_html || "",
    sqft: Number(p.sqft) || 800,
    bedrooms: Number(p.bedrooms || p.beds) || 2,
    bathrooms: Number(p.bathrooms || p.baths) || 1,
    stories: Number(p.stories) || 1,
    startingPrice,
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
    videoUrl: p.video_url || p.videoUrl || p.video || "",
    videoDuration: p.video_duration || p.videoDuration || "",
    videoTitle: p.video_title || p.videoTitle || "",
    features: Array.isArray(p.features) && p.features.length > 0
      ? p.features
      : [
          "Heavy-Gauge Galvanized Steel Chassis",
          "Architectural Grade Insulated Wall Panels",
          "Double-Pane Argon Low-E Windows",
          "Turnkey Assembly Ready",
        ],
    specs:
      specsArray.length > 0
        ? specsArray
        : [
            { label: "Dimensions", value: p.dimensions || "24' x 36'" },
            { label: "Living Area", value: `${p.sqft || 800} SQ FT` },
            { label: "Bedrooms", value: `${p.bedrooms || 2} Beds` },
            { label: "Bathrooms", value: `${p.bathrooms || 1} Baths` },
          ],
    customizableOptions: Array.isArray(p.customizable_options || p.customizableOptions)
      ? p.customizable_options || p.customizableOptions
      : [
          {
            id: "opt-1",
            name: "Covered Wrap-Around Timber Deck",
            price: 12500,
            description: "Solid timber posts & weather-resistant composite decking",
          },
          {
            id: "opt-2",
            name: "Premium R-38 Closed-Cell Insulation",
            price: 6800,
            description: "Extreme thermal envelope for energy cost reduction",
          },
          {
            id: "opt-3",
            name: "16ft Multi-Slide Panoramic Glass Wall",
            price: 9400,
            description: "Black aluminum double-pane argon low-E sliders",
          },
        ],
    tags: Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === "string"
      ? p.tags.split(",").map((t: string) => t.trim())
      : [],
    collections: Array.isArray(p.collections)
      ? p.collections
      : Array.isArray(p.product_collections)
      ? p.product_collections.map((pc: any) => pc.collections?.title || pc.collections?.handle || "").filter(Boolean)
      : [],
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
      return [];
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
      return [];
    }

    let formatted = dbPlans.map(formatFloorPlan);

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      formatted = formatted.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return formatted;
  } catch (error) {
    console.error("Error fetching public floor plans:", error);
    return [];
  }
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
        .maybeSingle();

      if (!error && plan) {
        return formatFloorPlan(plan);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches all published home models / products directly from Supabase
 */
export async function getPublicProducts(params?: {
  category?: string;
  search?: string;
  isFeatured?: boolean;
}): Promise<BuildingModel[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }

    let query = supabaseAdmin
      .from("products")
      .select("*, product_variants(*), product_media(*)")
      .or("status.eq.active,status.is.null")
      .order("created_at", { ascending: false });

    if (params?.isFeatured) {
      query = query.eq("is_featured", true);
    }

    const { data: dbProducts, error } = await query;
    if (error || !dbProducts || dbProducts.length === 0) {
      return [];
    }

    let formatted = dbProducts.map(formatProduct);

    // Filter by Category
    if (params?.category && params.category !== "All" && params.category !== "ALL") {
      formatted = formatted.filter((m) => matchProductCategory(m, params.category!));
    }

    // Filter by Search Query
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      formatted = formatted.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.series.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(q))) ||
          (m.architecturalStyle && m.architecturalStyle.toLowerCase().includes(q))
      );
    }

    return formatted;
  } catch (error) {
    console.error("Error fetching public products:", error);
    return [];
  }
}

/**
 * Fetches a single home model by slug or ID directly from Supabase
 */
export async function getPublicProductBySlug(slug: string): Promise<BuildingModel | null> {
  try {
    if (isSupabaseConfigured()) {
      const clean = decodeURIComponent(slug).toLowerCase().trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
      const orFilter = isUuid ? `handle.eq.${clean},id.eq.${clean}` : `handle.eq.${clean}`;

      const { data: product, error } = await supabaseAdmin
        .from("products")
        .select("*, product_variants(*), product_media(*)")
        .or(orFilter)
        .maybeSingle();

      if (!error && product) {
        return formatProduct(product);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches published articles / blogs directly from Supabase
 */
export async function getPublicBlogs(params?: { category?: string; search?: string }): Promise<ResourceArticle[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }

    let { data: blogPosts, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (error || !blogPosts || blogPosts.length === 0) {
      const { data: legacy } = await supabaseAdmin
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });
      blogPosts = legacy || [];
    }

    let blogsList: ResourceArticle[] = [];
    if (blogPosts && blogPosts.length > 0) {
      for (const b of blogPosts) {
        let formattedDate = "Recent";
        if (b.published_at || b.created_at) {
          try {
            const d = new Date(b.published_at || b.created_at);
            if (!isNaN(d.getTime())) {
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              formattedDate = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
            }
          } catch {}
        }
        blogsList.push({
          id: b.id,
          title: b.title,
          slug: b.handle || b.slug || b.id,
          excerpt: b.excerpt || b.seo_description || b.meta_description || "",
          content: typeof b.body_html === "string" ? [b.body_html] : (Array.isArray(b.content) ? b.content : (b.content ? [b.content] : [])),
          category: b.blog_title || b.category || "Building Guides",
          readTime: b.read_time || "5 min read",
          date: formattedDate,
          image: b.image_url || b.featured_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
          author: b.author || b.author_name || "ModularHome Engineering Team",
          embeddedVideoUrl: b.embedded_video_url,
          seoTitle: b.seo_title || `${b.title} | ModularHome.com Guide`,
          metaDescription: b.seo_description || b.meta_description || b.excerpt,
          tags: Array.isArray(b.tags) ? b.tags : [],
          keyTakeaways: Array.isArray(b.key_takeaways) ? b.key_takeaways : undefined,
        });
      }
    }

    let filtered = blogsList;
    if (params?.category && params.category !== "ALL" && params.category !== "All") {
      filtered = filtered.filter(
        (a) => (a.category || "").toLowerCase() === params.category!.toLowerCase()
      );
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q) ||
          (a.excerpt || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  } catch (e) {
    console.error("Error fetching public blogs:", e);
    return [];
  }
}

/**
 * Fetches a single published article / blog by slug or ID directly from Supabase
 */
export async function getPublicBlogBySlug(slugParam: string): Promise<ResourceArticle | null> {
  if (!slugParam) return null;
  const cleanSlug = decodeURIComponent(slugParam).toLowerCase().trim().replace(/^\/+|\/+$/g, "");

  try {
    if (isSupabaseConfigured()) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);
      const orFilter = isUuid
        ? `handle.eq.${cleanSlug},id.eq.${cleanSlug}`
        : `handle.eq.${cleanSlug}`;

      let { data: blog, error } = await supabaseAdmin
        .from("blog_posts")
        .select("*")
        .or(orFilter)
        .maybeSingle();

      if (error || !blog) {
        const legacyFilter = isUuid ? `slug.eq.${cleanSlug},id.eq.${cleanSlug}` : `slug.eq.${cleanSlug}`;
        const { data: legacy } = await supabaseAdmin
          .from("blogs")
          .select("*")
          .or(legacyFilter)
          .maybeSingle();
        blog = legacy;
      }

      if (blog) {
        let formattedDate = "Recent";
        if (blog.published_at || blog.created_at) {
          try {
            const d = new Date(blog.published_at || blog.created_at);
            if (!isNaN(d.getTime())) {
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              formattedDate = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
            }
          } catch {}
        }
        return {
          id: blog.id,
          title: blog.title,
          slug: blog.handle || blog.slug,
          excerpt: blog.excerpt || blog.seo_description || blog.meta_description || "",
          content: typeof blog.body_html === "string" ? [blog.body_html] : (Array.isArray(blog.content) ? blog.content : (blog.content ? [blog.content] : [])),
          category: blog.blog_title || blog.category || "Building Guides",
          readTime: blog.read_time || "5 min read",
          date: formattedDate,
          image: blog.image_url || blog.featured_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
          author: blog.author || blog.author_name || "ModularHome Engineering Team",
          embeddedVideoUrl: blog.embedded_video_url,
          seoTitle: blog.seo_title || `${blog.title} | ModularHome.com Guide`,
          metaDescription: blog.seo_description || blog.meta_description || blog.excerpt,
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          keyTakeaways: Array.isArray(blog.key_takeaways) ? blog.key_takeaways : undefined,
        };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

export interface PageSection {
  id: string;
  pageId?: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  status: string;
  featuredImage?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  sections?: PageSection[];
}

/**
 * Normalizes a DB row to CmsPage interface
 */
export function formatCmsPage(p: any, sections: any[] = []): CmsPage {
  const formattedSections: PageSection[] = sections.map((s) => ({
    id: s.id,
    pageId: s.page_id,
    type: (s.type || "RICH_CONTENT").toUpperCase(),
    title: s.title || "",
    subtitle: s.subtitle || "",
    content: s.content || "",
    displayOrder: Number(s.display_order) || 0,
    isVisible: s.is_visible !== false,
  }));

  return {
    id: p.id,
    title: p.title || "Custom Page",
    slug: p.handle || p.slug || p.id,
    subtitle: p.subtitle || "",
    content: p.body_html || p.content || "",
    status: p.status || "PUBLISHED",
    featuredImage: p.featured_image || p.featuredImage || "",
    seoTitle: p.seo_title || p.seoTitle || `${p.title} | ModularHome.com`,
    metaDescription: p.seo_description || p.meta_description || p.metaDescription || p.subtitle || "",
    canonicalUrl: p.canonical_url || p.canonicalUrl || "",
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
    sections: formattedSections,
  };
}

/**
 * Fetches a single published page by slug (or ID) directly from Supabase
 */
export async function getPublicPageBySlug(slugParam: string): Promise<CmsPage | null> {
  if (!slugParam) return null;
  const cleanSlug = decodeURIComponent(slugParam).toLowerCase().trim().replace(/^\/+|\/+$/g, "");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

  try {
    if (isSupabaseConfigured()) {
      const orFilter = isUuid
        ? `handle.eq.${cleanSlug},id.eq.${cleanSlug}`
        : `handle.eq.${cleanSlug}`;

      const { data: pages, error: pageError } = await supabaseAdmin
        .from("pages")
        .select("*")
        .or(orFilter);

      if (!pageError && pages && pages.length > 0) {
        const page = pages.find((p) => {
          const st = String(p.status || "").toUpperCase();
          return st === "PUBLISHED" || st === "ACTIVE" || !st;
        }) || pages[0];

        let dbSections: any[] = [];
        if (page.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(page.id)) {
          const { data } = await supabaseAdmin
            .from("page_sections")
            .select("*")
            .eq("page_id", page.id)
            .eq("is_visible", true)
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: true });
          if (data) dbSections = data;
        }

        return formatCmsPage(page, dbSections);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches all published CMS pages directly from Supabase
 */
export async function getPublicPages(): Promise<CmsPage[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data: dbPages, error } = await supabaseAdmin
      .from("pages")
      .select("*")
      .or("published.eq.true,published.is.null")
      .order("created_at", { ascending: false });

    if (error || !dbPages || dbPages.length === 0) {
      return [];
    }

    return dbPages.map((p: any) => formatCmsPage(p));
  } catch (error) {
    console.error("Error fetching public pages:", error);
    return [];
  }
}

export interface PublicCollection {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  isFeatured?: boolean;
  status?: string;
  displayOrder?: number;
  seoTitle?: string;
  metaDescription?: string;
  productCount?: number;
  productIds?: string[];
  products?: BuildingModel[];
}


export interface PublicReview {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  reviewText: string;
  projectTitle?: string;
  imageUrl?: string;
  status: string;
  isFeatured?: boolean;
  displayOrder?: number;
  reviewDate?: string;
}

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  pageSlug?: string;
  status: string;
  displayOrder?: number;
}

/**
 * Fetches all published collections with associated products
 */
export async function getPublicCollections(): Promise<PublicCollection[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data: dbCollections, error } = await supabaseAdmin
      .from("collections")
      .select(`
        *,
        product_collections (
          product_id
        )
      `)
      .eq("published", true)
      .order("title", { ascending: true });

    if (error || !dbCollections || dbCollections.length === 0) {
      return [];
    }

    return dbCollections.map((col: any) => {
      const pIds = col.product_collections ? col.product_collections.map((pc: any) => pc.product_id) : [];
      const title = col.title || col.name || "";
      const handle = col.handle || col.slug || "";
      return {
        id: col.id,
        name: title,
        slug: handle,
        tagline: col.tagline || `Engineered ${title}`,
        description: col.description_html || col.description || "",
        image: col.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        bannerImage: col.banner_image || col.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        isFeatured: Boolean(col.is_featured),
        status: col.published !== false ? "PUBLISHED" : "DRAFT",
        displayOrder: Number(col.display_order) || 0,
        seoTitle: col.seo_title || `${title} | ModularHome`,
        metaDescription: col.seo_description || col.meta_description || (col.description_html ? col.description_html.replace(/<[^>]*>?/gm, "").slice(0, 160) : ""),
        productCount: pIds.length,
        productIds: pIds,
      };
    });
  } catch (error) {
    console.error("Error fetching public collections:", error);
    return [];
  }
}

/**
 * Fetches single collection by slug with mapped products
 */
export async function getPublicCollectionBySlug(slug: string): Promise<PublicCollection | null> {
  const cleanSlug = slug.toLowerCase().trim();
  const allCols = await getPublicCollections();
  const matched = allCols.find((c) => c.slug.toLowerCase() === cleanSlug || c.id === cleanSlug);
  if (!matched) return null;

  // Retrieve products
  const allProducts = await getPublicProducts();
  const mappedProducts = matched.productIds && matched.productIds.length > 0
    ? allProducts.filter((p) => matched.productIds?.includes(p.id))
    : allProducts.filter((p) => p.category.toLowerCase().includes(matched.name.toLowerCase()));

  return {
    ...matched,
    products: mappedProducts,
  };
}

/**
 * Fetches published customer reviews / testimonials
 */
export async function getPublicReviews(): Promise<PublicReview[]> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .select("*")
        .eq("status", "PUBLISHED")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          customerName: r.customer_name,
          location: r.location || "USA",
          rating: Number(r.rating) || 5,
          reviewText: r.review_text,
          projectTitle: r.project_title || "Modular Home Build",
          imageUrl: r.image_url,
          status: r.status,
          isFeatured: Boolean(r.is_featured),
          displayOrder: Number(r.display_order) || 0,
          reviewDate: r.review_date || r.created_at,
        }));
      }
    }
  } catch (error) {
    console.warn("Supabase reviews fetch error:", error);
  }
  return [];
}

/**
 * Fetches published FAQs
 */
export async function getPublicFaqs(category?: string): Promise<PublicFaq[]> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from("faqs")
        .select("*")
        .eq("status", "PUBLISHED")
        .order("display_order", { ascending: true });

      if (category && category !== "ALL") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category || "General",
          pageSlug: f.page_slug || "all",
          status: f.status,
          displayOrder: Number(f.display_order) || 0,
        }));
      }
    }
  } catch (error) {
    console.warn("Supabase FAQs fetch error:", error);
  }
  return [];
}

/**
 * Fetches public global site settings
 */
export async function getPublicSettings() {
  try {
    return await getPublicGlobalSettings();
  } catch (e) {
    return null;
  }
}
