import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  parseMatrixifyCollectionsBuffer,
  parseMatrixifyCollectionsString,
  generateNormalizedCollectionsCsv,
  generateRejectedCollectionsCsv,
  classifyCollectionHeaders,
  NormalizedCollection,
} from "@/lib/shopify/collectionParser";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  const t0 = Date.now();

  try {
    const contentType = request.headers.get("content-type") || "";
    let fileBuffer: Buffer | null = null;
    let fileName = "Collections.xlsx";
    let isDryRun = true;
    let syncRelationships = true;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const dryRunParam = formData.get("isDryRun");
      const syncRelParam = formData.get("syncRelationships");

      if (dryRunParam !== null) {
        isDryRun = dryRunParam === "true" || dryRunParam === "1";
      }
      if (syncRelParam !== null) {
        syncRelationships = syncRelParam === "true" || syncRelParam === "1";
      }

      if (!file) {
        return NextResponse.json(
          { success: false, error: { message: "No CSV/XLSX file uploaded", code: "NO_FILE" } },
          { status: 400 }
        );
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const json = await request.json();
      if (json.isDryRun !== undefined) isDryRun = Boolean(json.isDryRun);
      if (json.syncRelationships !== undefined) syncRelationships = Boolean(json.syncRelationships);
      if (json.fileBase64) {
        fileBuffer = Buffer.from(json.fileBase64, "base64");
        if (json.fileName) fileName = json.fileName;
      } else if (json.csvContent) {
        fileBuffer = Buffer.from(json.csvContent, "utf8");
        fileName = json.fileName || "Collections.csv";
      }
    }

    if (!fileBuffer) {
      return NextResponse.json(
        { success: false, error: { message: "Missing file payload", code: "INVALID_PAYLOAD" } },
        { status: 400 }
      );
    }

    // Parse & Normalize Matrixify Collections
    const parseResult = parseMatrixifyCollectionsBuffer(fileBuffer, fileName);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let relationshipImportedCount = 0;
    const errors: string[] = [];

    if (!isDryRun && isSupabaseConfigured() && parseResult.validCollections.length > 0) {
      // 1. Fetch existing collections to calculate created vs updated
      const { data: existingRows } = await supabaseAdmin
        .from("collections")
        .select("id, handle, source_id");

      const existingHandleToId = new Map<string, string>();
      const existingSourceToId = new Map<string, string>();

      (existingRows || []).forEach((row: any) => {
        if (row.handle) existingHandleToId.set(row.handle.toLowerCase(), row.id);
        if (row.source_id) existingSourceToId.set(row.source_id, row.id);
      });

      // 2. Batch upsert collections in chunks
      const batchSize = 100;
      for (let i = 0; i < parseResult.validCollections.length; i += batchSize) {
        const chunk = parseResult.validCollections.slice(i, i + batchSize);
        const rowsToUpsert = chunk.map((c) => {
          const isUpdate = existingHandleToId.has(c.handle) || (c.source_id && existingSourceToId.has(c.source_id));
          if (isUpdate) updatedCount++;
          else createdCount++;

          return {
            handle: c.handle,
            title: c.title,
            description_html: c.description_html || null,
            seo_title: c.seo_title || `${c.title} | ModularHome`,
            seo_description: c.seo_description || (c.description_html ? c.description_html.replace(/<[^>]*>?/gm, "").slice(0, 160) : null),
            source_id: c.source_id || null,
            published: c.published,
            updated_at: new Date().toISOString(),
          };
        });

        const { error: upsertErr } = await supabaseAdmin
          .from("collections")
          .upsert(rowsToUpsert, { onConflict: "handle" });

        if (upsertErr) {
          errors.push(`Chunk upsert error: ${upsertErr.message}`);
        }
      }

      // 3. Sync product-collection relationships if requested
      if (syncRelationships && parseResult.totalProductLinksCount > 0) {
        // Fetch refreshed collection lookups & product lookups
        const { data: refreshedCols } = await supabaseAdmin.from("collections").select("id, handle");
        const { data: products } = await supabaseAdmin.from("products").select("id, handle, source_id");

        const colMap = new Map<string, string>();
        (refreshedCols || []).forEach((c: any) => colMap.set(c.handle.toLowerCase(), c.id));

        const prodHandleMap = new Map<string, string>();
        const prodSourceMap = new Map<string, string>();
        (products || []).forEach((p: any) => {
          if (p.handle) prodHandleMap.set(p.handle.toLowerCase(), p.id);
          if (p.source_id) prodSourceMap.set(p.source_id, p.id);
        });

        const junctionRows: Array<{ collection_id: string; product_id: string }> = [];
        const seenJunctionKeys = new Set<string>();

        for (const col of parseResult.validCollections) {
          const colId = colMap.get(col.handle);
          if (!colId) continue;

          for (const link of col.product_links) {
            const prodId =
              (link.productHandle && prodHandleMap.get(link.productHandle)) ||
              (link.productId && prodSourceMap.get(link.productId));

            if (prodId) {
              const junctionKey = `${colId}::${prodId}`;
              if (!seenJunctionKeys.has(junctionKey)) {
                seenJunctionKeys.add(junctionKey);
                junctionRows.push({ collection_id: colId, product_id: prodId });
              }
            }
          }
        }

        for (let i = 0; i < junctionRows.length; i += 250) {
          const chunk = junctionRows.slice(i, i + 250);
          const { error: relErr } = await supabaseAdmin
            .from("product_collections")
            .upsert(chunk, { onConflict: "product_id,collection_id" });

          if (!relErr) {
            relationshipImportedCount += chunk.length;
          }
        }
      }
    }

    const durationMs = Date.now() - t0;

    return NextResponse.json({
      success: errors.length === 0,
      isDryRun,
      summary: {
        sourceFile: fileName,
        isMatrixifyFormat: parseResult.headerAnalysis.isMatrixifyFormat,
        sourceRowCount: parseResult.sourceRowCount,
        uniqueCollectionCount: parseResult.uniqueCollectionCount,
        validCollectionCount: parseResult.validCollections.length,
        rejectedCount: parseResult.rejectedRecords.length,
        createdCount: isDryRun ? parseResult.validCollections.length : createdCount,
        updatedCount: isDryRun ? 0 : updatedCount,
        skippedCount,
        totalRulesPreserved: parseResult.totalRulesCount,
        totalProductLinksFound: parseResult.totalProductLinksCount,
        relationshipsImported: relationshipImportedCount,
        brandingFindingsCount: parseResult.brandingFindingsCount,
        durationMs,
      },
      headerAnalysis: parseResult.headerAnalysis,
      rejectedRecords: parseResult.rejectedRecords.slice(0, 100),
      sampleCollections: parseResult.validCollections.slice(0, 5),
      errors,
    });
  } catch (err: any) {
    console.error("Collections import error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: err?.message || "Failed to process Matrixify collections import.",
          code: "IMPORT_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
