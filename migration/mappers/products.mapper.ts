import { cleanHtmlContent, cleanSeoTitle, cleanSeoDescription, BrandingAuditFinding } from "./branding_cleaner";
import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedProduct {
  handle: string;
  title: string;
  description_html: string;
  vendor: string;
  product_type: string;
  status: string;
  seo_title: string;
  seo_description: string;
  source_id: string;
  published_at: string | null;
  findings: BrandingAuditFinding[];
}

export function mapProductRow(row: Record<string, any>): MappedProduct {
  const handle = String(row["Handle"] || "").trim().toLowerCase();
  const rawTitle = String(row["Title"] || "").trim();
  const rawBody = String(row["Body HTML"] || "");
  const vendor = String(row["Vendor"] || "ModularHome").trim();
  const productType = String(row["Type"] || row["Product Type"] || "Modular Home").trim();
  
  let status = String(row["Status"] || "active").toLowerCase().trim();
  if (status === "active") status = "active";
  else if (status === "archived") status = "archived";
  else if (status === "draft") status = "draft";
  else status = "active";

  const sourceId = String(row["ID"] || "").trim();

  let publishedAt: string | null = null;
  if (row["Published At"]) {
    try {
      publishedAt = new Date(row["Published At"]).toISOString();
    } catch {
      publishedAt = new Date().toISOString();
    }
  }

  const { cleanedHtml, findings } = cleanHtmlContent(rawBody, `Product: ${handle}`);
  const seoTitle = cleanSeoTitle(String(row["Metafield: title_tag [string]"] || row["SEO Title"] || ""), rawTitle);
  const seoDesc = cleanSeoDescription(String(row["Metafield: description_tag [string]"] || row["SEO Description"] || ""), cleanedHtml || rawTitle);

  return {
    handle,
    title: rawTitle,
    description_html: cleanedHtml,
    vendor,
    product_type: productType,
    status,
    seo_title: seoTitle,
    seo_description: seoDesc,
    source_id: sourceId,
    published_at: publishedAt,
    findings,
  };
}

export function validateProduct(item: MappedProduct): ValidationResult<MappedProduct> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.handle) {
    errors.push({ field: "handle", message: "Product handle is required", severity: "ERROR" });
  }

  if (!item.title) {
    errors.push({ field: "title", message: "Product title is required", severity: "ERROR" });
  }

  if (!item.source_id) {
    warnings.push({ field: "source_id", message: "Missing stable source_id", severity: "WARN" });
  }

  return {
    isValid: errors.length === 0,
    data: item,
    errors,
    warnings,
  };
}
