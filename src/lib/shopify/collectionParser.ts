import * as XLSX from "xlsx";
import { cleanHtmlContent, cleanSeoTitle, cleanSeoDescription, BrandingAuditFinding } from "../../../migration/mappers/branding_cleaner";
import { ValidationError, ValidationResult, RejectedRecord } from "../../../migration/validators/types";

export type ColumnClassification =
  | "SUPPORTED"
  | "RELATIONSHIP"
  | "PRESERVED-METADATA"
  | "IGNORED-SAFELY"
  | "UNSUPPORTED";

export interface ColumnClassificationDetail {
  header: string;
  classification: ColumnClassification;
  destination: string;
  notes: string;
}

export interface CollectionRuleCondition {
  command?: string;
  field?: string;
  relation?: string;
  value?: string;
  match?: string;
}

export interface CollectionProductLink {
  collectionHandle: string;
  productHandle?: string;
  productId?: string;
  position?: number;
}

export interface NormalizedCollection {
  source_id: string;
  handle: string;
  title: string;
  description_html: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
  image_src?: string;
  image_alt?: string;
  sort_order?: string;
  rules: CollectionRuleCondition[];
  product_links: CollectionProductLink[];
  product_count: number;
  metadata: Record<string, any>;
  findings: BrandingAuditFinding[];
}

export interface HeaderAnalysisResult {
  isMatrixifyFormat: boolean;
  totalHeaders: number;
  supportedCount: number;
  relationshipCount: number;
  preservedMetadataCount: number;
  ignoredSafelyCount: number;
  unsupportedCount: number;
  columns: ColumnClassificationDetail[];
}

export interface ParseCollectionsResult {
  headerAnalysis: HeaderAnalysisResult;
  sourceRowCount: number;
  uniqueCollectionCount: number;
  validCollections: NormalizedCollection[];
  rejectedRecords: RejectedRecord[];
  totalRulesCount: number;
  totalProductLinksCount: number;
  brandingFindingsCount: number;
}

/**
 * Standard Matrixify / Shopify collection column mappings
 */
export const MATRIXIFY_COLLECTION_COLUMN_RULES: Record<
  string,
  { classification: ColumnClassification; destination: string; notes: string }
