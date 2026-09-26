import * as XLSX from "xlsx";
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

async function runSourceInventory() {
  const sourceDir = path.resolve(__dirname, "../source");
  const reportsDir = path.resolve(__dirname, "../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const files = ["Collections.xlsx", "Products.xlsx", "Pages.xlsx", "Blogs.xlsx", "Redirects.xlsx"];
  const inventories: SheetInventory[] = [];

  console.log("==================================================");
  console.log("SOURCE WORKBOOK INVENTORY");
  console.log("==================================================");

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const t0 = Date.now();
    console.log(`\nReading ${file} (Size: ${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB)...`);
    
    // Read with fast options
    const workbook = XLSX.readFile(filePath, {
      raw: true,
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      bookVBA: false,
    });
    
    console.log(`Parsed in ${(Date.now() - t0) / 1000}s. Sheets in ${file}:`, workbook.SheetNames);

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const rowCount = rows.length;

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      console.log(`  Sheet: [${sheetName}] | Rows: ${rowCount} | Columns: ${columns.length}`);

      inventories.push({
        fileName: file,
        sheetName,
        rowCount,
        columnCount: columns.length,
        columns,
        sampleRow: rows.length > 0 ? rows[0] : undefined,
      });
    }
  }

  const inventoryPath = path.join(reportsDir, "source-inventory.json");
  fs.writeFileSync(inventoryPath, JSON.stringify(inventories, null, 2), "utf8");
  console.log(`\nSource inventory saved to: ${inventoryPath}`);

  // Summary Table
  console.log("\n==================================================");
  console.log("SUMMARY INVENTORY TABLE");
  console.log("==================================================");
  console.table(
    inventories.map((inv) => ({
      File: inv.fileName,
      Sheet: inv.sheetName,
      Rows: inv.rowCount,
      Cols: inv.columnCount,
    }))
  );
}

runSourceInventory().catch((err) => {
  console.error("Error running inventory:", err);
  process.exit(1);
});
