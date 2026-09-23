import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { INITIAL_FLOOR_PLANS, FloorPlan } from "@/data/floorPlans";
import { BUILDING_MODELS, BuildingModel } from "@/data/models";
import { RESOURCE_ARTICLES } from "@/data/resources";
import { getCustomPageBySlug, readPagesFromStore } from "./pageStore";
import { getPublicGlobalSettings } from "./settings";

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
    videoUrl: p.video_url || p.videoUrl || p.video || "",
    videoDuration: p.video_duration || p.videoDuration || "",
    videoTitle: p.video_title || p.videoTitle || "",
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
    let blogsList: any[] = [];

    // 1. Read local custom blogs created in Admin
    const localBlogs = (await import("./blogStore")).readBlogsFromStore();
    const publishedLocal = localBlogs.filter((b) => b.status === "PUBLISHED" || !b.status);
    for (const lb of publishedLocal) {
      blogsList.push({
        id: lb.id,
        title: lb.title,
        slug: lb.slug,
        excerpt: lb.excerpt || lb.metaDescription || lb.meta_description || "",
        content: Array.isArray(lb.content) ? lb.content : [lb.content],
        category: lb.category || (Array.isArray(lb.categories) ? lb.categories[0] : "Building Guides"),
        readTime: lb.readTime || "5 min read",
        date: lb.date || "Recent",
        image: lb.featuredImage || lb.featured_image || lb.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        author: lb.author || lb.author_name || "ModularHome Engineering Team",
        embeddedVideoUrl: lb.embeddedVideoUrl || lb.embedded_video_url,
        seoTitle: lb.seoTitle || lb.seo_title,
        metaDescription: lb.metaDescription || lb.meta_description,
        tags: Array.isArray(lb.tags) ? lb.tags : [],
        keyTakeaways: Array.isArray(lb.keyTakeaways) ? lb.keyTakeaways : (Array.isArray(lb.key_takeaways) ? lb.key_takeaways : undefined),
      });
    }

    // 2. Read from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("blogs")
          .select("*")
          .eq("status", "PUBLISHED")
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (params?.category && params.category !== "ALL" && params.category !== "All") {
          query = query.eq("category", params.category);
        }

        const { data: blogs, error } = await query;
        if (!error && blogs && blogs.length > 0) {
          const existingIds = new Set(blogsList.map((b) => b.slug.toLowerCase()));
          for (const b of blogs) {
            if (!existingIds.has((b.slug || "").toLowerCase())) {
              let formattedDate = "Recent";
              if (b.published_at) {
                try {
                  const d = new Date(b.published_at);
                  if (!isNaN(d.getTime())) {
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    formattedDate = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
                  }
                } catch {}
              }
              blogsList.push({
                id: b.id,
                title: b.title,
                slug: b.slug,
                excerpt: b.excerpt || b.meta_description || "",
                content: Array.isArray(b.content) ? b.content : (typeof b.content === "string" ? [b.content] : []),
                category: b.category || (Array.isArray(b.categories) ? b.categories[0] : "Building Guides"),
                readTime: b.read_time || "5 min read",
                date: formattedDate,
                image: b.featured_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                author: b.author_name || b.author || "ModularHome Engineering Team",
                embeddedVideoUrl: b.embedded_video_url,
                seoTitle: b.seo_title,
                metaDescription: b.meta_description,
                tags: Array.isArray(b.tags) ? b.tags : [],
                keyTakeaways: Array.isArray(b.key_takeaways) ? b.key_takeaways : undefined,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Supabase fetch blogs warning:", err);
      }
    }

    // 3. Merge with static RESOURCE_ARTICLES so full educational hub is always populated
    const existingSlugs = new Set(blogsList.map((b) => b.slug.toLowerCase()));
    const merged = [...blogsList];
    for (const resArt of RESOURCE_ARTICLES) {
      if (!existingSlugs.has(resArt.slug.toLowerCase())) {
        merged.push(resArt);
      }
    }

    let filtered = merged;
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
    return filterResourceArticles(RESOURCE_ARTICLES, params);
  }
}

function filterResourceArticles(articles: any[], params?: { category?: string; search?: string }) {
  let res = articles;
  if (params?.category && params.category !== "ALL" && params.category !== "All") {
    res = res.filter((a) => (a.category || "").toLowerCase() === params.category!.toLowerCase());
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    res = res.filter(
      (a) =>
        (a.title || "").toLowerCase().includes(q) ||
        (a.excerpt || "").toLowerCase().includes(q) ||
        (a.category || "").toLowerCase().includes(q)
    );
  }
  return res;
}

/**
 * Fetches a single published article / blog by slug or ID
 */
export async function getPublicBlogBySlug(slugParam: string) {
  if (!slugParam) return null;
  const cleanSlug = decodeURIComponent(slugParam).toLowerCase().trim().replace(/^\/+|\/+$/g, "");

  try {
    // 1. Check local persistent store
    const localBlog = (await import("./blogStore")).getCustomBlogByIdOrSlug(cleanSlug);
    if (localBlog) {
      return {
        id: localBlog.id,
        title: localBlog.title,
        slug: localBlog.slug,
        excerpt: localBlog.excerpt || localBlog.metaDescription || localBlog.meta_description || "",
        content: Array.isArray(localBlog.content) ? localBlog.content : [localBlog.content],
        category: localBlog.category || (Array.isArray(localBlog.categories) ? localBlog.categories[0] : "Building Guides"),
        readTime: localBlog.readTime || "5 min read",
        date: localBlog.date || "Recent",
        image: localBlog.featuredImage || localBlog.featured_image || localBlog.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        author: localBlog.author || localBlog.author_name || "ModularHome Engineering Team",
        embeddedVideoUrl: localBlog.embeddedVideoUrl || localBlog.embedded_video_url,
        seoTitle: localBlog.seoTitle || localBlog.seo_title || `${localBlog.title} | ModularHome.com Guide`,
        metaDescription: localBlog.metaDescription || localBlog.meta_description || localBlog.excerpt,
        tags: Array.isArray(localBlog.tags) ? localBlog.tags : [],
        keyTakeaways: Array.isArray(localBlog.keyTakeaways) ? localBlog.keyTakeaways : (Array.isArray(localBlog.key_takeaways) ? localBlog.key_takeaways : undefined),
      };
    }

    // 2. Check Supabase
    if (isSupabaseConfigured()) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);
      const orFilter = isUuid
        ? `slug.eq.${cleanSlug},id.eq.${cleanSlug}`
        : `slug.eq.${cleanSlug}`;

      const { data: blog, error } = await supabaseAdmin
        .from("blogs")
        .select("*")
        .or(orFilter)
        .eq("status", "PUBLISHED")
        .maybeSingle();

      if (!error && blog) {
        let formattedDate = "Recent";
        if (blog.published_at) {
          try {
            const d = new Date(blog.published_at);
            if (!isNaN(d.getTime())) {
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              formattedDate = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
            }
          } catch {}
        }
        return {
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || blog.meta_description || "",
          content: Array.isArray(blog.content) ? blog.content : (typeof blog.content === "string" ? [blog.content] : []),
          category: blog.category || (Array.isArray(blog.categories) ? blog.categories[0] : "Building Guides"),
          readTime: blog.read_time || "5 min read",
          date: formattedDate,
          image: blog.featured_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
          author: blog.author_name || blog.author || "ModularHome Engineering Team",
          embeddedVideoUrl: blog.embedded_video_url,
          seoTitle: blog.seo_title || `${blog.title} | ModularHome.com Guide`,
          metaDescription: blog.meta_description || blog.excerpt,
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          keyTakeaways: Array.isArray(blog.key_takeaways) ? blog.key_takeaways : undefined,
        };
      }
    }

    // 3. Check static RESOURCE_ARTICLES
    const found = RESOURCE_ARTICLES.find(
      (a) => a.slug.toLowerCase() === cleanSlug || a.id.toLowerCase() === cleanSlug
    );
    return found || null;
  } catch (e) {
    const found = RESOURCE_ARTICLES.find(
      (a) => a.slug.toLowerCase() === cleanSlug || a.id.toLowerCase() === cleanSlug
    );
    return found || null;
  }
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
  content?: string;
  status: string;
  featuredImage?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  sections?: PageSection[];
}

