import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { MappedCollection, mapCollectionRow } from "../mappers/collections.mapper";
import { MappedProduct, mapProductRow } from "../mappers/products.mapper";
import { MappedVariant, mapVariantRow } from "../mappers/variants.mapper";
import { MappedMedia, mapMediaRow } from "../mappers/media.mapper";
import { MappedPage, mapPageRow } from "../mappers/pages.mapper";
import { MappedBlogPost, mapBlogRow } from "../mappers/blogs.mapper";
import { MappedRedirect, mapRedirectRow } from "../mappers/redirects.mapper";

export interface LoadedMigrationData {
  collections: MappedCollection[];
  collectionProductLinks: Array<{ productHandle: string; collectionHandle: string }>;
  products: MappedProduct[];
  variants: MappedVariant[];
  media: MappedMedia[];
  pages: MappedPage[];
  blogs: MappedBlogPost[];
  redirects: MappedRedirect[];
  stats: {
    rawCollectionRows: number;
    rawProductRows: number;
    rawPageRows: number;
    rawBlogRows: number;
    rawRedirectRows: number;
  };
}

export class ExcelSourceLoader {
  private sourceDir: string;

  constructor(sourceDir?: string) {
    this.sourceDir = sourceDir || path.resolve(__dirname, "../source");
  }

  public loadPages(): { pages: MappedPage[]; rawRows: number } {
    const filePath = path.join(this.sourceDir, "Pages.xlsx");
    const wb = XLSX.readFile(filePath, { raw: true });
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Pages"] || Object.values(wb.Sheets)[0], { defval: "" });
    
    const pages: MappedPage[] = [];
    const seenHandles = new Set<string>();

    for (const r of rows) {
      const p = mapPageRow(r);
      if (p.handle && !seenHandles.has(p.handle)) {
        seenHandles.add(p.handle);
        pages.push(p);
      }
    }

    return { pages, rawRows: rows.length };
  }

  public loadBlogs(): { blogs: MappedBlogPost[]; rawRows: number } {
    const filePath = path.join(this.sourceDir, "Blogs.xlsx");
    const wb = XLSX.readFile(filePath, { raw: true });
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Blog Posts"] || Object.values(wb.Sheets)[0], { defval: "" });

    const blogs: MappedBlogPost[] = [];
    const seenKeys = new Set<string>();

    for (const r of rows) {
      const b = mapBlogRow(r);
      const key = `${b.blog_handle}::${b.handle}`;
      if (b.handle && !seenKeys.has(key)) {
        seenKeys.add(key);
        blogs.push(b);
      }
    }

    return { blogs, rawRows: rows.length };
  }

  public loadRedirects(): { redirects: MappedRedirect[]; rawRows: number } {
    const filePath = path.join(this.sourceDir, "Redirects.xlsx");
    const wb = XLSX.readFile(filePath, { raw: true });
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Redirects"] || Object.values(wb.Sheets)[0], { defval: "" });

    const redirects: MappedRedirect[] = [];
    const seenFrom = new Set<string>();

    for (const r of rows) {
      const rd = mapRedirectRow(r);
      if (rd.from_path && !seenFrom.has(rd.from_path)) {
        seenFrom.add(rd.from_path);
        redirects.push(rd);
      }
    }

    return { redirects, rawRows: rows.length };
  }

  public loadCollections(): {
    collections: MappedCollection[];
    links: Array<{ productHandle: string; collectionHandle: string }>;
    rawRows: number;
  } {
    const filePath = path.join(this.sourceDir, "Collections.xlsx");
    const wb = XLSX.readFile(filePath, { raw: true });
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Collections"] || Object.values(wb.Sheets)[0], { defval: "" });

    const collectionMap = new Map<string, MappedCollection>();
    const linkSet = new Set<string>();
    const links: Array<{ productHandle: string; collectionHandle: string }> = [];

    let currentCollectionHandle = "";

    for (const r of rows) {
      if (r["Handle"]) {
        currentCollectionHandle = String(r["Handle"]).trim().toLowerCase();
      }

      if (r["Title"] && (r["Top Row"] === true || r["TopRow"] === true || r["Handle"])) {
        const handle = String(r["Handle"] || currentCollectionHandle).trim().toLowerCase();
        if (handle && !collectionMap.has(handle)) {
          collectionMap.set(handle, mapCollectionRow(r));
        }
      }

      const prodHandle = r["Sort: Product Handle"] ? String(r["Sort: Product Handle"]).trim().toLowerCase() : "";
      if (currentCollectionHandle && prodHandle) {
        const linkKey = `${prodHandle}::${currentCollectionHandle}`;
        if (!linkSet.has(linkKey)) {
          linkSet.add(linkKey);
          links.push({ productHandle: prodHandle, collectionHandle: currentCollectionHandle });
        }
      }
    }

    return {
      collections: Array.from(collectionMap.values()),
      links,
      rawRows: rows.length,
    };
  }

