import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedMedia {
  productHandle: string;
  source_url: string;
  alt_text: string | null;
  position: number;
  media_type: string;
  source_id: string;
}

export function mapMediaRow(row: Record<string, any>, currentProductHandle: string, fallbackPosition: number): MappedMedia | null {
  const sourceUrl = String(row["Image Src"] || "").trim();
  if (!sourceUrl) return null;

  const productHandle = String(row["Handle"] || currentProductHandle).trim().toLowerCase();
  const altText = row["Image Alt Text"] ? String(row["Image Alt Text"]).trim() : null;
  const sourceId = String(row["Image ID"] || row["ID"] || "").trim();

  let position = fallbackPosition;
  if (row["Image Position"] !== undefined && row["Image Position"] !== "") {
    const pos = parseInt(String(row["Image Position"]), 10);
    if (!isNaN(pos)) position = pos;
  }

  let mediaType = "image";
  if (row["Image Type"] && String(row["Image Type"]).toLowerCase().includes("video")) {
    mediaType = "video";
  }

  return {
    productHandle,
    source_url: sourceUrl,
    alt_text: altText,
    position,
    media_type: mediaType,
    source_id: sourceId,
  };
}

export function validateMedia(item: MappedMedia, productExists: boolean): ValidationResult<MappedMedia> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.source_url) {
    errors.push({ field: "source_url", message: "Media source_url is required", severity: "ERROR" });
  } else if (!/^https?:\/\//i.test(item.source_url)) {
    errors.push({ field: "source_url", message: `Invalid media URL format: ${item.source_url}`, severity: "ERROR" });
  }

  if (!productExists) {
    errors.push({ field: "product_id", message: `Orphan media: parent product '${item.productHandle}' does not exist`, severity: "ERROR" });
  }

  return {
    isValid: errors.length === 0,
    data: item,
    errors,
    warnings,
  };
}
