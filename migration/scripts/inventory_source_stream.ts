import ExcelJS from "exceljs";
import * as path from "path";
import * as fs from "fs";

interface SheetInventory {
  fileName: string;
  sheetName: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  sampleRow?: Record<string, any>;
}

async function inspectWorkbook(fileName: string): Promise<SheetInventory[]> {
  const filePath = path.resolve(__dirname, "../source", fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }

  const results: SheetInventory[] = [];
  const t0 = Date.now();
  console.log(`\n==================================================`);
  console.log(`Inspecting: ${fileName} (${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB)`);

  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
    entries: "emit",
    sharedStrings: "cache",
    hyperlinks: "ignore",
    styles: "ignore",
  });

  for await (const worksheetReader of workbookReader) {
    const sheetName = (worksheetReader as any).name || "Sheet1";
    console.log(`-> Processing Sheet: [${sheetName}]`);
    let rowCount = 0;
    let headers: string[] = [];
    let sampleRow: Record<string, any> | undefined;

    for await (const row of worksheetReader) {
      if (!row.values) continue;
      const values: any[] = Array.isArray(row.values) ? row.values.slice(1) : [];

      if (rowCount === 0) {
        // Header row
        headers = values.map((v) => (v !== null && v !== undefined ? String(v).trim() : ""));
        // Clean empty trailing headers
        while (headers.length > 0 && headers[headers.length - 1] === "") {
          headers.pop();
        }
      } else {
        if (rowCount === 1) {
          sampleRow = {};
          headers.forEach((h, idx) => {
            if (h) sampleRow![h] = values[idx];
          });
        }
      }
      rowCount++;
    }

    const dataRowCount = Math.max(0, rowCount - 1);
    console.log(`   Sheet [${sheetName}]: ${dataRowCount} data rows, ${headers.length} columns`);

    results.push({
      fileName,
      sheetName,
      rowCount: dataRowCount,
      columnCount: headers.length,
      columns: headers,
      sampleRow,
    });
  }

  console.log(`Finished ${fileName} in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
  return results;
}

async function run() {
  const files = ["Collections.xlsx", "Products.xlsx", "Pages.xlsx", "Blogs.xlsx", "Redirects.xlsx"];
  const allInventories: SheetInventory[] = [];

  for (const f of files) {
    const invs = await inspectWorkbook(f);
    allInventories.push(...invs);
  }

  const reportsDir = path.resolve(__dirname, "../reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const outPath = path.join(reportsDir, "source-inventory.json");
  fs.writeFileSync(outPath, JSON.stringify(allInventories, null, 2), "utf8");
  console.log(`\nSaved complete inventory to: ${outPath}`);

  console.log("\n==================================================");
  console.log("SOURCE INVENTORY SUMMARY TABLE");
  console.log("==================================================");
  console.table(
    allInventories.map((i) => ({
      File: i.fileName,
      Sheet: i.sheetName,
      "Data Rows": i.rowCount,
      Columns: i.columnCount,
    }))
  );
}

run().catch((err) => {
  console.error("Inventory error:", err);
  process.exit(1);
});
