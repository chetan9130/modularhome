import { StoredBlog } from "./blogStore";

export interface VideoMetadataInput {
  youtubeVideoId: string;
  title: string;
  description?: string;
  publishedAt?: string;
  thumbnail?: string;
  channelTitle?: string;
  duration?: string;
  views?: string;
  category?: string;
}

/**
 * Normalizes title into a clean, search-optimized URL slug
 */
export function generateSeoSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/**
 * Determines the most relevant content category based on title and description keywords
 */
export function categorizeVideoContent(title: string, description: string = ""): string {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("steel") || text.includes("frame") || text.includes("structure") || text.includes("engineering")) {
    return "Engineering & Steel";
  }
  if (text.includes("cost") || text.includes("price") || text.includes("budget") || text.includes("financing") || text.includes("roi")) {
    return "Cost & Financing";
  }
  if (text.includes("deliver") || text.includes("foundation") || text.includes("site prep") || text.includes("crane") || text.includes("permit")) {
    return "Construction Guides";
  }
  if (text.includes("interior") || text.includes("kitchen") || text.includes("bedroom") || text.includes("luxury") || text.includes("loft")) {
    return "Design & Architecture";
  }
  if (text.includes("cabin") || text.includes("cottage") || text.includes("tiny") || text.includes("retreat")) {
    return "Cabin Showcases";
  }
  if (text.includes("barndominium") || text.includes("barndo") || text.includes("clear span")) {
    return "Barndominiums";
  }
  
  return "Building Tours";
}

/**
 * Generates an optimized 155-character meta description with action-oriented hooks
 */
export function generateMetaDescription(title: string, description: string = ""): string {
  const cleanTitle = title.replace(/[|•\-_].*$/, "").trim();
  const summarySnippet = description
    ? description.split("\n")[0].replace(/[^\w\s.,!?-]/g, " ").trim()
    : "";

  let meta = `Watch our complete tour & walkthrough of the ${cleanTitle}. Discover precision modular construction, structural steel specs, and custom floor plans.`;
  if (summarySnippet && summarySnippet.length > 30 && summarySnippet.length < 130) {
    meta = `${cleanTitle}: ${summarySnippet}`;
  }

  if (meta.length > 158) {
    meta = meta.substring(0, 155).trim() + "...";
  }
  return meta;
}

/**
 * Extracts or generates 4–6 high-value architectural takeaways from the video
 */
export function generateKeyTakeaways(title: string, description: string = ""): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const takeaways: string[] = [];

  takeaways.push("Precision factory manufacturing ensures 100% weather-tight joints and millimeter structural accuracy.");

  if (text.includes("steel") || text.includes("frame") || text.includes("rafter")) {
    takeaways.push("Heavy-duty commercial-grade steel framing provides superior seismic, wind (150+ MPH), and snow load resilience.");
  } else {
    takeaways.push("Engineered high-tensile structural framework outperforms conventional site-built stick framing.");
  }

  if (text.includes("loft") || text.includes("cathedral") || text.includes("ceiling")) {
    takeaways.push("Open-concept architectural layout with soaring cathedral ceilings and versatile loft living space.");
  } else if (text.includes("sq ft") || text.includes("bedroom") || text.includes("bath")) {
    takeaways.push("Optimized multi-functional floor plan designed for maximum thermal comfort and zero wasted hallway square footage.");
  } else {
    takeaways.push("Modern ergonomic layout engineered for flexible family living, natural lighting, and long-term durability.");
  }

  if (text.includes("insulat") || text.includes("energy") || text.includes("solar") || text.includes("r-")) {
    takeaways.push("Continuous closed-cell spray foam insulation envelope delivering up to 40% reduction in annual heating and cooling costs.");
  } else {
    takeaways.push("High-performance thermal building envelope designed to exceed modern Energy Star standards in all climate zones.");
  }

  takeaways.push("Rapid site assembly and turn-key delivery in weeks rather than typical 8–12 month traditional building delays.");

  return takeaways;
}

/**
 * Estimates reading time based on total word count
 */
export function calculateReadTime(text: string): string {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 180));
  return `${minutes} min read`;
}

/**
 * Generates an SEO-rich, multi-section article from YouTube video metadata
 */