> = {
  "ID": { classification: "SUPPORTED", destination: "collections.source_id", notes: "Primary Shopify collection ID for idempotent sync" },
  "Handle": { classification: "SUPPORTED", destination: "collections.handle", notes: "Unique URL slug / handle" },
  "Title": { classification: "SUPPORTED", destination: "collections.title", notes: "Collection display name" },
  "Body HTML": { classification: "SUPPORTED", destination: "collections.description_html", notes: "HTML description (branding-cleaned)" },
  "Sort Order": { classification: "SUPPORTED", destination: "collections.metadata.sort_order", notes: "Collection product sort algorithm" },
  "Image Src": { classification: "SUPPORTED", destination: "collections.image", notes: "Collection header/banner image URL" },
  "Image Alt Text": { classification: "SUPPORTED", destination: "collections.image_alt_text", notes: "Image accessibility alt text" },
  "Metafield: title_tag [string]": { classification: "SUPPORTED", destination: "collections.seo_title", notes: "Custom SEO title" },
  "Metafield: description_tag [string]": { classification: "SUPPORTED", destination: "collections.seo_description", notes: "Custom SEO meta description" },
  "SEO Title": { classification: "SUPPORTED", destination: "collections.seo_title", notes: "Alternative SEO title column" },
  "SEO Description": { classification: "SUPPORTED", destination: "collections.seo_description", notes: "Alternative SEO description column" },
  "Published": { classification: "SUPPORTED", destination: "collections.published", notes: "Generic publish flag" },
  "Published: Online Store": { classification: "SUPPORTED", destination: "collections.published", notes: "Online store publish visibility" },
  "Updated At": { classification: "SUPPORTED", destination: "collections.updated_at", notes: "Source update timestamp" },

  // Relationships
  "Sort: Product ID": { classification: "RELATIONSHIP", destination: "product_collections.product_id", notes: "Associated Shopify Product ID" },
  "Sort: Product Handle": { classification: "RELATIONSHIP", destination: "product_collections (by handle)", notes: "Associated Product Slug" },
  "Sort: Position": { classification: "RELATIONSHIP", destination: "product_collections.position", notes: "Product position index within collection" },

  // Preserved Metadata
  "Inclusion: Type": { classification: "PRESERVED-METADATA", destination: "metadata.inclusion_type", notes: "Smart collection inclusion rule" },
  "Inclusion: Match": { classification: "PRESERVED-METADATA", destination: "metadata.inclusion_match", notes: "Smart collection match condition" },
  "Condition: Command": { classification: "PRESERVED-METADATA", destination: "metadata.rules.command", notes: "Smart rule command" },
  "Condition: Field": { classification: "PRESERVED-METADATA", destination: "metadata.rules.field", notes: "Smart rule field target" },
  "Condition: Relation": { classification: "PRESERVED-METADATA", destination: "metadata.rules.relation", notes: "Smart rule operator/relation" },
  "Condition: Value": { classification: "PRESERVED-METADATA", destination: "metadata.rules.value", notes: "Smart rule match value" },
  "Condition: Match": { classification: "PRESERVED-METADATA", destination: "metadata.rules.match", notes: "Smart rule condition conjunction" },
  "Source: ID": { classification: "PRESERVED-METADATA", destination: "metadata.source.id", notes: "Matrixify source tracking ID" },
  "Source: Command": { classification: "PRESERVED-METADATA", destination: "metadata.source.command", notes: "Matrixify source command" },
  "Source: Type": { classification: "PRESERVED-METADATA", destination: "metadata.source.type", notes: "Matrixify source collection type" },
  "Source: Title": { classification: "PRESERVED-METADATA", destination: "metadata.source.title", notes: "Matrixify source title" },
  "Source: Description": { classification: "PRESERVED-METADATA", destination: "metadata.source.description", notes: "Matrixify source description" },
  "Metafield: ess_grid_gallery.ess_grid_gallery_id [number_integer]": { classification: "PRESERVED-METADATA", destination: "metadata.ess_grid_gallery_id", notes: "Legacy gallery plugin metafield" },
  "Published: Google & YouTube": { classification: "PRESERVED-METADATA", destination: "metadata.channels.google_youtube", notes: "Channel publish state" },
  "Published At: Google & YouTube": { classification: "PRESERVED-METADATA", destination: "metadata.channels.google_youtube_at", notes: "Channel publish timestamp" },
  "Published: Inbox": { classification: "PRESERVED-METADATA", destination: "metadata.channels.inbox", notes: "Channel publish state" },
  "Published At: Inbox": { classification: "PRESERVED-METADATA", destination: "metadata.channels.inbox_at", notes: "Channel publish timestamp" },
  "Published At: Online Store": { classification: "PRESERVED-METADATA", destination: "metadata.channels.online_store_at", notes: "Online store publish timestamp" },
  "Published: Pinterest": { classification: "PRESERVED-METADATA", destination: "metadata.channels.pinterest", notes: "Channel publish state" },
  "Published At: Pinterest": { classification: "PRESERVED-METADATA", destination: "metadata.channels.pinterest_at", notes: "Channel publish timestamp" },
  "Published: Point of Sale": { classification: "PRESERVED-METADATA", destination: "metadata.channels.pos", notes: "Channel publish state" },
  "Published At: Point of Sale": { classification: "PRESERVED-METADATA", destination: "metadata.channels.pos_at", notes: "Channel publish timestamp" },
  "Published: Shop": { classification: "PRESERVED-METADATA", destination: "metadata.channels.shop", notes: "Channel publish state" },
  "Published At: Shop": { classification: "PRESERVED-METADATA", destination: "metadata.channels.shop_at", notes: "Channel publish timestamp" },

  // Ignored Safely
  "Command": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Matrixify command directive (MERGE/UPDATE/NEW)" },
  "Template Suffix": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Liquid template suffix" },
  "Image Width": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Original image width dimension" },
  "Image Height": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Original image height dimension" },
  "Products Count": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Source product count (recalculated dynamically)" },
  "Row #": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Matrixify export row counter" },
  "Top Row": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Matrixify hierarchy top-row indicator" },
  "TopRow": { classification: "IGNORED-SAFELY", destination: "(none)", notes: "Matrixify hierarchy top-row indicator" },
};

/**
 * Analyze incoming header columns and categorize them
 */
