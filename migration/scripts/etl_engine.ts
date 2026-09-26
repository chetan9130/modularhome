import * as fs from "fs";
import * as path from "path";
import { DatabaseService } from "./db";
import { ExcelSourceLoader, LoadedMigrationData } from "./excel_loader";
import { validateCollection, MappedCollection } from "../mappers/collections.mapper";
import { validateProduct, MappedProduct } from "../mappers/products.mapper";
import { validateVariant, MappedVariant } from "../mappers/variants.mapper";
import { validateMedia, MappedMedia } from "../mappers/media.mapper";
import { validateProductCollection } from "../mappers/product_collections.mapper";
import { validatePage, MappedPage } from "../mappers/pages.mapper";
import { validateBlogPost, MappedBlogPost } from "../mappers/blogs.mapper";
import { validateRedirect, MappedRedirect } from "../mappers/redirects.mapper";
import {
  generateProductUrlMigration,
  generateCollectionUrlMigration,
  generatePageUrlMigration,
  generateBlogUrlMigration,
  MappedUrlMigration,
} from "../mappers/url_migrations.mapper";
import { RejectedRecord } from "../validators/types";
import { BrandingAuditFinding } from "../mappers/branding_cleaner";

export interface ETLRunOptions {
  isDryRun: boolean;
  batchSize?: number;
}

export interface StageResult {
  stageName: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  sourceRecords: number;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  rejected: number;
  errors: number;
  durationMs: number;
}

export class ETLEngine {
  private db: DatabaseService;
  private loader: ExcelSourceLoader;
  private rejectedRecords: RejectedRecord[] = [];
  private brandingFindings: BrandingAuditFinding[] = [];

  constructor(db?: DatabaseService, loader?: ExcelSourceLoader) {
    this.db = db || new DatabaseService();
    this.loader = loader || new ExcelSourceLoader();
  }

