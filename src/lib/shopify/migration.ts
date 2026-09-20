import { ShopifyClient } from "./client";
import { MigrationSummary, MigrationLogItem } from "./types";
import { supabaseAdmin, isSupabaseConfigured } from "../supabase";

export class ShopifyMigrator {
  private client: ShopifyClient;
  private logs: MigrationLogItem[] = [];

  constructor(client?: ShopifyClient) {
    this.client = client || new ShopifyClient();
  }

  private log(
    level: "INFO" | "SUCCESS" | "WARN" | "ERROR",
    category: "PRODUCTS" | "COLLECTIONS" | "PAGES" | "BLOGS" | "MEDIA" | "SEO" | "GENERAL",
    message: string,
    details?: any
  ) {
    const item: MigrationLogItem = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
    };
    this.logs.push(item);
  }

  public async runFullMigration(): Promise<MigrationSummary> {
    const startedAt = new Date().toISOString();
    const counts = {
      productsImported: 0,
      productsUpdated: 0,
      collectionsImported: 0,
      collectionsUpdated: 0,
      pagesImported: 0,
      pagesUpdated: 0,
      blogsImported: 0,
      blogsUpdated: 0,
      errorsCount: 0,
    };

    this.log("INFO", "GENERAL", "Starting Shopify to Supabase Migration...");

    if (!isSupabaseConfigured()) {
      this.log(
        "WARN",
        "GENERAL",
        "Supabase is not configured with live credentials. Running in mock/dry-run mode."
      );
    }

    // 1. Migrate Collections
    try {
      this.log("INFO", "COLLECTIONS", "Fetching collections from Shopify...");
      const shopifyCollections = await this.client.getCollections();
      this.log(
        "INFO",
        "COLLECTIONS",
        `Retrieved ${shopifyCollections.length} collections from Shopify.`
      );

      for (const col of shopifyCollections) {
        try {
          const slug = col.handle.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
          const bannerImage =
            col.image?.src ||
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop";

          const colData = {
            shopify_id: String(col.id),
            name: col.title,
            slug,
            description: col.body_html?.replace(/<[^>]*>?/gm, "") || col.title,
            tagline: `Engineered ${col.title}`,
            banner_image: bannerImage,
            image: bannerImage,
            status: "PUBLISHED",
            seo_title: `${col.title} | ModularHome`,
            meta_description: `Explore the ${col.title} collection of steel-frame modular homes.`,
            updated_at: new Date().toISOString(),
          };

          if (isSupabaseConfigured()) {
            const { data: existing } = await supabaseAdmin
              .from("collections")
              .select("id")
              .or(`shopify_id.eq.${col.id},slug.eq.${slug}`)
              .single();

            if (existing) {
              await supabaseAdmin
                .from("collections")
                .update(colData)
                .eq("id", existing.id);
              counts.collectionsUpdated++;
              this.log("SUCCESS", "COLLECTIONS", `Updated collection: ${col.title} (${slug})`);
            } else {
              await supabaseAdmin.from("collections").insert(colData);
              counts.collectionsImported++;
              this.log("SUCCESS", "COLLECTIONS", `Imported new collection: ${col.title}`);
            }
          } else {
            counts.collectionsImported++;
            this.log("INFO", "COLLECTIONS", `[Dry Run] Processed collection: ${col.title}`);
          }
        } catch (colErr: any) {
          counts.errorsCount++;
          this.log("ERROR", "COLLECTIONS", `Failed collection ${col.title}: ${colErr.message}`);
        }
      }
    } catch (err: any) {
      counts.errorsCount++;
      this.log("ERROR", "COLLECTIONS", `Failed fetching collections: ${err.message}`);
    }

    // 2. Migrate Products
    try {
      this.log("INFO", "PRODUCTS", "Fetching products from Shopify...");
      const shopifyProducts = await this.client.getProducts();
      this.log("INFO", "PRODUCTS", `Retrieved ${shopifyProducts.length} products from Shopify.`);

      for (const prod of shopifyProducts) {
        try {
          const slug = prod.handle.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
          const primaryImage =
            prod.images?.[0]?.src ||
            prod.image?.src ||
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop";

          const gallery = (prod.images || []).map((img) => img.src);
          const firstVariant = prod.variants?.[0];
          const startingPrice = firstVariant ? Number(firstVariant.price) || 50000 : 50000;
          const cleanDesc = prod.body_html ? prod.body_html.replace(/<[^>]*>?/gm, "").trim() : "";

          // Extract square footage, bedrooms, bathrooms from tags or title if available
          let sqft = 1000;
          let bedrooms = 2;
          let bathrooms = 2;

          if (prod.tags) {
            const sqftMatch = prod.tags.match(/(\d+)\s*(?:sqft|sq\s*ft)/i);
            if (sqftMatch) sqft = parseInt(sqftMatch[1], 10);

            const bedMatch = prod.tags.match(/(\d+)\s*(?:bed|bedroom)/i);
            if (bedMatch) bedrooms = parseInt(bedMatch[1], 10);

            const bathMatch = prod.tags.match(/(\d+)\s*(?:bath|bathroom)/i);
            if (bathMatch) bathrooms = parseInt(bathMatch[1], 10);
          }

          const productData = {
            shopify_id: String(prod.id),
            name: prod.title,
            slug,
            tagline: cleanDesc.slice(0, 120) || `Modern ${prod.title}`,
            description: prod.body_html || cleanDesc,
            short_description: cleanDesc.slice(0, 180),
            category: prod.product_type || "Residential",
            starting_price: startingPrice,
            sqft,
            bedrooms,
            bathrooms,
            stories: 1,
            primary_image: primaryImage,
            gallery,
            is_published: prod.status === "active",
            seo_title: `${prod.title} | ModularHome.com`,
            meta_description: cleanDesc.slice(0, 160) || `${prod.title} modular home package.`,
            image_alt_text: prod.title,
            updated_at: new Date().toISOString(),
          };

          if (isSupabaseConfigured()) {
            const { data: existing } = await supabaseAdmin
              .from("products")
              .select("id")
              .or(`shopify_id.eq.${prod.id},slug.eq.${slug}`)
              .single();

            if (existing) {
              await supabaseAdmin.from("products").update(productData).eq("id", existing.id);
              counts.productsUpdated++;
              this.log("SUCCESS", "PRODUCTS", `Updated product: ${prod.title} (${slug})`);
            } else {
              await supabaseAdmin.from("products").insert(productData);
              counts.productsImported++;
              this.log("SUCCESS", "PRODUCTS", `Imported new product: ${prod.title}`);
            }

            // Create 301 redirect from Shopify standard URL to ModularHome URL
            const shopifyUrl = `/products/${prod.handle}`;
            const targetUrl = `/buildings/${slug}`;
            await supabaseAdmin.from("redirects").upsert(
              {
                source_path: shopifyUrl,
                target_path: targetUrl,
                status_code: 301,
                is_active: true,
                notes: `Shopify product redirect for ${prod.title}`,
              },
              { onConflict: "source_path" }
            );
          } else {
            counts.productsImported++;
            this.log("INFO", "PRODUCTS", `[Dry Run] Processed product: ${prod.title}`);
          }
        } catch (prodErr: any) {
          counts.errorsCount++;
          this.log("ERROR", "PRODUCTS", `Failed product ${prod.title}: ${prodErr.message}`);
        }
      }
    } catch (err: any) {
      counts.errorsCount++;
      this.log("ERROR", "PRODUCTS", `Failed fetching products: ${err.message}`);
    }

    // 3. Migrate Pages
    try {
      this.log("INFO", "PAGES", "Fetching pages from Shopify...");
      const shopifyPages = await this.client.getPages();
      this.log("INFO", "PAGES", `Retrieved ${shopifyPages.length} pages from Shopify.`);

      for (const page of shopifyPages) {
        try {
          const slug = page.handle.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
          const pageData = {
            shopify_id: String(page.id),
            title: page.title,
            slug,
            content: page.body_html || "",
            status: "PUBLISHED",
            seo_title: `${page.title} | ModularHome`,
            meta_description:
              page.body_html?.replace(/<[^>]*>?/gm, "").slice(0, 160) || page.title,
            updated_at: new Date().toISOString(),
          };

          if (isSupabaseConfigured()) {
            const { data: existing } = await supabaseAdmin
              .from("pages")
              .select("id")
              .or(`shopify_id.eq.${page.id},slug.eq.${slug}`)
              .single();

            if (existing) {
              await supabaseAdmin.from("pages").update(pageData).eq("id", existing.id);
              counts.pagesUpdated++;
              this.log("SUCCESS", "PAGES", `Updated page: ${page.title} (${slug})`);
            } else {
              await supabaseAdmin.from("pages").insert(pageData);
              counts.pagesImported++;
              this.log("SUCCESS", "PAGES", `Imported new page: ${page.title}`);
            }

            // Create 301 redirect
            await supabaseAdmin.from("redirects").upsert(
              {
                source_path: `/pages/${page.handle}`,
                target_path: `/${slug}`,
                status_code: 301,
                is_active: true,
                notes: `Shopify page redirect for ${page.title}`,
              },
              { onConflict: "source_path" }
            );
          } else {
            counts.pagesImported++;
            this.log("INFO", "PAGES", `[Dry Run] Processed page: ${page.title}`);
          }
        } catch (pageErr: any) {
          counts.errorsCount++;
          this.log("ERROR", "PAGES", `Failed page ${page.title}: ${pageErr.message}`);
        }
      }
    } catch (err: any) {
      counts.errorsCount++;
      this.log("ERROR", "PAGES", `Failed fetching pages: ${err.message}`);
    }

    // 4. Migrate Blog Articles
    try {
      this.log("INFO", "BLOGS", "Fetching blog articles from Shopify...");
      const articles = await this.client.getArticles();
      this.log("INFO", "BLOGS", `Retrieved ${articles.length} articles from Shopify.`);

      for (const art of articles) {
        try {
          const slug = art.handle.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
          const tags = art.tags ? art.tags.split(",").map((t) => t.trim()) : [];
          const featuredImage =
            art.image?.src ||
            "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?q=80&w=1200&auto=format&fit=crop";

          const blogData = {
            shopify_id: String(art.id),
            title: art.title,
            slug,
            excerpt: art.summary_html?.replace(/<[^>]*>?/gm, "") || art.title,
            content: art.body_html || "",
            featured_image: featuredImage,
            author: art.author || "ModularHome Editorial Team",
            tags,
            categories: ["Engineering", "Guides"],
            status: "PUBLISHED",
            seo_title: `${art.title} | ModularHome Blog`,
            meta_description:
              art.summary_html?.replace(/<[^>]*>?/gm, "").slice(0, 160) || art.title,
            published_at: art.published_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (isSupabaseConfigured()) {
            const { data: existing } = await supabaseAdmin
              .from("blogs")
              .select("id")
              .or(`shopify_id.eq.${art.id},slug.eq.${slug}`)
              .single();

            if (existing) {
              await supabaseAdmin.from("blogs").update(blogData).eq("id", existing.id);
              counts.blogsUpdated++;
              this.log("SUCCESS", "BLOGS", `Updated blog: ${art.title} (${slug})`);
            } else {
              await supabaseAdmin.from("blogs").insert(blogData);
              counts.blogsImported++;
              this.log("SUCCESS", "BLOGS", `Imported new blog: ${art.title}`);
            }

            // Create 301 redirect
            await supabaseAdmin.from("redirects").upsert(
              {
                source_path: `/blogs/news/${art.handle}`,
                target_path: `/resources/${slug}`,
                status_code: 301,
                is_active: true,
                notes: `Shopify blog redirect for ${art.title}`,
              },
              { onConflict: "source_path" }
            );
          } else {
            counts.blogsImported++;
            this.log("INFO", "BLOGS", `[Dry Run] Processed blog: ${art.title}`);
          }
        } catch (blogErr: any) {
          counts.errorsCount++;
          this.log("ERROR", "BLOGS", `Failed blog article ${art.title}: ${blogErr.message}`);
        }
      }
    } catch (err: any) {
      counts.errorsCount++;
      this.log("ERROR", "BLOGS", `Failed fetching blog articles: ${err.message}`);
    }

    const completedAt = new Date().toISOString();
    this.log(
      "SUCCESS",
      "GENERAL",
      `Shopify Migration Completed! Imported/Updated ${counts.productsImported + counts.productsUpdated} products, ${counts.collectionsImported + counts.collectionsUpdated} collections, ${counts.pagesImported + counts.pagesUpdated} pages, ${counts.blogsImported + counts.blogsUpdated} blogs. Total Errors: ${counts.errorsCount}`
    );

    return {
      startedAt,
      completedAt,
      status: counts.errorsCount > 0 ? "COMPLETED" : "COMPLETED",
      counts,
      logs: this.logs,
    };
  }
}
