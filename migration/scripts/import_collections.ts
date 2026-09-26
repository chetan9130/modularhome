import * as fs from "fs";
import * as path from "path";
import { DatabaseService } from "./db";
import {
  parseMatrixifyCollectionsBuffer,
  generateNormalizedCollectionsCsv,
  generateRejectedCollectionsCsv,
} from "../../src/lib/shopify/collectionParser";

async function main() {
  const isDryRun = !process.argv.includes("--production") && !process.argv.includes("--live");
  const filePathArg = process.argv.find((a) => a.endsWith(".xlsx") || a.endsWith(".csv"));
  
  let sourcePath = "";
  if (filePathArg) {
    sourcePath = path.resolve(filePathArg);
  } else {
    const csvDefault = path.resolve(__dirname, "../source/Collections.csv");
    const xlsxDefault = path.resolve(__dirname, "../source/Collections.xlsx");
    sourcePath = fs.existsSync(csvDefault) ? csvDefault : xlsxDefault;
  }

  console.log("==============================================================================");
  console.log(isDryRun ? "MODULARHOME MATRIXIFY COLLECTIONS IMPORTER — DRY RUN MODE" : "MODULARHOME MATRIXIFY COLLECTIONS IMPORTER — PRODUCTION LIVE IMPORT");
  console.log("==============================================================================");
  console.log(`Source File: ${sourcePath}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const t0 = Date.now();
  console.log("\nReading and parsing Matrixify source data...");
  const buffer = fs.readFileSync(sourcePath);
  const result = parseMatrixifyCollectionsBuffer(buffer, path.basename(sourcePath));

  console.log(`\nHeader Analysis:`);
  console.log(`- Format recognized: ${result.headerAnalysis.isMatrixifyFormat ? "Matrixify / Shopify Collections Export" : "Generic CSV"}`);
  console.log(`- Total Columns in File: ${result.headerAnalysis.totalHeaders}`);
  console.log(`- Supported Target Columns: ${result.headerAnalysis.supportedCount}`);
  console.log(`- Relationship Columns: ${result.headerAnalysis.relationshipCount}`);
  console.log(`- Preserved Metadata Columns: ${result.headerAnalysis.preservedMetadataCount}`);
  console.log(`- Ignored Safely Columns: ${result.headerAnalysis.ignoredSafelyCount}`);
  console.log(`- Unsupported Columns: ${result.headerAnalysis.unsupportedCount}`);

  console.log(`\nParsed Summary:`);
  console.log(`- Source Rows: ${result.sourceRowCount}`);
  console.log(`- Unique Collections: ${result.uniqueCollectionCount}`);
  console.log(`- Valid Collections: ${result.validCollections.length}`);
  console.log(`- Rejected Collections: ${result.rejectedRecords.length}`);
  console.log(`- Automated Rules Preserved: ${result.totalRulesCount}`);
  console.log(`- Product ↔ Collection Memberships: ${result.totalProductLinksCount}`);
  console.log(`- Branding Sanitization Findings: ${result.brandingFindingsCount}`);

  // Ensure output directories exist
  const processedDir = path.resolve(__dirname, "../processed");
  const rejectedDir = path.resolve(__dirname, "../rejected");
  const reportsDir = path.resolve(__dirname, "../reports");

  if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });
  if (!fs.existsSync(rejectedDir)) fs.mkdirSync(rejectedDir, { recursive: true });
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  // Generate artifacts
  const normalizedCsv = generateNormalizedCollectionsCsv(result.validCollections);
  fs.writeFileSync(path.join(processedDir, "collections-normalized.csv"), normalizedCsv, "utf8");
  console.log(`\n✓ Normalized collections saved to: migration/processed/collections-normalized.csv`);

  if (result.rejectedRecords.length > 0) {
    const rejectedCsv = generateRejectedCollectionsCsv(result.rejectedRecords);
    fs.writeFileSync(path.join(rejectedDir, "collections-rejected.csv"), rejectedCsv, "utf8");
    console.log(`✓ Rejected records report saved to: migration/rejected/collections-rejected.csv`);
  }

  const report = {
    timestamp: new Date().toISOString(),
    sourceFile: sourcePath,
    mode: isDryRun ? "DRY_RUN" : "PRODUCTION",
    durationMs: Date.now() - t0,
    headerAnalysis: result.headerAnalysis,
    metrics: {
      sourceRowCount: result.sourceRowCount,
      uniqueCollectionCount: result.uniqueCollectionCount,
      validCollectionsCount: result.validCollections.length,
      rejectedRecordsCount: result.rejectedRecords.length,
      rulesPreservedCount: result.totalRulesCount,
      productLinksCount: result.totalProductLinksCount,
      brandingFindingsCount: result.brandingFindingsCount,
    },
    sampleCollections: result.validCollections.slice(0, 5),
  };

  fs.writeFileSync(
    path.join(reportsDir, "collections-import-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  console.log(`✓ Full import report saved to: migration/reports/collections-import-report.json`);

  if (!isDryRun) {
    console.log("\nExecuting database upsert...");
    const db = new DatabaseService();
    const client = await db.getClient();
    let created = 0;
    let updated = 0;

    try {
      await client.query("BEGIN;");
      const { rows: existingRows } = await client.query("SELECT id, handle FROM collections;");
      const existingHandles = new Set(existingRows.map((r) => r.handle));

      const batchSize = 100;
      for (let i = 0; i < result.validCollections.length; i += batchSize) {
        const chunk = result.validCollections.slice(i, i + batchSize);
        const values: any[] = [];
        const placeholders: string[] = [];

        let idx = 1;
        for (const col of chunk) {
          if (existingHandles.has(col.handle)) updated++;
          else created++;

          placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, now())`);
          values.push(
            col.handle,
            col.title,
            col.description_html,
            col.seo_title,
            col.seo_description,
            col.source_id,
            col.published
          );
        }

        if (placeholders.length > 0) {
          const sql = `
            INSERT INTO collections (handle, title, description_html, seo_title, seo_description, source_id, published, updated_at)
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (handle) DO UPDATE SET
              title = EXCLUDED.title,
              description_html = EXCLUDED.description_html,
              seo_title = EXCLUDED.seo_title,
              seo_description = EXCLUDED.seo_description,
              source_id = EXCLUDED.source_id,
              published = EXCLUDED.published,
              updated_at = now();
          `;
          await client.query(sql, values);
        }
      }

      await client.query("COMMIT;");
      console.log(`\n🎉 Database Upsert Successful: ${created} created, ${updated} updated.`);
    } catch (err) {
      await client.query("ROLLBACK;");
      console.error("Database upsert failed:", err);
    } finally {
      client.release();
      await db.close();
    }
  }

  console.log("\n==============================================================================");
  console.log(`Completed in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
  console.log("==============================================================================");
}

main().catch(console.error);