  public async run(options: ETLRunOptions): Promise<{
    success: boolean;
    stages: StageResult[];
    totalRejected: number;
    brandingFindingsCount: number;
    reportsPath: string;
  }> {
    const startTime = Date.now();
    const stageResults: StageResult[] = [];
    const batchSize = options.batchSize || 250;

    console.log("==================================================");
    console.log(
      options.isDryRun
        ? "MODULARHOME ETL MIGRATION — DRY RUN MODE (NO WRITES)"
        : "MODULARHOME ETL MIGRATION — PRODUCTION IMPORT"
    );
    console.log("==================================================");
    console.log(`Started at: ${new Date().toISOString()}`);

    // Load source data
    console.log("\n[1/10] Loading source Excel files...");
    const data: LoadedMigrationData = this.loader.loadAll();
    console.log("Source data loaded successfully.");

    // Lookups for relationship validation & foreign keys
    const validCollectionHandles = new Set(data.collections.map((c) => c.handle));
    const validProductHandles = new Set(data.products.map((p) => p.handle));

    // Get existing database state
    const { productHandleToId: existingProductMap, collectionHandleToId: existingCollectionMap } =
      await this.db.getEntityLookups();

    // --------------------------------------------------
    // STAGE 1: Collections
    // --------------------------------------------------
    console.log("\n[2/10] Processing Collections...");
    const colStage = await this.processCollections(data.collections, existingCollectionMap, options, batchSize);
    stageResults.push(colStage);

    // Update collection map if production
    let runtimeCollectionMap = existingCollectionMap;
    if (!options.isDryRun) {
      const refreshed = await this.db.getEntityLookups();
      runtimeCollectionMap = refreshed.collectionHandleToId;
    }

    // --------------------------------------------------
    // STAGE 2: Products
    // --------------------------------------------------
    console.log("\n[3/10] Processing Products...");
    const prodStage = await this.processProducts(data.products, existingProductMap, options, batchSize);
    stageResults.push(prodStage);

    // Update product map if production
    let runtimeProductMap = existingProductMap;
    if (!options.isDryRun) {
      const refreshed = await this.db.getEntityLookups();
      runtimeProductMap = refreshed.productHandleToId;
    }

    // --------------------------------------------------
    // STAGE 3: Variants
    // --------------------------------------------------
    console.log("\n[4/10] Processing Variants...");
    const varStage = await this.processVariants(
      data.variants,
      validProductHandles,
      runtimeProductMap,
      options,
      batchSize
    );
    stageResults.push(varStage);

    // --------------------------------------------------
    // STAGE 4: Media
    // --------------------------------------------------
    console.log("\n[5/10] Processing Media...");
    const mediaStage = await this.processMedia(
      data.media,
      validProductHandles,
      runtimeProductMap,
      options,
      batchSize
    );
    stageResults.push(mediaStage);

    // --------------------------------------------------
    // STAGE 5: Product ↔ Collection Relationships
    // --------------------------------------------------
    console.log("\n[6/10] Processing Product ↔ Collection Relationships...");
    const relStage = await this.processRelationships(
      data.collectionProductLinks,
      validProductHandles,
      validCollectionHandles,
      runtimeProductMap,
      runtimeCollectionMap,
      options,
      batchSize
    );
    stageResults.push(relStage);

    // --------------------------------------------------
    // STAGE 6: Pages
    // --------------------------------------------------
    console.log("\n[7/10] Processing Pages...");
    const pageStage = await this.processPages(data.pages, options, batchSize);
    stageResults.push(pageStage);

    // --------------------------------------------------
    // STAGE 7: Blogs
    // --------------------------------------------------
    console.log("\n[8/10] Processing Blogs...");
    const blogStage = await this.processBlogs(data.blogs, options, batchSize);
    stageResults.push(blogStage);

    // --------------------------------------------------
    // STAGE 8: Redirects
    // --------------------------------------------------
    console.log("\n[9/10] Processing Existing Redirects...");
    const redirectStage = await this.processRedirects(data.redirects, options, batchSize);
    stageResults.push(redirectStage);

    // --------------------------------------------------
    // STAGE 9: ModularHome Old → New URL Mappings
    // --------------------------------------------------
    console.log("\n[10/10] Generating & Processing URL Mappings...");
    const urlMapStage = await this.processUrlMappings(data, options, batchSize);
    stageResults.push(urlMapStage);

    // Generate Reports and Rejection Artifacts
    const reportsPath = this.generateReports(options, stageResults, data, startTime);

    console.log("\n==================================================");
    console.log(options.isDryRun ? "DRY RUN SUMMARY" : "PRODUCTION IMPORT SUMMARY");
    console.log("==================================================");
    console.table(stageResults);

    await this.db.close();

    const hasErrors = stageResults.some((s) => s.errors > 0 || s.status === "FAILED");
    return {
      success: !hasErrors,
      stages: stageResults,
      totalRejected: this.rejectedRecords.length,
      brandingFindingsCount: this.brandingFindings.length,
      reportsPath,
    };
  }

  // --- STAGE PROCESSORS ---

