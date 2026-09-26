import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

function analyzeStructure() {
  const sourceDir = path.resolve(__dirname, "../source");

  console.log("Analyzing Matrixify files structure...");

  // 1. Pages
  const pagesWb = XLSX.readFile(path.join(sourceDir, "Pages.xlsx"), { raw: true });
  const pagesRows: any[] = XLSX.utils.sheet_to_json(pagesWb.Sheets["Pages"], { defval: "" });
  const pageHandles = new Set<string>();
  const pageIds = new Set<string>();
  for (const r of pagesRows) {
    if (r.Handle) pageHandles.add(String(r.Handle));
    if (r.ID) pageIds.add(String(r.ID));
  }
  console.log(`Pages: ${pagesRows.length} rows, ${pageHandles.size} unique handles, ${pageIds.size} unique IDs`);

  // 2. Blogs
  const blogsWb = XLSX.readFile(path.join(sourceDir, "Blogs.xlsx"), { raw: true });
  const blogsRows: any[] = XLSX.utils.sheet_to_json(blogsWb.Sheets["Blog Posts"], { defval: "" });
  const blogHandles = new Set<string>();
  const blogIds = new Set<string>();
  for (const r of blogsRows) {
    const compound = `${r["Blog Handle"] || "news"}::${r.Handle}`;
    if (r.Handle) blogHandles.add(compound);
    if (r.ID) blogIds.add(String(r.ID));
  }
  console.log(`Blogs: ${blogsRows.length} rows, ${blogHandles.size} unique (blog_handle+handle), ${blogIds.size} unique IDs`);

  // 3. Redirects
  const redirectsWb = XLSX.readFile(path.join(sourceDir, "Redirects.xlsx"), { raw: true });
  const redirectsRows: any[] = XLSX.utils.sheet_to_json(redirectsWb.Sheets["Redirects"], { defval: "" });
  const redirectSources = new Set<string>();
  for (const r of redirectsRows) {
    const src = r.Path || r["Redirect From"] || r.from_path || "";
    if (src) redirectSources.add(String(src));
  }
  console.log(`Redirects: ${redirectsRows.length} rows, ${redirectSources.size} unique source paths`);

  // 4. Collections
  console.log("Reading Collections.xlsx (this takes ~30s)...");
  const colWb = XLSX.readFile(path.join(sourceDir, "Collections.xlsx"), { raw: true });
  const colRows: any[] = XLSX.utils.sheet_to_json(colWb.Sheets["Collections"], { defval: "" });
  
  const colMap = new Map<string, any>();
  const colProductLinks = new Set<string>();
  let currentCollectionHandle = "";

  for (const r of colRows) {
    if (r.Handle) {
      currentCollectionHandle = String(r.Handle);
    }
    if (r.Title && (r.TopRow === true || r["Top Row"] === true || r.Handle)) {
      const handle = String(r.Handle || currentCollectionHandle);
      if (!colMap.has(handle)) {
        colMap.set(handle, r);
      }
    }

    const prodHandle = r["Sort: Product Handle"];
    const prodId = r["Sort: Product ID"];
    if (currentCollectionHandle && (prodHandle || prodId)) {
      colProductLinks.add(`${currentCollectionHandle}::${prodHandle || prodId}`);
    }
  }

  console.log(`Collections: ${colRows.length} rows total, ${colMap.size} unique collection definitions, ${colProductLinks.size} collection-product relationships`);

  // 5. Products
  console.log("Reading Products.xlsx (this takes ~50s)...");
  const prodWb = XLSX.readFile(path.join(sourceDir, "Products.xlsx"), { raw: true });
  const prodRows: any[] = XLSX.utils.sheet_to_json(prodWb.Sheets["Products"], { defval: "" });

  const productMap = new Map<string, any>();
  const variantSet = new Set<string>();
  const mediaSet = new Set<string>();
  let currentProductHandle = "";

  for (const r of prodRows) {
    if (r.Handle) {
      currentProductHandle = String(r.Handle);
    }
    if (r.Title && (r.TopRow === true || r["Top Row"] === true || r.Handle)) {
      const handle = String(r.Handle || currentProductHandle);
      if (!productMap.has(handle)) {
        productMap.set(handle, r);
      }
    }

    const variantId = r["Variant ID"];
    const variantSku = r["Variant SKU"];
    if (variantId || variantSku || r["Option1 Value"]) {
      variantSet.add(`${currentProductHandle}::${variantId || variantSku || r["Option1 Value"]}`);
    }

    const imageSrc = r["Image Src"];
    if (imageSrc) {
      mediaSet.add(`${currentProductHandle}::${imageSrc}`);
    }
  }

  console.log(`Products: ${prodRows.length} rows total, ${productMap.size} unique products, ${variantSet.size} variants, ${mediaSet.size} images`);

  const summary = {
    collectionsCount: colMap.size,
    collectionRows: colRows.length,
    collectionProductLinks: colProductLinks.size,
    productsCount: productMap.size,
    productRows: prodRows.length,
    variantsCount: variantSet.size,
    mediaCount: mediaSet.size,
    pagesCount: pagesRows.length,
    uniquePages: pageHandles.size,
    blogPostsCount: blogsRows.length,
    uniqueBlogPosts: blogHandles.size,
    redirectsCount: redirectsRows.length,
    uniqueRedirects: redirectSources.size,
  };

  fs.writeFileSync(
    path.resolve(__dirname, "../reports/source-analysis.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  console.log("\nSummary saved to migration/reports/source-analysis.json:", summary);
}

analyzeStructure();
