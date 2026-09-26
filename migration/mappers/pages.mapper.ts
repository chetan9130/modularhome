import { cleanHtmlContent, cleanSeoTitle, cleanSeoDescription, BrandingAuditFinding } from "./branding_cleaner";
import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedPage {
  handle: string;
  title: string;
  body_html: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
  source_id: string;
  findings: BrandingAuditFinding[];
}

export function mapPageRow(row: Record<string, any>): MappedPage {
  const handle = String(row["Handle"] || "").trim().toLowerCase();
  const rawTitle = String(row["Title"] || "").trim();
  const rawBody = String(row["Body HTML"] || "");
  const sourceId = String(row["ID"] || "").trim();

  let published = true;
  if (row["Published"] !== undefined && row["Published"] !== "") {
    published = Boolean(row["Published"] === true || row["Published"] === "true");
  }

  const { cleanedHtml, findings } = cleanHtmlContent(rawBody, `Page: ${handle}`);
  const seoTitle = cleanSeoTitle(String(row["Metafield: title_tag [string]"] || row["SEO Title"] || ""), rawTitle);
  const seoDesc = cleanSeoDescription(String(row["Metafield: description_tag [string]"] || row["SEO Description"] || ""), cleanedHtml || rawTitle);

  return {
    handle,
    title: rawTitle,
    body_html: cleanedHtml,
    seo_title: seoTitle,
    seo_description: seoDesc,
    published,
    source_id: sourceId,
    findings,
  };
}

export function validatePage(item: MappedPage): ValidationResult<MappedPage> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.handle) {
    errors.push({ field: "handle", message: "Page handle is required", severity: "ERROR" });
  }

  if (!item.title) {
    errors.push({ field: "title", message: "Page title is required", severity: "ERROR" });
  }

  return {
    isValid: errors.length === 0,
    data: item,
    errors,
    warnings,
  };
}
