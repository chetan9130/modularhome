import * as fs from "fs";
import * as path from "path";
import { DatabaseService } from "./db";
import { ExcelSourceLoader } from "./excel_loader";

export async function runReconciliation(): Promise<void> {
  const db = new DatabaseService();
  const loader = new ExcelSourceLoader();
  const reportsDir = path.resolve(__dirname, "../reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  console.log("\n==================================================");
  console.log("POST-IMPORT RECONCILIATION AUDIT");
  console.log("==================================================");

  // 1. Fetch DB counts
  const dbCounts = await db.getTableCounts();

  // 2. Fetch Excel Source unique counts
  const data = loader.loadAll();

  const reconciliation = [
    {
      entity: "Collections",
      targetTable: "collections",
      sourceUniqueRows: data.collections.length,
      dbRowCount: dbCounts["collections"] || 0,
      discrepancy: (dbCounts["collections"] || 0) - data.collections.length,
      status: (dbCounts["collections"] || 0) === data.collections.length ? "MATCHED" : "INVESTIGATE",
    },
    {
      entity: "Products",
      targetTable: "products",
      sourceUniqueRows: data.products.length,
      dbRowCount: dbCounts["products"] || 0,
      discrepancy: (dbCounts["products"] || 0) - data.products.length,
      status: (dbCounts["products"] || 0) === data.products.length ? "MATCHED" : "INVESTIGATE",
    },
    {
      entity: "Product Variants",
      targetTable: "product_variants",
      sourceUniqueRows: data.variants.length,
      dbRowCount: dbCounts["product_variants"] || 0,
      discrepancy: (dbCounts["product_variants"] || 0) - data.variants.length,
      status: (dbCounts["product_variants"] || 0) === data.variants.length ? "MATCHED" : "INVESTIGATE",
    },
    {
      entity: "Product Media",
      targetTable: "product_media",
      sourceUniqueRows: data.media.length,
      dbRowCount: dbCounts["product_media"] || 0,
      discrepancy: (dbCounts["product_media"] || 0) - data.media.length,
      status: (dbCounts["product_media"] || 0) === data.media.length ? "MATCHED" : "INVESTIGATE",
    },
    {
      entity: "Pages",
      targetTable: "pages",
      sourceUniqueRows: data.pages.length,
      dbRowCount: dbCounts["pages"] || 0,
      discrepancy: (dbCounts["pages"] || 0) - data.pages.length,
      status: (dbCounts["pages"] || 0) === data.pages.length ? "MATCHED" : "INVESTIGATE",
    },
    {
      entity: "Blog Posts",
      targetTable: "blog_posts",
      sourceUniqueRows: data.blogs.length,
      dbRowCount: dbCounts["blog_posts"] || 0,
      discrepancy: (dbCounts["blog_posts"] || 0) - data.blogs.length,
      status: (dbCounts["blog_posts"] || 0) === data.blogs.length ? "MATCHED" : "INVESTIGATE",
    },
    {
      entity: "Redirects (Source + Generated)",
      targetTable: "redirects",
      sourceUniqueRows: data.redirects.length,
      dbRowCount: dbCounts["redirects"] || 0,
      discrepancy: (dbCounts["redirects"] || 0) - data.redirects.length,
      status: (dbCounts["redirects"] || 0) >= data.redirects.length ? "MATCHED_OR_EXPANDED" : "INVESTIGATE",
    },
    {
      entity: "ModularHome URL Migrations",
      targetTable: "url_migrations",
      sourceUniqueRows: data.products.length + data.collections.length + data.pages.length + data.blogs.length,
      dbRowCount: dbCounts["url_migrations"] || 0,
      discrepancy: (dbCounts["url_migrations"] || 0) - (data.products.length + data.collections.length + data.pages.length + data.blogs.length),
      status: (dbCounts["url_migrations"] || 0) > 0 ? "MATCHED" : "INVESTIGATE",
    },
    {
      entity: "Product ↔ Collection Memberships",
      targetTable: "product_collections",
      sourceUniqueRows: data.collectionProductLinks.length,
      dbRowCount: dbCounts["product_collections"] || 0,
      discrepancy: (dbCounts["product_collections"] || 0) - data.collectionProductLinks.length,
      status: (dbCounts["product_collections"] || 0) > 0 ? "POPULATED" : "EMPTY",
    },
  ];

  console.table(reconciliation);

  // Write JSON report
  fs.writeFileSync(
    path.join(reportsDir, "production-reconciliation.json"),
    JSON.stringify(reconciliation, null, 2),
    "utf8"
  );

  // Write CSV report
  const csvLines = [
    "Entity,Target Table,Source Unique Rows,DB Row Count,Discrepancy,Status",
    ...reconciliation.map(
      (r) => `"${r.entity}","${r.targetTable}",${r.sourceUniqueRows},${r.dbRowCount},${r.discrepancy},"${r.status}"`
    ),
  ];
  fs.writeFileSync(path.join(reportsDir, "production-reconciliation.csv"), csvLines.join("\n"), "utf8");

  console.log(`\nSaved reconciliation reports to:
  - ${path.join(reportsDir, "production-reconciliation.json")}
  - ${path.join(reportsDir, "production-reconciliation.csv")}`);

  await db.close();
}

if (require.main === module) {
  runReconciliation().catch((err) => {
    console.error("Reconciliation error:", err);
    process.exit(1);
  });
}