const FALLBACK_PAGES: CmsPage[] = [
  {
    id: "page-warranty",
    title: "Warranty & Engineering Certifications",
    slug: "warranty-certifications",
    subtitle: "Comprehensive 50-Year Structural Steel & 10-Year Weatherproofing Guarantee",
    content: `<h2>50-Year Structural Warranty</h2>
<p>Every ModularHome structure is built with precision cold-formed galvanized steel trusses and framing members engineered to withstand hurricane winds (up to 150 MPH) and extreme snow loads (up to 50 PSF). Our structural frames are guaranteed against rust-through, rot, warping, and seismic failure for 50 full years.</p>

<h3>What Is Covered</h3>
<ul>
  <li><strong>Structural Steel Frame:</strong> 50-year non-prorated structural integrity warranty.</li>
  <li><strong>Roofing & Thermal Envelope:</strong> 25-year manufacturer standing seam roof & weather barrier warranty.</li>
  <li><strong>Plumbing & Electrical:</strong> 10-year comprehensive factory installed systems warranty.</li>
  <li><strong>Interior Fixtures & Appliances:</strong> Full manufacturer warranties passed directly to the homeowner.</li>
</ul>

<h3>IBC & State Modular Certifications</h3>
<p>All plans and builds carry stamped state engineering approvals and comply with all applicable International Building Codes (IBC) and International Residential Codes (IRC).</p>`,
    status: "PUBLISHED",
    featuredImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1600&q=80",
    seoTitle: "Warranty & Engineering Certifications | ModularHome.com",
    metaDescription: "Learn about ModularHome.com's 50-year structural warranty, IBC engineering certifications, and quality standards.",
    sections: [
      {
        id: "sec-trust-1",
        type: "TRUST",
        title: "Built For Generations",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "sec-how-1",
        type: "HOW_IT_WORKS",
        title: "Our Precision Build Quality",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "sec-cta-1",
        type: "CTA",
        title: "Ready to Build Your Certified Modular Home?",
        subtitle: "Speak with an architectural housing advisor today or get an instant engineering estimate.",
        displayOrder: 3,
        isVisible: true,
      }
    ]
  },
  {
    id: "page-privacy",
    title: "Privacy Policy",
    slug: "privacy-policy",
    subtitle: "How ModularHome.com collects, uses, and protects your information",
    content: `<h2>Your Privacy Matters</h2>
<p>At ModularHome.com, we respect your privacy and are committed to protecting your personal data. This privacy policy describes how we handle information collected on our website, quotation wizards, and consultation forms.</p>

<h3>Information We Collect</h3>
<p>We may collect personal details such as your name, email address, phone number, delivery ZIP code, and floor plan preferences when you request a custom price quote, upload blueprints, or contact our team.</p>

<h3>How We Use Your Information</h3>
<ul>
  <li>To generate accurate regional housing quotations and delivery estimates.</li>
  <li>To connect you with certified builders and logistics partners in your area.</li>
  <li>To provide customer support and project updates.</li>
</ul>

<p>We do not sell your personal information to third-party marketing companies.</p>`,
    status: "PUBLISHED",
    seoTitle: "Privacy Policy | ModularHome.com",
    metaDescription: "Read the ModularHome.com privacy policy to understand how we protect your personal and project information.",
  },
  {
    id: "page-terms",
    title: "Terms of Service",
    slug: "terms-of-service",
    subtitle: "Terms and conditions governing the use of ModularHome.com services and marketplace",
    content: `<h2>Terms of Use</h2>
<p>By accessing or using ModularHome.com, you agree to comply with and be bound by these terms of service.</p>

<h3>Modular Home Quotes & Estimates</h3>
<p>All pricing estimates provided by our online calculators and quotation tools are preliminary approximations based on standard site conditions. Final binding contracts are subject to local site inspection, foundation engineering, and local municipal zoning requirements.</p>

<h3>Architectural Plans & CAD Licensing</h3>
<p>Purchased floor plans and blueprints are licensed for single-structure construction unless a multi-use developer license is explicitly issued.</p>`,
    status: "PUBLISHED",
    seoTitle: "Terms of Service | ModularHome.com",
    metaDescription: "Terms of service and customer agreements for ModularHome.com.",
  }
];

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
    slug: p.slug || p.id,
    subtitle: p.subtitle || "",
    content: p.content || "",
    status: p.status || "PUBLISHED",
    featuredImage: p.featured_image || p.featuredImage || "",
    seoTitle: p.seo_title || p.seoTitle || `${p.title} | ModularHome.com`,
    metaDescription: p.meta_description || p.metaDescription || p.subtitle || "",
    canonicalUrl: p.canonical_url || p.canonicalUrl || "",
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
    sections: formattedSections,
  };
}