export function classifyCollectionHeaders(headers: string[]): HeaderAnalysisResult {
  const columns: ColumnClassificationDetail[] = [];
  let supportedCount = 0;
  let relationshipCount = 0;
  let preservedMetadataCount = 0;
  let ignoredSafelyCount = 0;
  let unsupportedCount = 0;

  for (const header of headers) {
    const trimmed = header.trim();
    const rule = MATRIXIFY_COLLECTION_COLUMN_RULES[trimmed];

    if (rule) {
      columns.push({
        header: trimmed,
        classification: rule.classification,
        destination: rule.destination,
        notes: rule.notes,
      });

      if (rule.classification === "SUPPORTED") supportedCount++;
      else if (rule.classification === "RELATIONSHIP") relationshipCount++;
      else if (rule.classification === "PRESERVED-METADATA") preservedMetadataCount++;
      else if (rule.classification === "IGNORED-SAFELY") ignoredSafelyCount++;
    } else {
      // Dynamic fallback for any extra metafield or unknown column
      if (trimmed.startsWith("Metafield:") || trimmed.startsWith("Published:") || trimmed.startsWith("Source:")) {
        columns.push({
          header: trimmed,
          classification: "PRESERVED-METADATA",
          destination: `metadata.${trimmed.toLowerCase().replace(/[^a-z0-9_]+/g, "_")}`,
          notes: "Dynamic metafield / channel property preserved in metadata",
        });
        preservedMetadataCount++;
      } else {
        columns.push({
          header: trimmed,
          classification: "UNSUPPORTED",
          destination: "(unmapped)",
          notes: "Unrecognized column safely ignored without crashing pipeline",
        });
        unsupportedCount++;
      }
    }
  }

  // If header has "Handle", "Title", and at least one Matrixify signature header, mark as Matrixify format
  const isMatrixifyFormat =
    headers.includes("Handle") &&
    (headers.includes("Title") || headers.includes("Body HTML")) &&
    (headers.includes("Sort: Product Handle") ||
      headers.includes("Condition: Field") ||
      headers.includes("Metafield: title_tag [string]") ||
      headers.includes("Published: Online Store") ||
      headers.includes("Top Row"));

  return {
    isMatrixifyFormat,
    totalHeaders: headers.length,
    supportedCount,
    relationshipCount,
    preservedMetadataCount,
    ignoredSafelyCount,
    unsupportedCount,
    columns,
  };
}

/**
 * Validate a normalized collection
 */
export function validateNormalizedCollection(col: NormalizedCollection): ValidationResult<NormalizedCollection> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!col.handle) {
    errors.push({ field: "handle", message: "Collection handle is missing or empty", severity: "ERROR" });
  } else if (!/^[a-z0-9_-]+$/i.test(col.handle)) {
    warnings.push({ field: "handle", message: `Handle '${col.handle}' contains non-standard characters`, severity: "WARN" });
  }

  if (!col.title) {
    errors.push({ field: "title", message: "Collection title is required", severity: "ERROR" });
  }

  if (!col.source_id) {
    warnings.push({ field: "source_id", message: "No source ID provided; handle will be used as unique key", severity: "WARN" });
  }

  if (col.image_src && !/^https?:\/\//i.test(col.image_src)) {
    warnings.push({ field: "image_src", message: `Image URL '${col.image_src}' is not a valid absolute URL`, severity: "WARN" });
  }

  return {
    isValid: errors.length === 0,
    data: col,
    errors,
    warnings,
  };
}

/**
 * Process an array of raw row objects (from CSV or XLSX) into normalized collections and relationships
 */
