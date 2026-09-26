import * as fs from "fs";
import * as path from "path";
import { DatabaseService } from "./db";
import { supabaseAdmin, isSupabaseConfigured } from "../../src/lib/supabase";

export interface MediaValidationItem {
  id: string;
  sourceUrl: string;
  productHandle?: string;
  status: "VALID" | "FAILED" | "SKIPPED";
  statusCode?: number;
  contentType?: string;
  contentLength?: number;
  error?: string;
}

export class MediaProcessor {
  private db: DatabaseService;

  constructor(db?: DatabaseService) {
    this.db = db || new DatabaseService();
  }

  /**
   * Sample validate a batch of image URLs to check accessibility & headers
   */
  public async validateSampleMedia(limit: number = 30): Promise<{
    totalSampled: number;
    validCount: number;
    failedCount: number;
    results: MediaValidationItem[];
  }> {
    let rows: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("product_media")
        .select("id, source_url, product_id, products(handle)")
        .limit(limit);

      if (error || !data) {
        console.warn("Supabase REST query warning, falling back to pg pool:", error?.message);
        const client = await this.db.getClient();
        try {
          const res = await client.query(`
            SELECT pm.id, pm.source_url, p.handle as product_handle 
            FROM product_media pm
            JOIN products p ON pm.product_id = p.id
            LIMIT $1;
          `, [limit]);
          rows = res.rows;
        } finally {
          client.release();
        }
      } else {
        rows = data.map((d: any) => ({
          id: d.id,
          source_url: d.source_url,
          product_handle: d.products?.handle || "",
        }));
      }
    } catch (err: any) {
      console.warn("Fallback query error:", err.message);
    }

    console.log(`Sampling ${rows.length} image URLs for HTTP validation...`);
    const results: MediaValidationItem[] = [];
    let validCount = 0;
    let failedCount = 0;

    for (const r of rows) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const resp = await fetch(r.source_url, {
          method: "HEAD",
          signal: controller.signal,
          headers: { "User-Agent": "ModularHome-Migration-MediaValidator/1.0" },
        });
        clearTimeout(timeoutId);

        const contentType = resp.headers.get("content-type") || "";
        const contentLength = parseInt(resp.headers.get("content-length") || "0", 10);

        if (resp.ok && (contentType.startsWith("image/") || contentType.includes("octet-stream") || contentType.includes("webp"))) {
          validCount++;
          results.push({
            id: r.id,
            sourceUrl: r.source_url,
            productHandle: r.product_handle,
            status: "VALID",
            statusCode: resp.status,
            contentType,
            contentLength,
          });
        } else {
          failedCount++;
          results.push({
            id: r.id,
            sourceUrl: r.source_url,
            productHandle: r.product_handle,
            status: "FAILED",
            statusCode: resp.status,
            contentType,
            error: `HTTP ${resp.status} - Content-Type: ${contentType}`,
          });
        }
      } catch (err: any) {
        failedCount++;
        results.push({
          id: r.id,
          sourceUrl: r.source_url,
          productHandle: r.product_handle,
          status: "FAILED",
          error: err.message,
        });
      }
    }

    const reportsDir = path.resolve(__dirname, "../reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportsDir, "media-sample-audit.json"),
      JSON.stringify(results, null, 2),
      "utf8"
    );

    return {
      totalSampled: rows.length,
      validCount,
      failedCount,
      results,
    };
  }
  public async close() {
    await this.db.close();
  }
}

if (require.main === module) {
  const processor = new MediaProcessor();
  processor
    .validateSampleMedia(30)
    .then(async (res) => {
      console.log(`Media sample audit complete: ${res.validCount}/${res.totalSampled} valid (${res.failedCount} failed)`);
      await processor.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Media audit error:", err);
      await processor.close().catch(() => {});
      process.exit(1);
    });
}