/**
 * Fetches a single published page by slug (or ID) and its associated visible sections
 */
export async function getPublicPageBySlug(slugParam: string): Promise<CmsPage | null> {
  if (!slugParam) return null;
  const cleanSlug = decodeURIComponent(slugParam).toLowerCase().trim().replace(/^\/+|\/+$/g, "");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

  try {
    if (isSupabaseConfigured()) {
      // 1. Fetch page from Supabase with flexible slug matching (and safe UUID checking)
      const orFilter = isUuid
        ? `slug.eq.${cleanSlug},slug.eq./${cleanSlug},slug.eq.pages/${cleanSlug},slug.eq./pages/${cleanSlug},id.eq.${cleanSlug}`
        : `slug.eq.${cleanSlug},slug.eq./${cleanSlug},slug.eq.pages/${cleanSlug},slug.eq./pages/${cleanSlug}`;

      const { data: pages, error: pageError } = await supabaseAdmin
        .from("pages")
        .select("*")
        .or(orFilter);

      if (!pageError && pages && pages.length > 0) {
        // Find published or active page (fallback to first if single)
        const page = pages.find((p) => {
          const st = String(p.status || "").toUpperCase();
          return st === "PUBLISHED" || st === "ACTIVE" || !st;
        }) || pages[0];

        // 2. Fetch page sections from Supabase if page.id is UUID
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

        // Also fetch any local sections for this slug/id
        const localSecs = getCustomPageBySlug(cleanSlug)?.sections || getCustomPageBySlug(page.slug)?.sections || [];
        const formatted = formatCmsPage(page, dbSections);
        
        // Merge with local sections if any
        if (localSecs.length > 0) {
          const existingIds = new Set((formatted.sections || []).map((s) => s.id));
          for (const ls of localSecs) {
            if (!existingIds.has(ls.id) && ls.isVisible !== false) {
              formatted.sections = formatted.sections || [];
              formatted.sections.push(ls);
              existingIds.add(ls.id);
            }
          }
          formatted.sections?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }

        return formatted;
      }
    }

    // 3. Check persistent custom pages store
    const storedPage = getCustomPageBySlug(cleanSlug);
    if (storedPage) return storedPage;

    // 4. Fallback to static mock pages if DB unavailable or page matches mock
    const fallback = FALLBACK_PAGES.find(
      (p) =>
        p.slug.toLowerCase() === cleanSlug ||
        p.id === cleanSlug ||
        p.slug.replace(/[^a-z0-9]/g, "") === cleanSlug.replace(/[^a-z0-9]/g, "")
    );

    return fallback || null;
  } catch (error) {
    console.error("Error fetching public page by slug:", error);
    const storedPage = getCustomPageBySlug(cleanSlug);
    if (storedPage) return storedPage;

    const fallback = FALLBACK_PAGES.find(
      (p) => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug
    );
    return fallback || null;
  }
}

/**
 * Fetches all published CMS pages for site navigation, sitemap, and directory listings
 */
export async function getPublicPages(): Promise<CmsPage[]> {
  try {
    const localPages = readPagesFromStore().filter((p) => p.status === "PUBLISHED");

    if (!isSupabaseConfigured()) {
      return localPages;
    }

    const { data: dbPages, error } = await supabaseAdmin
      .from("pages")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false });

    const formattedDb = (!error && dbPages && dbPages.length > 0)
      ? dbPages.map((p) => formatCmsPage(p))
      : [];

    // Merge DB pages with local published pages
    const existingSlugs = new Set(formattedDb.map((p) => p.slug.toLowerCase()));
    const merged = [...formattedDb];

    for (const lp of localPages) {
      if (!existingSlugs.has(lp.slug.toLowerCase())) {
        merged.push(lp);
        existingSlugs.add(lp.slug.toLowerCase());
      }
    }

    return merged;
  } catch (error) {
    console.error("Error fetching public pages:", error);
    const localPages = readPagesFromStore().filter((p) => p.status === "PUBLISHED");
    return localPages;
  }
}