  public loadProducts(): {
    products: MappedProduct[];
    variants: MappedVariant[];
    media: MappedMedia[];
    productCollectionLinks: Array<{ productHandle: string; collectionHandle: string }>;
    rawRows: number;
  } {
    const filePath = path.join(this.sourceDir, "Products.xlsx");
    const wb = XLSX.readFile(filePath, { raw: true });
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Products"] || Object.values(wb.Sheets)[0], { defval: "" });

    const productMap = new Map<string, MappedProduct>();
    const variants: MappedVariant[] = [];
    const media: MappedMedia[] = [];
    const linkSet = new Set<string>();
    const productCollectionLinks: Array<{ productHandle: string; collectionHandle: string }> = [];

    const seenVariants = new Set<string>();
    const seenMedia = new Set<string>();

    let currentProductHandle = "";
    let variantPosCounter = 1;
    let mediaPosCounter = 1;

    for (const r of rows) {
      if (r["Handle"]) {
        const newHandle = String(r["Handle"]).trim().toLowerCase();
        if (newHandle !== currentProductHandle) {
          currentProductHandle = newHandle;
          variantPosCounter = 1;
          mediaPosCounter = 1;
        }
      }

      if (r["Title"] && (r["Top Row"] === true || r["TopRow"] === true || r["Handle"])) {
        const handle = String(r["Handle"] || currentProductHandle).trim().toLowerCase();
        if (handle && !productMap.has(handle)) {
          productMap.set(handle, mapProductRow(r));
        }
      }

      // Parse Collections column on Product row if present
      const rawCollections = r["Collections"] || r["Custom Collections"] || r["Smart Collections"];
      if (currentProductHandle && rawCollections) {
        const colList = String(rawCollections)
          .split(",")
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean);
        for (const colHandle of colList) {
          const linkKey = `${currentProductHandle}::${colHandle}`;
          if (!linkSet.has(linkKey)) {
            linkSet.add(linkKey);
            productCollectionLinks.push({ productHandle: currentProductHandle, collectionHandle: colHandle });
          }
        }
      }

      // Parse Variant
      const varId = r["Variant ID"] || r["Variant SKU"] || r["Option1 Value"];
      if (currentProductHandle && varId) {
        const mappedVar = mapVariantRow(r, currentProductHandle, variantPosCounter);
        const varKey = `${currentProductHandle}::${mappedVar.source_id || mappedVar.sku || mappedVar.title}`;
        if (!seenVariants.has(varKey)) {
          seenVariants.add(varKey);
          variants.push(mappedVar);
          variantPosCounter++;
        }
      }

      // Parse Media / Image
      if (currentProductHandle && r["Image Src"]) {
        const mappedMedia = mapMediaRow(r, currentProductHandle, mediaPosCounter);
        if (mappedMedia) {
          const mediaKey = `${currentProductHandle}::${mappedMedia.source_url}`;
          if (!seenMedia.has(mediaKey)) {
            seenMedia.add(mediaKey);
            media.push(mappedMedia);
            mediaPosCounter++;
          }
        }
      }
    }

    return {
      products: Array.from(productMap.values()),
      variants,
      media,
      productCollectionLinks,
      rawRows: rows.length,
    };
  }

  public loadAll(): LoadedMigrationData {
    console.log("Loading Pages.xlsx...");
    const pagesData = this.loadPages();

    console.log("Loading Blogs.xlsx...");
    const blogsData = this.loadBlogs();

    console.log("Loading Redirects.xlsx...");
    const redirectsData = this.loadRedirects();

    console.log("Loading Collections.xlsx...");
    const collectionsData = this.loadCollections();

    console.log("Loading Products.xlsx...");
    const productsData = this.loadProducts();

    // Merge collection product links from both files
    const allLinksMap = new Map<string, { productHandle: string; collectionHandle: string }>();
    for (const l of collectionsData.links) {
      allLinksMap.set(`${l.productHandle}::${l.collectionHandle}`, l);
    }
    for (const l of productsData.productCollectionLinks) {
      allLinksMap.set(`${l.productHandle}::${l.collectionHandle}`, l);
    }

    return {
      collections: collectionsData.collections,
      collectionProductLinks: Array.from(allLinksMap.values()),
      products: productsData.products,
      variants: productsData.variants,
      media: productsData.media,
      pages: pagesData.pages,
      blogs: blogsData.blogs,
      redirects: redirectsData.redirects,
      stats: {
        rawCollectionRows: collectionsData.rawRows,
        rawProductRows: productsData.rawRows,
        rawPageRows: pagesData.rawRows,
        rawBlogRows: blogsData.rawRows,
        rawRedirectRows: redirectsData.rawRows,
      },
    };
  }
}