export function generateSeoBlogFromVideo(video: VideoMetadataInput): StoredBlog {
  const cleanTitle = video.title.replace(/[|•\-_].*$/, "").trim() || video.title;
  const slug = generateSeoSlug(video.title);
  const category = video.category || categorizeVideoContent(video.title, video.description);
  const metaDesc = generateMetaDescription(video.title, video.description);
  const takeaways = generateKeyTakeaways(video.title, video.description);
  
  const videoId = video.youtubeVideoId;
  const videoEmbedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  const videoWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const highResThumbnail = video.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const now = new Date();
  const rawDate = video.publishedAt || now.toISOString();
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const displayDate = `${months[now.getUTCMonth()]} ${now.getUTCDate()}, ${now.getUTCFullYear()}`;

  // Build high-intent SEO content sections
  const contentSections: string[] = [
    `Welcome to the comprehensive video tour and engineering overview of **${cleanTitle}**. As demand for faster, stronger, and more energy-efficient housing continues to surge across North America, precision off-site modular construction has emerged as the premier choice for discerning homeowners, remote cabin builders, and developers alike. In this full video breakdown, we explore the architectural design, structural engineering, and interior craftsmanship that make this build a standout model in our catalog.`,

    `### In-Depth Video Walkthrough & Architectural Features\n\n` +
    `Watching the video tour above offers a first-hand look into the spatial ergonomics and premium finishes of this model. Built inside our controlled manufacturing facility, every structural joist, stud, and truss is fabricated with sub-millimeter tolerances. Unlike traditional site-built homes that are exposed to months of rain, snow, and humidity during the framing stage, our modular steel and hybrid structures are built under strict climate-controlled conditions, ensuring materials remain dry, straight, and free from warping or mold vulnerabilities.`,

    `### Engineered Structural Framework & All-Weather Durability\n\n` +
    `At the heart of the **${cleanTitle}** is our heavy-duty engineered framing system. By integrating commercial-grade steel rafters with precision wood-clad purlins and high-tensile fasteners, this structure is rated to endure extreme weather conditions—including 150+ MPH wind gusts, heavy snow loads exceeding 60 PSF, and high-seismic zones. Furthermore, our continuous insulation envelope prevents thermal bridging, ensuring your indoor climate stays effortlessly comfortable year-round while dramatically lowering monthly heating and cooling bills.`,

    `### Turnkey Delivery, Permitting & Rapid Site Installation\n\n` +
    `One of the biggest advantages highlighted in this walkthrough is the streamlined timeline from blueprint finalization to move-in day. Traditional home construction frequently spans 9 to 14 months with unpredictable contractor delays. In contrast, our precision factory process allows the home to be built in tandem with your foundation and site preparation work. Once the foundation is poured and cured, our crane delivery team secures and seals the modular building in just a matter of days.`,

    `### Frequently Asked Questions About This Build\n\n` +
    `**Q: Can this floor plan be customized for specific property dimensions?**\n` +
    `A: Absolutely. Every modular plan in our portfolio can be customized to adjust bedroom counts, ceiling heights, window orientations, and porch extensions to match your land's topography and local building codes.\n\n` +
    `**Q: How does financing work for modular homes?**\n` +
    `A: Modular homes are classified as permanent real property and qualify for all standard conventional mortgages, FHA construction loans, and VA loans, appreciating in value just like traditional custom stick-built residences.\n\n` +
    `**Q: How do I get construction blueprints and engineering calculations for permitting?**\n` +
    `A: You can download complete architectural plans, CAD files, and structural steel specifications directly through our resources portal or request a dedicated consultation with our engineering team.`
  ];

  const fullContentString = contentSections.join("\n\n");
  const readTime = calculateReadTime(fullContentString);

  // SEO tags
  const tags = [
    "Modular Homes",
    "Steel Construction",
    category,
    "Video Tour",
    "Prefab Architecture",
    "Building Blueprints",
    "Modern Living"
  ];

  const blogPost: StoredBlog = {
    id: `blog-yt-${videoId}`,
    slug,
    title: `${cleanTitle}: Video Walkthrough & Architectural Guide`,
    category,
    readTime,
    excerpt: metaDesc,
    content: contentSections,
    image: highResThumbnail,
    featuredImage: highResThumbnail,
    featured_image: highResThumbnail,
    date: displayDate,
    publishedAt: rawDate,
    published_at: rawDate,
    author: video.channelTitle || "ModularHome Engineering Team",
    author_name: video.channelTitle || "ModularHome Engineering Team",
    status: "PUBLISHED",
    categories: [category, "Video Guides"],
    tags,
    embeddedVideoUrl: videoWatchUrl,
    embedded_video_url: videoWatchUrl,
    seoTitle: `${cleanTitle} Video Tour & Floor Plan Guide | ModularHome.com`,
    seo_title: `${cleanTitle} Video Tour & Floor Plan Guide | ModularHome.com`,
    metaDescription: metaDesc,
    meta_description: metaDesc,
    imageAltText: `${cleanTitle} modular steel home video walkthrough and floor plan`,
    image_alt_text: `${cleanTitle} modular steel home video walkthrough and floor plan`,
    canonicalUrl: `https://modularhome.com/resources/${slug}`,
    canonical_url: `https://modularhome.com/resources/${slug}`,
    keyTakeaways: takeaways,
    key_takeaways: takeaways,
    createdAt: rawDate,
    created_at: rawDate,
    updatedAt: now.toISOString(),
    updated_at: now.toISOString(),
  };

  return blogPost;
}
