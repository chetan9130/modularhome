import fs from "fs";
import path from "path";
import { RESOURCE_ARTICLES, ResourceArticle } from "@/data/resources";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const BLOGS_FILE = path.join(DATA_DIR, "custom_blogs.json");

export interface StoredBlog {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string | string[];
  image: string;
  featured_image?: string;
  featuredImage?: string;
  date: string;
  published_at?: string;
  publishedAt?: string;
  author: string;
  author_name?: string;
  status: "PUBLISHED" | "DRAFT";
  categories?: string[];
  tags?: string[];
  embeddedVideoUrl?: string;
  embedded_video_url?: string;
  seoTitle?: string;
  seo_title?: string;
  metaDescription?: string;
  meta_description?: string;
  imageAltText?: string;
  image_alt_text?: string;
  canonicalUrl?: string;
  canonical_url?: string;
  keyTakeaways?: string[];
  key_takeaways?: string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Error creating data directory for blogs:", err);
  }
}

export function readBlogsFromStore(): StoredBlog[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(BLOGS_FILE)) {
      fs.writeFileSync(BLOGS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const data = fs.readFileSync(BLOGS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(BLOGS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    return parsed;
  } catch (error) {
    console.error("Error reading custom_blogs.json:", error);
    return [];
  }
}

export function writeBlogsToStore(blogs: StoredBlog[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to custom_blogs.json:", error);
  }
}

export function saveCustomBlog(blogData: Partial<StoredBlog> & { title: string; slug: string }): StoredBlog {
  const blogs = readBlogsFromStore();
  const cleanSlug = blogData.slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
  
  const existingIdx = blogs.findIndex(
    (b) => (blogData.id && b.id === blogData.id) || b.slug.toLowerCase() === cleanSlug
  );

  const now = new Date().toISOString();
  const rawDate = blogData.publishedAt || blogData.published_at || (existingIdx >= 0 ? blogs[existingIdx].publishedAt : now);
  
  let formattedDisplayDate = "Recent";
  try {
    const d = new Date(rawDate || now);
    if (!isNaN(d.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      formattedDisplayDate = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    }
  } catch {}

  const fullBlog: StoredBlog = {
    id: blogData.id || (existingIdx >= 0 ? blogs[existingIdx].id : `blog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    slug: cleanSlug,
    title: blogData.title,
    category: blogData.category || (Array.isArray(blogData.categories) && blogData.categories.length > 0 ? blogData.categories[0] : "Building Guides"),
    readTime: blogData.readTime || "5 min read",
    excerpt: blogData.excerpt || blogData.metaDescription || blogData.meta_description || "",
    content: blogData.content || "",
    image: blogData.featuredImage || blogData.featured_image || blogData.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    featuredImage: blogData.featuredImage || blogData.featured_image || blogData.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    featured_image: blogData.featuredImage || blogData.featured_image || blogData.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    date: formattedDisplayDate,
    publishedAt: rawDate,
    published_at: rawDate,
    author: blogData.author || blogData.author_name || "ModularHome Engineering Team",
    author_name: blogData.author || blogData.author_name || "ModularHome Engineering Team",
    status: (blogData.status as any) || "PUBLISHED",
    categories: Array.isArray(blogData.categories) ? blogData.categories : (blogData.category ? [blogData.category] : ["Building Guides"]),
    tags: Array.isArray(blogData.tags) ? blogData.tags : [],
    embeddedVideoUrl: blogData.embeddedVideoUrl || blogData.embedded_video_url,
    embedded_video_url: blogData.embeddedVideoUrl || blogData.embedded_video_url,
    seoTitle: blogData.seoTitle || blogData.seo_title || `${blogData.title} | ModularHome.com Guide`,
    seo_title: blogData.seoTitle || blogData.seo_title || `${blogData.title} | ModularHome.com Guide`,
    metaDescription: blogData.metaDescription || blogData.meta_description || blogData.excerpt,
    meta_description: blogData.metaDescription || blogData.meta_description || blogData.excerpt,
    imageAltText: blogData.imageAltText || blogData.image_alt_text || blogData.title,
    image_alt_text: blogData.imageAltText || blogData.image_alt_text || blogData.title,
    canonicalUrl: blogData.canonicalUrl || blogData.canonical_url,
    canonical_url: blogData.canonicalUrl || blogData.canonical_url,
    keyTakeaways: Array.isArray(blogData.keyTakeaways) ? blogData.keyTakeaways : (Array.isArray(blogData.key_takeaways) ? blogData.key_takeaways : []),
    key_takeaways: Array.isArray(blogData.keyTakeaways) ? blogData.keyTakeaways : (Array.isArray(blogData.key_takeaways) ? blogData.key_takeaways : []),
    createdAt: blogData.createdAt || (existingIdx >= 0 ? blogs[existingIdx].createdAt : now),
    created_at: blogData.createdAt || (existingIdx >= 0 ? blogs[existingIdx].createdAt : now),
    updatedAt: now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    blogs[existingIdx] = { ...blogs[existingIdx], ...fullBlog };
  } else {
    blogs.unshift(fullBlog);
  }

  writeBlogsToStore(blogs);
  return fullBlog;
}

export function deleteCustomBlog(idOrSlug: string): boolean {
  if (!idOrSlug) return false;
  const clean = idOrSlug.toLowerCase().trim().replace(/^\/+|\/+$/g, "");
  const blogs = readBlogsFromStore();
  
  const filtered = blogs.filter((b) => {
    const bId = (b.id || "").toLowerCase().trim();
    const bSlug = (b.slug || "").toLowerCase().trim().replace(/^\/+|\/+$/g, "");
    return bId !== clean && bSlug !== clean && b.id !== idOrSlug && b.slug !== idOrSlug;
  });

  if (filtered.length !== blogs.length) {
    writeBlogsToStore(filtered);
    return true;
  }
  return false;
}

export function getCustomBlogByIdOrSlug(idOrSlug: string): StoredBlog | null {
  if (!idOrSlug) return null;
  const clean = idOrSlug.toLowerCase().trim().replace(/^\/+|\/+$/g, "");
  const blogs = readBlogsFromStore();

  const found = blogs.find(
    (b) =>
      b.id.toLowerCase() === clean ||
      b.slug.toLowerCase() === clean ||
      b.slug.replace(/[^a-z0-9]/g, "") === clean.replace(/[^a-z0-9]/g, "")
  );

  return found || null;
}
