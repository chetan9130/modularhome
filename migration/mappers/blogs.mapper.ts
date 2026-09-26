import { cleanHtmlContent, cleanSeoTitle, cleanSeoDescription, BrandingAuditFinding } from "./branding_cleaner";
import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedBlogPost {
  blog_handle: string;
  handle: string;
  title: string;
  body_html: string;
  excerpt: string;
  author: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  source_id: string;
  findings: BrandingAuditFinding[];
}

export function mapBlogRow(row: Record<string, any>): MappedBlogPost {
  const blogHandle = String(row["Blog Handle"] || "news").trim().toLowerCase();
  const handle = String(row["Handle"] || "").trim().toLowerCase();
  const rawTitle = String(row["Title"] || "").trim();
  const rawBody = String(row["Body HTML"] || "");
  const rawExcerpt = String(row["Excerpt HTML"] || row["Summary HTML"] || row["Excerpt"] || "");
  const author = String(row["Author"] || "ModularHome Editorial Team").trim();
  const tags = String(row["Tags"] || "").trim();
  const sourceId = String(row["ID"] || "").trim();

  let publishedAt: string | null = null;
  if (row["Published At"]) {
    try {
      publishedAt = new Date(row["Published At"]).toISOString();
    } catch {
      publishedAt = new Date().toISOString();
    }
  }

  const { cleanedHtml: cleanBody, findings: bodyFindings } = cleanHtmlContent(rawBody, `Blog: ${blogHandle}/${handle}`);
  const { cleanedHtml: cleanExcerpt, findings: excerptFindings } = cleanHtmlContent(rawExcerpt, `Blog Excerpt: ${blogHandle}/${handle}`);

  const seoTitle = cleanSeoTitle(String(row["Metafield: title_tag [string]"] || row["SEO Title"] || ""), rawTitle);
  const seoDesc = cleanSeoDescription(String(row["Metafield: description_tag [string]"] || row["SEO Description"] || ""), cleanExcerpt || cleanBody || rawTitle);

  return {
    blog_handle: blogHandle,
    handle,
    title: rawTitle,
    body_html: cleanBody,
    excerpt: cleanExcerpt || rawTitle,
    author,
    tags,
    seo_title: seoTitle,
    seo_description: seoDesc,
    published_at: publishedAt,
    source_id: sourceId,
    findings: [...bodyFindings, ...excerptFindings],
  };
}

export function validateBlogPost(item: MappedBlogPost): ValidationResult<MappedBlogPost> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.handle) {
    errors.push({ field: "handle", message: "Blog post handle is required", severity: "ERROR" });
  }

  if (!item.title) {
    errors.push({ field: "title", message: "Blog post title is required", severity: "ERROR" });
  }

  return {
    isValid: errors.length === 0,
    data: item,
    errors,
    warnings,
  };
}