export function processMatrixifyCollectionRows(rows: Record<string, any>[]): ParseCollectionsResult {
  if (rows.length === 0) {
    return {
      headerAnalysis: {
        isMatrixifyFormat: false,
        totalHeaders: 0,
        supportedCount: 0,
        relationshipCount: 0,
        preservedMetadataCount: 0,
        ignoredSafelyCount: 0,
        unsupportedCount: 0,
        columns: [],
      },
      sourceRowCount: 0,
      uniqueCollectionCount: 0,
      validCollections: [],
      rejectedRecords: [],
      totalRulesCount: 0,
      totalProductLinksCount: 0,
      brandingFindingsCount: 0,
    };
  }

  const headers = Object.keys(rows[0]);
  const headerAnalysis = classifyCollectionHeaders(headers);

  const collectionsMap = new Map<string, NormalizedCollection>();
  const collectionRowIndexMap = new Map<string, number>();
  const rawRecordMap = new Map<string, Record<string, any>>();
  const linkKeySet = new Map<string, Set<string>>();

  let currentHandle = "";
  let totalRules = 0;
  let totalLinks = 0;
  let brandingFindingsCount = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const rawHandle = row["Handle"] ? String(row["Handle"]).trim().toLowerCase() : "";

    if (rawHandle) {
      currentHandle = rawHandle;
    }

    if (!currentHandle) continue;

    // Check if this row defines or initializes a collection
    const rawTitle = row["Title"] ? String(row["Title"]).trim() : "";
    const isTopRow = row["Top Row"] === true || row["Top Row"] === "true" || row["TopRow"] === true || Boolean(rawHandle && rawTitle);

    if (isTopRow || !collectionsMap.has(currentHandle)) {
      if (!collectionsMap.has(currentHandle)) {
        const rawBody = String(row["Body HTML"] || "");
        const sourceId = String(row["ID"] || row["Source: ID"] || "").trim();

        // Published resolution
        let published = true;
        if (row["Published: Online Store"] !== undefined && row["Published: Online Store"] !== "") {
          published = Boolean(row["Published: Online Store"] === true || row["Published: Online Store"] === "true");
        } else if (row["Published"] !== undefined && row["Published"] !== "") {
          published = Boolean(row["Published"] === true || row["Published"] === "true");
        }

        const { cleanedHtml, findings } = cleanHtmlContent(rawBody, `Collection: ${currentHandle}`);
        brandingFindingsCount += findings.length;

        const rawSeoTitle = String(row["Metafield: title_tag [string]"] || row["SEO Title"] || "");
        const rawSeoDesc = String(row["Metafield: description_tag [string]"] || row["SEO Description"] || "");

        const seoTitle = cleanSeoTitle(rawSeoTitle, rawTitle || currentHandle);
        const seoDesc = cleanSeoDescription(rawSeoDesc, cleanedHtml || rawTitle || currentHandle);

        const metadata: Record<string, any> = {};

        // Extract metadata fields safely
        if (row["Sort Order"]) metadata.sort_order = String(row["Sort Order"]).trim();
        if (row["Inclusion: Type"]) metadata.inclusion_type = String(row["Inclusion: Type"]).trim();
        if (row["Inclusion: Match"]) metadata.inclusion_match = String(row["Inclusion: Match"]).trim();
        if (row["Metafield: ess_grid_gallery.ess_grid_gallery_id [number_integer]"]) {
          metadata.ess_grid_gallery_id = row["Metafield: ess_grid_gallery.ess_grid_gallery_id [number_integer]"];
        }

        // Channel publishing metadata
        const channels: Record<string, any> = {};
        for (const k of Object.keys(row)) {
          if (k.startsWith("Published:") || k.startsWith("Published At:") || k.startsWith("Source:")) {
            if (row[k] !== "" && row[k] !== undefined) {
              channels[k] = row[k];
            }
          }
        }
        if (Object.keys(channels).length > 0) {
          metadata.channels = channels;
        }

        collectionsMap.set(currentHandle, {
          source_id: sourceId,
          handle: currentHandle,
          title: rawTitle,
          description_html: cleanedHtml,
          seo_title: seoTitle,
          seo_description: seoDesc,
          published,
          image_src: row["Image Src"] ? String(row["Image Src"]).trim() : undefined,
          image_alt: row["Image Alt Text"] ? String(row["Image Alt Text"]).trim() : undefined,
          sort_order: row["Sort Order"] ? String(row["Sort Order"]).trim() : undefined,
          rules: [],
          product_links: [],
          product_count: 0,
          metadata,
          findings,
        });

        collectionRowIndexMap.set(currentHandle, idx + 1);
        rawRecordMap.set(currentHandle, row);
        linkKeySet.set(currentHandle, new Set<string>());
      } else if (rawTitle && !collectionsMap.get(currentHandle)?.title) {
        // Fill missing title if secondary row contains it
        const target = collectionsMap.get(currentHandle)!;
        target.title = rawTitle;
      }
    }

    const currentCollection = collectionsMap.get(currentHandle);
    if (currentCollection) {
      // Extract automated condition rules if present on this row
      if (row["Condition: Field"] || row["Condition: Relation"] || row["Condition: Value"]) {
        const rule: CollectionRuleCondition = {
          command: row["Condition: Command"] ? String(row["Condition: Command"]).trim() : undefined,
          field: row["Condition: Field"] ? String(row["Condition: Field"]).trim() : undefined,
          relation: row["Condition: Relation"] ? String(row["Condition: Relation"]).trim() : undefined,
          value: row["Condition: Value"] ? String(row["Condition: Value"]).trim() : undefined,
          match: row["Condition: Match"] || row["Inclusion: Match"] ? String(row["Condition: Match"] || row["Inclusion: Match"]).trim() : undefined,
        };
        currentCollection.rules.push(rule);
        totalRules++;
      }

      // Extract product relationship if present on this row
      const prodHandle = row["Sort: Product Handle"] ? String(row["Sort: Product Handle"]).trim().toLowerCase() : "";
      const prodId = row["Sort: Product ID"] ? String(row["Sort: Product ID"]).trim() : "";
      const pos = row["Sort: Position"] ? Number(row["Sort: Position"]) : undefined;

      if (prodHandle || prodId) {
        const linkKey = `${prodHandle}::${prodId}`;
        const linksSet = linkKeySet.get(currentHandle);
        if (linksSet && !linksSet.has(linkKey)) {
          linksSet.add(linkKey);
          currentCollection.product_links.push({
            collectionHandle: currentHandle,
            productHandle: prodHandle || undefined,
            productId: prodId || undefined,
            position: pos,
          });
          currentCollection.product_count = currentCollection.product_links.length;
          totalLinks++;
        }
      }
    }
  }

  // Validate all normalized collections
  const validCollections: NormalizedCollection[] = [];
  const rejectedRecords: RejectedRecord[] = [];

  for (const [handle, col] of collectionsMap.entries()) {
    const val = validateNormalizedCollection(col);
    if (!val.isValid) {
      rejectedRecords.push({
        entityType: "collection",
        sourceRowIndex: collectionRowIndexMap.get(handle) || 1,
        sourceId: col.source_id,
        handle: col.handle,
        title: col.title,
        status: "REJECTED",
        reason: val.errors.map((e) => e.message).join("; "),
        errors: val.errors,
        recommendedAction: "Check collection handle and title in Matrixify export file",
        rawRecord: rawRecordMap.get(handle) || {},
      });
    } else {
      validCollections.push(col);
    }
  }

  return {
    headerAnalysis,
    sourceRowCount: rows.length,
    uniqueCollectionCount: collectionsMap.size,
    validCollections,
    rejectedRecords,
    totalRulesCount: totalRules,
    totalProductLinksCount: totalLinks,
    brandingFindingsCount,
  };
}