  private async processCollections(
    collections: LoadedMigrationData["collections"],
    existingMap: Map<string, string>,
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let updated = 0;
    let rejected = 0;
    let errors = 0;

    const validCollections: MappedCollection[] = [];

    for (let i = 0; i < collections.length; i++) {
      const col = collections[i];
      const val = validateCollection(col);
      if (!val.isValid) {
        rejected++;
        this.rejectedRecords.push({
          entityType: "collection",
          sourceRowIndex: i + 1,
          sourceId: col.source_id,
          handle: col.handle,
          title: col.title,
          status: "REJECTED",
          reason: val.errors.map((e) => e.message).join("; "),
          errors: val.errors,
          recommendedAction: "Verify collection handle and title in source export",
          rawRecord: col,
        });
        continue;
      }

      this.brandingFindings.push(...col.findings);

      if (existingMap.has(col.handle)) {
        updated++;
      } else {
        created++;
      }
      validCollections.push(col);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        for (let i = 0; i < validCollections.length; i += batchSize) {
          const chunk = validCollections.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const col of chunk) {
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, now())`);
            values.push(col.handle, col.title, col.description_html, col.seo_title, col.seo_description, col.source_id, col.published);
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
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Collections import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "1. Collections",
      status: errors > 0 ? "FAILED" : rejected > 0 ? "WARNING" : "SUCCESS",
      sourceRecords: collections.length,
      processed: validCollections.length,
      created,
      updated,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processProducts(
    products: LoadedMigrationData["products"],
    existingMap: Map<string, string>,
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let updated = 0;
    let rejected = 0;
    let errors = 0;

    const validProducts: MappedProduct[] = [];

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      const val = validateProduct(prod);
      if (!val.isValid) {
        rejected++;
        this.rejectedRecords.push({
          entityType: "product",
          sourceRowIndex: i + 1,
          sourceId: prod.source_id,
          handle: prod.handle,
          title: prod.title,
          status: "REJECTED",
          reason: val.errors.map((e) => e.message).join("; "),
          errors: val.errors,
          recommendedAction: "Fix missing product handle or title",
          rawRecord: prod,
        });
        continue;
      }

      this.brandingFindings.push(...prod.findings);

      if (existingMap.has(prod.handle)) {
        updated++;
      } else {
        created++;
      }
      validProducts.push(prod);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        for (let i = 0; i < validProducts.length; i += batchSize) {
          const chunk = validProducts.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const prod of chunk) {
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, now())`);
            values.push(
              prod.handle,
              prod.title,
              prod.description_html,
              prod.vendor,
              prod.product_type,
              prod.status,
              prod.seo_title,
              prod.seo_description,
              prod.source_id,
              prod.published_at
            );
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO products (handle, title, description_html, vendor, product_type, status, seo_title, seo_description, source_id, published_at, updated_at)
              VALUES ${placeholders.join(", ")}
              ON CONFLICT (handle) DO UPDATE SET
                title = EXCLUDED.title,
                description_html = EXCLUDED.description_html,
                vendor = EXCLUDED.vendor,
                product_type = EXCLUDED.product_type,
                status = EXCLUDED.status,
                seo_title = EXCLUDED.seo_title,
                seo_description = EXCLUDED.seo_description,
                source_id = EXCLUDED.source_id,
                published_at = EXCLUDED.published_at,
                updated_at = now();
            `;
            await client.query(sql, values);
          }
        }
        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Products import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "2. Products",
      status: errors > 0 ? "FAILED" : rejected > 0 ? "WARNING" : "SUCCESS",
      sourceRecords: products.length,
      processed: validProducts.length,
      created,
      updated,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processVariants(
    variants: LoadedMigrationData["variants"],
    validProductHandles: Set<string>,
    productMap: Map<string, string>,
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let rejected = 0;
    let errors = 0;

    const validVariants: MappedVariant[] = [];

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const productExists = validProductHandles.has(v.productHandle);
      const val = validateVariant(v, productExists);

      if (!val.isValid) {
        rejected++;
        this.rejectedRecords.push({
          entityType: "variant",
          sourceRowIndex: i + 1,
          sourceId: v.source_id,
          handle: v.productHandle,
          title: v.title,
          status: "REJECTED",
          reason: val.errors.map((e) => e.message).join("; "),
          errors: val.errors,
          recommendedAction: "Ensure parent product exists and price is valid",
          rawRecord: v,
        });
        continue;
      }

      created++;
      validVariants.push(v);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        await client.query("DELETE FROM product_variants;");

        for (let i = 0; i < validVariants.length; i += batchSize) {
          const chunk = validVariants.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const item of chunk) {
            const productId = productMap.get(item.productHandle);
            if (!productId) continue;

            placeholders.push(
              `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
            );
            values.push(
              productId,
              item.sku,
              item.barcode,
              item.title,
              item.option1,
              item.option2,
              item.option3,
              item.price,
              item.compare_at_price,
              item.inventory_quantity,
              item.source_id,
              item.position
            );
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO product_variants (product_id, sku, barcode, title, option1, option2, option3, price, compare_at_price, inventory_quantity, source_id, position)
              VALUES ${placeholders.join(", ")};
            `;
            await client.query(sql, values);
          }
        }
        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Variants import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "3. Variants",
      status: errors > 0 ? "FAILED" : rejected > 0 ? "WARNING" : "SUCCESS",
      sourceRecords: variants.length,
      processed: validVariants.length,
      created,
      updated: 0,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processMedia(
    media: LoadedMigrationData["media"],
    validProductHandles: Set<string>,
    productMap: Map<string, string>,
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let rejected = 0;
    let errors = 0;

    const validMedia: MappedMedia[] = [];

    for (let i = 0; i < media.length; i++) {
      const m = media[i];
      const productExists = validProductHandles.has(m.productHandle);
      const val = validateMedia(m, productExists);

      if (!val.isValid) {
        rejected++;
        this.rejectedRecords.push({
          entityType: "media",
          sourceRowIndex: i + 1,
          sourceId: m.source_id,
          handle: m.productHandle,
          title: m.source_url,
          status: "REJECTED",
          reason: val.errors.map((e) => e.message).join("; "),
          errors: val.errors,
          recommendedAction: "Check valid image URL and parent product association",
          rawRecord: m,
        });
        continue;
      }

      created++;
      validMedia.push(m);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        await client.query("DELETE FROM product_media;");

        for (let i = 0; i < validMedia.length; i += batchSize) {
          const chunk = validMedia.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const item of chunk) {
            const productId = productMap.get(item.productHandle);
            if (!productId) continue;

            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
            values.push(productId, item.source_url, item.alt_text, item.position, item.media_type, item.source_id);
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO product_media (product_id, source_url, alt_text, position, media_type, source_id)
              VALUES ${placeholders.join(", ")};
            `;
            await client.query(sql, values);
          }
        }
        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Media import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "4. Product Media",
      status: errors > 0 ? "FAILED" : rejected > 0 ? "WARNING" : "SUCCESS",
      sourceRecords: media.length,
      processed: validMedia.length,
      created,
      updated: 0,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processRelationships(
    links: LoadedMigrationData["collectionProductLinks"],
    validProductHandles: Set<string>,
    validCollectionHandles: Set<string>,
    productMap: Map<string, string>,
    collectionMap: Map<string, string>,
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let rejected = 0;
    let errors = 0;

    const validLinks: Array<{ productHandle: string; collectionHandle: string }> = [];

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const prodExists = validProductHandles.has(link.productHandle);
      const colExists = validCollectionHandles.has(link.collectionHandle);
      const val = validateProductCollection(link, prodExists, colExists);

      if (!val.isValid) {
        rejected++;
        continue;
      }

      created++;
      validLinks.push(link);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        await client.query("DELETE FROM product_collections;");

        for (let i = 0; i < validLinks.length; i += batchSize) {
          const chunk = validLinks.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const item of chunk) {
            const productId = productMap.get(item.productHandle);
            const collectionId = collectionMap.get(item.collectionHandle);
            if (!productId || !collectionId) continue;

            placeholders.push(`($${idx++}, $${idx++})`);
            values.push(productId, collectionId);
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO product_collections (product_id, collection_id)
              VALUES ${placeholders.join(", ")}
              ON CONFLICT (product_id, collection_id) DO NOTHING;
            `;
            await client.query(sql, values);
          }
        }
        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Relationships import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "5. Product ↔ Collection Memberships",
      status: errors > 0 ? "FAILED" : "SUCCESS",
      sourceRecords: links.length,
      processed: validLinks.length,
      created,
      updated: 0,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processPages(
    pages: LoadedMigrationData["pages"],
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let updated = 0;
    let rejected = 0;
    let errors = 0;

    const validPages: MappedPage[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const val = validatePage(page);
      if (!val.isValid) {
        rejected++;
        this.rejectedRecords.push({
          entityType: "page",
          sourceRowIndex: i + 1,
          sourceId: page.source_id,
          handle: page.handle,
          title: page.title,
          status: "REJECTED",
          reason: val.errors.map((e) => e.message).join("; "),
          errors: val.errors,
          recommendedAction: "Check page handle and title",
          rawRecord: page,
        });
        continue;
      }

      this.brandingFindings.push(...page.findings);
      created++;
      validPages.push(page);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        for (let i = 0; i < validPages.length; i += batchSize) {
          const chunk = validPages.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const page of chunk) {
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, now())`);
            values.push(page.handle, page.title, page.body_html, page.seo_title, page.seo_description, page.published, page.source_id);
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO pages (handle, title, body_html, seo_title, seo_description, published, source_id, updated_at)
              VALUES ${placeholders.join(", ")}
              ON CONFLICT (handle) DO UPDATE SET
                title = EXCLUDED.title,
                body_html = EXCLUDED.body_html,
                seo_title = EXCLUDED.seo_title,
                seo_description = EXCLUDED.seo_description,
                published = EXCLUDED.published,
                source_id = EXCLUDED.source_id,
                updated_at = now();
            `;
            await client.query(sql, values);
          }
        }
        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Pages import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "6. Pages",
      status: errors > 0 ? "FAILED" : rejected > 0 ? "WARNING" : "SUCCESS",
      sourceRecords: pages.length,
      processed: validPages.length,
      created,
      updated,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processBlogs(
    blogs: LoadedMigrationData["blogs"],
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let updated = 0;
    let rejected = 0;
    let errors = 0;

    const validBlogs: MappedBlogPost[] = [];

    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      const val = validateBlogPost(blog);
      if (!val.isValid) {
        rejected++;
        this.rejectedRecords.push({
          entityType: "blog",
          sourceRowIndex: i + 1,
          sourceId: blog.source_id,
          handle: blog.handle,
          title: blog.title,
          status: "REJECTED",
          reason: val.errors.map((e) => e.message).join("; "),
          errors: val.errors,
          recommendedAction: "Check blog handle and title",
          rawRecord: blog,
        });
        continue;
      }

      this.brandingFindings.push(...blog.findings);
      created++;
      validBlogs.push(blog);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        for (let i = 0; i < validBlogs.length; i += batchSize) {
          const chunk = validBlogs.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const blog of chunk) {
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
            values.push(
              blog.blog_handle,
              blog.handle,
              blog.title,
              blog.body_html,
              blog.excerpt,
              blog.author,
              blog.tags,
              blog.seo_title,
              blog.seo_description,
              blog.published_at,
              blog.source_id
            );
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO blog_posts (blog_handle, handle, title, body_html, excerpt, author, tags, seo_title, seo_description, published_at, source_id)
              VALUES ${placeholders.join(", ")}
              ON CONFLICT (blog_handle, handle) DO UPDATE SET
                title = EXCLUDED.title,
                body_html = EXCLUDED.body_html,
                excerpt = EXCLUDED.excerpt,
                author = EXCLUDED.author,
                tags = EXCLUDED.tags,
                seo_title = EXCLUDED.seo_title,
                seo_description = EXCLUDED.seo_description,
                published_at = EXCLUDED.published_at,
                source_id = EXCLUDED.source_id;
            `;
            await client.query(sql, values);
          }
        }
        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Blogs import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "7. Blogs / Articles",
      status: errors > 0 ? "FAILED" : rejected > 0 ? "WARNING" : "SUCCESS",
      sourceRecords: blogs.length,
      processed: validBlogs.length,
      created,
      updated,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processRedirects(
    redirects: LoadedMigrationData["redirects"],
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let rejected = 0;
    let errors = 0;

    const validRedirects: MappedRedirect[] = [];

    for (let i = 0; i < redirects.length; i++) {
      const rd = redirects[i];
      const val = validateRedirect(rd);
      if (!val.isValid) {
        rejected++;
        this.rejectedRecords.push({
          entityType: "redirect",
          sourceRowIndex: i + 1,
          sourceId: rd.from_path,
          handle: rd.from_path,
          title: `${rd.from_path} -> ${rd.to_path}`,
          status: "REJECTED",
          reason: val.errors.map((e) => e.message).join("; "),
          errors: val.errors,
          recommendedAction: "Check valid from_path and avoid circular redirects",
          rawRecord: rd,
        });
        continue;
      }

      created++;
      validRedirects.push(rd);
    }

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        for (let i = 0; i < validRedirects.length; i += batchSize) {
          const chunk = validRedirects.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const item of chunk) {
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
            values.push(item.from_path, item.to_path, item.http_status, item.source);
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO redirects (from_path, to_path, http_status, source)
              VALUES ${placeholders.join(", ")}
              ON CONFLICT (from_path) DO UPDATE SET
                to_path = EXCLUDED.to_path,
                http_status = EXCLUDED.http_status,
                source = EXCLUDED.source;
            `;
            await client.query(sql, values);
          }
        }
        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("Redirects import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "8. Existing Redirects",
      status: errors > 0 ? "FAILED" : rejected > 0 ? "WARNING" : "SUCCESS",
      sourceRecords: redirects.length,
      processed: validRedirects.length,
      created,
      updated: 0,
      skipped: 0,
      rejected,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  private async processUrlMappings(
    data: LoadedMigrationData,
    options: ETLRunOptions,
    batchSize: number
  ): Promise<StageResult> {
    const t0 = Date.now();
    let created = 0;
    let errors = 0;

    const urlMappings: MappedUrlMigration[] = [];
    const generatedRedirects: Array<{ from_path: string; to_path: string; http_status: number; source: string }> = [];

    // 1. Products: /products/{handle} -> /buildings/{handle}
    for (const p of data.products) {
      urlMappings.push(generateProductUrlMigration(p.handle, p.title));
      generatedRedirects.push({
        from_path: `/products/${p.handle}`,
        to_path: `/buildings/${p.handle}`,
        http_status: 301,
        source: "modularhome_migration",
      });
    }

    // 2. Collections: /collections/{handle} -> /collections/{handle}
    for (const c of data.collections) {
      urlMappings.push(generateCollectionUrlMigration(c.handle, c.title));
    }

    // 3. Pages: /pages/{handle} -> /{handle}
    for (const pg of data.pages) {
      urlMappings.push(generatePageUrlMigration(pg.handle, pg.title));
      generatedRedirects.push({
        from_path: `/pages/${pg.handle}`,
        to_path: `/${pg.handle}`,
        http_status: 301,
        source: "modularhome_migration",
      });
    }

    // 4. Blogs: /blogs/{blog}/{handle} -> /resources/{handle}
    for (const b of data.blogs) {
      urlMappings.push(generateBlogUrlMigration(b.blog_handle, b.handle, b.title));
      generatedRedirects.push({
        from_path: `/blogs/${b.blog_handle}/${b.handle}`,
        to_path: `/resources/${b.handle}`,
        http_status: 301,
        source: "modularhome_migration",
      });
    }

    created = urlMappings.length;

    if (!options.isDryRun) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN;");
        await client.query("DELETE FROM url_migrations;");

        // Insert url_migrations
        for (let i = 0; i < urlMappings.length; i += batchSize) {
          const chunk = urlMappings.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const item of chunk) {
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
            values.push(
              item.content_type,
              item.source_handle,
              item.old_modularhome_path,
              item.new_path,
              item.action,
              item.verified,
              item.notes
            );
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO url_migrations (content_type, source_handle, old_modularhome_path, new_path, action, verified, notes)
              VALUES ${placeholders.join(", ")};
            `;
            await client.query(sql, values);
          }
        }

        // Also upsert generated 301 redirects into redirects table
        for (let i = 0; i < generatedRedirects.length; i += batchSize) {
          const chunk = generatedRedirects.slice(i, i + batchSize);
          const values: any[] = [];
          const placeholders: string[] = [];

          let idx = 1;
          for (const item of chunk) {
            placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
            values.push(item.from_path, item.to_path, item.http_status, item.source);
          }

          if (placeholders.length > 0) {
            const sql = `
              INSERT INTO redirects (from_path, to_path, http_status, source)
              VALUES ${placeholders.join(", ")}
              ON CONFLICT (from_path) DO UPDATE SET
                to_path = EXCLUDED.to_path,
                http_status = EXCLUDED.http_status,
                source = EXCLUDED.source;
            `;
            await client.query(sql, values);
          }
        }

        await client.query("COMMIT;");
      } catch (err: any) {
        await client.query("ROLLBACK;");
        errors++;
        console.error("URL Mappings import error:", err);
      } finally {
        client.release();
      }
    }

    return {
      stageName: "9. ModularHome URL Mappings & 301s",
      status: errors > 0 ? "FAILED" : "SUCCESS",
      sourceRecords: urlMappings.length,
      processed: urlMappings.length,
      created,
      updated: 0,
      skipped: 0,
      rejected: 0,
      errors,
      durationMs: Date.now() - t0,
    };
  }

  // --- REPORT GENERATION ---

  private generateReports(
    options: ETLRunOptions,
    stages: StageResult[],
    data: LoadedMigrationData,
    startTime: number
  ): string {
    const reportsDir = path.resolve(__dirname, "../reports");
    const rejectedDir = path.resolve(__dirname, "../rejected");
    const logsDir = path.resolve(__dirname, "../logs");

    [reportsDir, rejectedDir, logsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    const mode = options.isDryRun ? "dry-run" : "production";

    // 1. Rejected Records CSV & JSON
    const rejectedByEntity: Record<string, RejectedRecord[]> = {};
    for (const r of this.rejectedRecords) {
      if (!rejectedByEntity[r.entityType]) rejectedByEntity[r.entityType] = [];
      rejectedByEntity[r.entityType].push(r);
    }

    for (const [entity, list] of Object.entries(rejectedByEntity)) {
      const csvLines = ["sourceRowIndex,sourceId,handle,title,reason,recommendedAction"];
      for (const item of list) {
        csvLines.push(
          `"${item.sourceRowIndex}","${item.sourceId}","${item.handle}","${item.title.replace(/"/g, '""')}","${item.reason.replace(/"/g, '""')}","${item.recommendedAction.replace(/"/g, '""')}"`
        );
      }
      fs.writeFileSync(path.join(rejectedDir, `rejected-${entity}.csv`), csvLines.join("\n"), "utf8");
    }

    fs.writeFileSync(
      path.join(rejectedDir, `rejected-all-${mode}.json`),
      JSON.stringify(this.rejectedRecords, null, 2),
      "utf8"
    );

    // 2. Branding Audit Report
    fs.writeFileSync(
      path.join(reportsDir, `branding-audit-findings.json`),
      JSON.stringify(this.brandingFindings, null, 2),
      "utf8"
    );

    // 3. Complete JSON Report
    const reportData = {
      runMode: options.isDryRun ? "DRY_RUN" : "PRODUCTION",
      timestamp: new Date().toISOString(),
      durationTotalMs: Date.now() - startTime,
      sourceFiles: [
        "Collections.xlsx",
        "Products.xlsx",
        "Pages.xlsx",
        "Blogs.xlsx",
        "Redirects.xlsx",
      ],
      sourceStats: data.stats,
      stageResults: stages,
      rejectedSummary: {
        total: this.rejectedRecords.length,
        byType: Object.fromEntries(
          Object.entries(rejectedByEntity).map(([k, v]) => [k, v.length])
        ),
      },
      brandingSummary: {
        totalFindingsNormalized: this.brandingFindings.length,
      },
    };

    const reportJsonPath = path.join(reportsDir, `${mode}-report.json`);
    fs.writeFileSync(reportJsonPath, JSON.stringify(reportData, null, 2), "utf8");

    // 4. Formatted Markdown Report
    const mdLines = [
      `# ModularHome Migration Report — ${options.isDryRun ? "Dry Run" : "Production Import"}`,
      ``,
      `**Generated:** ${new Date().toISOString()}`,
      `**Mode:** ${options.isDryRun ? "DRY RUN (0 Database Writes)" : "PRODUCTION (Live Supabase Postgres)"}`,
      `**Total Duration:** ${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      ``,
      `## 1. Import Stage Breakdown`,
      ``,
      `| Stage | Source Rows | Processed | Created | Updated | Rejected | Errors | Duration | Status |`,
      `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`,
      ...stages.map(
        (s) =>
          `| ${s.stageName} | ${s.sourceRecords} | ${s.processed} | ${s.created} | ${s.updated} | ${s.rejected} | ${s.errors} | ${(s.durationMs / 1000).toFixed(2)}s | **${s.status}** |`
      ),
      ``,
      `## 2. Rejection Summary`,
      `- **Total Rejected Records:** ${this.rejectedRecords.length}`,
      ...Object.entries(rejectedByEntity).map(([k, v]) => `  - ${k}: ${v.length} rejected (see \`migration/rejected/rejected-${k}.csv\`)`),
      ``,
      `## 3. SEO & Branding Audit`,
      `- **Customer-Facing References Normalized:** ${this.brandingFindings.length}`,
      `- Replaced \`amishbuiltcabins.com\` domains with \`https://modularhome.com\``,
      `- Replaced legacy phone numbers (\`502-298-8946\`) with \`+1 (812) 595-4033\``,
      `- Normalized Shopify internal links (\`/products/*\` → \`/buildings/*\`, \`/blogs/news/*\` → \`/resources/*\`)`,
      `- Preserved factual descriptive craftsmanship references ("Amish built")`,
      ``,
    ];

    const reportMdPath = path.join(reportsDir, `${mode}-report.md`);
    fs.writeFileSync(reportMdPath, mdLines.join("\n"), "utf8");

    return reportJsonPath;
  }
}
