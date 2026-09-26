import { cleanHtmlContent, cleanSeoTitle, cleanSeoDescription, BrandingAuditFinding } from "./branding_cleaner";
import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedCollection {
  handle: string;
  title: string;
  description_html: string;
  seo_title: string;
  seo_description: string;
  source_id: string;
  published: boolean;
  rawImageSrc?: string;
  rawImageAlt?: string;
  findings: BrandingAuditFinding[];
}

export function mapCollectionRow(row: Record<string, any>): MappedCollection {
  const handle = String(row["Handle"] || "").trim().toLowerCase();
  const rawTitle = String(row["Title"] || "").trim();
  const rawBody = String(row["Body HTML"] || "");
  const sourceId = String(row["ID"] || "").trim();

  // Published detection: In Matrixify, Published can be true/false or string
  let published = true;
  if (row["Published: Online Store"] !== undefined && row["Published: Online Store"] !== "") {
    published = Boolean(row["Published: Online Store"] === true || row["Published: Online Store"] === "true");
  } else if (row["Published"] !== undefined && row["Published"] !== "") {
    published = Boolean(row["Published"] === true || row["Published"] === "true");
  }

  const { cleanedHtml, findings } = cleanHtmlContent(rawBody, `Collection: ${handle}`);
  const seoTitle = cleanSeoTitle(String(row["Metafield: title_tag [string]"] || row["SEO Title"] || ""), rawTitle);
  const seoDesc = cleanSeoDescription(String(row["Metafield: description_tag [string]"] || row["SEO Description"] || ""), cleanedHtml || rawTitle);

  return {
    handle,
    title: rawTitle,
    description_html: cleanedHtml,
    seo_title: seoTitle,
    seo_description: seoDesc,
    source_id: sourceId,
    published,
    rawImageSrc: row["Image Src"] ? String(row["Image Src"]).trim() : undefined,
    rawImageAlt: row["Image Alt Text"] ? String(row["Image Alt Text"]).trim() : undefined,
    findings,
  };
}

export function validateCollection(item: MappedCollection): ValidationResult<MappedCollection> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.handle) {
    errors.push({ field: "handle", message: "Collection handle is required", severity: "ERROR" });
  } else if (!/^[a-z0-9_-]+$/i.test(item.handle)) {
    warnings.push({ field: "handle", message: `Handle '${item.handle}' contains non-standard characters`, severity: "WARN" });
  }

  if (!item.title) {
    errors.push({ field: "title", message: "Collection title is required", severity: "ERROR" });
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