/**
 * Parse Matrixify collection file from a Buffer (handles both CSV and XLSX)
 */
export function parseMatrixifyCollectionsBuffer(
  buffer: Buffer,
  filename: string = "Collections.xlsx"
): ParseCollectionsResult {
  const isCsv = filename.toLowerCase().endsWith(".csv");
  const wb = XLSX.read(buffer, {
    type: "buffer",
    raw: true,
    cellDates: true,
  });

  const sheetName = wb.Sheets["Collections"] ? "Collections" : wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return processMatrixifyCollectionRows(rows);
}

/**
 * Parse Matrixify collection file from raw string (CSV)
 */
export function parseMatrixifyCollectionsString(csvContent: string): ParseCollectionsResult {
  const wb = XLSX.read(csvContent, { type: "string", raw: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return processMatrixifyCollectionRows(rows);
}

/**
 * Format normalized collections as standard CSV string for destination table export
 */
export function generateNormalizedCollectionsCsv(collections: NormalizedCollection[]): string {
  const headers = [
    "handle",
    "title",
    "description_html",
    "seo_title",
    "seo_description",
    "source_id",
    "published",
    "product_count",
    "rules_count",
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [headers.join(",")];
  for (const col of collections) {
    const row = [
      escapeCsv(col.handle),
      escapeCsv(col.title),
      escapeCsv(col.description_html),
      escapeCsv(col.seo_title),
      escapeCsv(col.seo_description),
      escapeCsv(col.source_id),
      escapeCsv(col.published),
      escapeCsv(col.product_count),
      escapeCsv(col.rules.length),
    ];
    lines.push(row.join(","));
  }

  return lines.join("\n");
}

/**
 * Format rejected records as CSV string
 */
export function generateRejectedCollectionsCsv(rejected: RejectedRecord[]): string {
  const headers = ["row_index", "source_id", "handle", "title", "reason", "errors", "recommended_action"];
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [headers.join(",")];
  for (const r of rejected) {
    const row = [
      escapeCsv(r.sourceRowIndex),
      escapeCsv(r.sourceId),
      escapeCsv(r.handle),
      escapeCsv(r.title),
      escapeCsv(r.reason),
      escapeCsv(JSON.stringify(r.errors)),
      escapeCsv(r.recommendedAction),
    ];
    lines.push(row.join(","));
  }

  return lines.join("\n");
}
