import {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyPage,
  ShopifyArticle,
} from "./types";

export interface ShopifyConfig {
  storeDomain: string;
  accessToken: string;
  apiVersion?: string;
}

export class ShopifyClient {
  private storeDomain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config?: Partial<ShopifyConfig>) {
    const domain =
      config?.storeDomain ||
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.SHOPIFY_SHOP_NAME ||
      "";
    // Sanitize domain
    this.storeDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    this.accessToken =
      config?.accessToken || process.env.SHOPIFY_ACCESS_TOKEN || "";
    this.apiVersion = config?.apiVersion || "2024-01";
  }

  public isConfigured(): boolean {
    return Boolean(
      this.storeDomain &&
        this.accessToken &&
        !this.storeDomain.includes("your-store-name")
    );
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error(
        "Shopify credentials not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN in .env"
      );
    }

    const url = `https://${this.storeDomain}/admin/api/${this.apiVersion}/${endpoint.replace(/^\//, "")}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken,
        ...options.headers,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedMessage = errorJson.errors || errorJson.message || errorText;
      } catch {}
      throw new Error(`Shopify API Error (${response.status}): ${parsedMessage}`);
    }

    return (await response.json()) as T;
  }

  /**
   * Fetch all products from Shopify
   */
  public async getProducts(limit = 250): Promise<ShopifyProduct[]> {
    if (!this.isConfigured()) {
      return this.getMockProducts();
    }
    const data = await this.request<{ products: ShopifyProduct[] }>(
      `products.json?limit=${limit}&status=active`
    );
    return data.products || [];
  }

  /**
   * Fetch all custom and smart collections
   */
  public async getCollections(): Promise<ShopifyCollection[]> {
    if (!this.isConfigured()) {
      return this.getMockCollections();
    }
    const custom = await this.request<{ custom_collections: ShopifyCollection[] }>(
      "custom_collections.json"
    ).catch(() => ({ custom_collections: [] }));
    const smart = await this.request<{ smart_collections: ShopifyCollection[] }>(
      "smart_collections.json"
    ).catch(() => ({ smart_collections: [] }));

    return [...(custom.custom_collections || []), ...(smart.smart_collections || [])];
  }

  /**
   * Fetch pages
   */
  public async getPages(): Promise<ShopifyPage[]> {
    if (!this.isConfigured()) {
      return this.getMockPages();
    }
    const data = await this.request<{ pages: ShopifyPage[] }>("pages.json");
    return data.pages || [];
  }

  /**
   * Fetch blogs and their articles
   */
  public async getArticles(): Promise<ShopifyArticle[]> {
    if (!this.isConfigured()) {
      return this.getMockArticles();
    }
    try {
      const blogsRes = await this.request<{ blogs: Array<{ id: number; title: string }> }>(
        "blogs.json"
      );
      const blogs = blogsRes.blogs || [];
      const allArticles: ShopifyArticle[] = [];

      for (const b of blogs) {
        const artRes = await this.request<{ articles: ShopifyArticle[] }>(
          `blogs/${b.id}/articles.json`
        );
        if (artRes.articles) {
          allArticles.push(...artRes.articles);
        }
      }
      return allArticles;
    } catch {
      return [];
    }
  }

  // Realistic Fallback / Mock Data Generator for Safe Testing & Demos
  private getMockProducts(): ShopifyProduct[] {
    return [
      {
        id: "shopify_prod_101",
        title: "The Scandinavian Cabin 850",
        handle: "scandinavian-cabin-850",
        body_html:
          "<p>Engineered A-frame modular cabin kit featuring 2 bedrooms, double-glazed glass walls, and clear-span steel construction.</p>",
        product_type: "Cabins",
        status: "active",
        tags: "cabin, a-frame, modular, 2-bedroom, prefab",
        variants: [
          {
            id: "var_101",
            title: "Default Title",
            price: "48500.00",
            compare_at_price: "52000.00",
          },
        ],
        images: [
          {
            id: "img_101",
            src: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
            alt: "Scandinavian Cabin 850 Exterior",
          },
        ],
      },
      {
        id: "shopify_prod_102",
        title: "The Texas Barndominium 2200",
        handle: "texas-barndominium-2200",
        body_html:
          "<p>Spacious open-concept steel residence with 4 bedrooms, 3 baths, and an integrated 800 sqft garage / workshop.</p>",
        product_type: "Barndominiums",
        status: "active",
        tags: "barndominium, steel home, 4-bedroom, workshop",
        variants: [
          {
            id: "var_102",
            title: "Standard Framing",
            price: "98000.00",
            compare_at_price: "110000.00",
          },
        ],
        images: [
          {
            id: "img_102",
            src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
            alt: "Texas Barndominium Exterior",
          },
        ],
      },
      {
        id: "shopify_prod_103",
        title: "The Urban Suite ADU 450",
        handle: "urban-suite-adu-450",
        body_html:
          "<p>Turnkey permit-ready backyard ADU unit designed for quick deployment, rental income, or multi-generational living.</p>",
        product_type: "ADUs",
        status: "active",
        tags: "adu, backyard suite, granny flat, 1-bedroom",
        variants: [
          {
            id: "var_103",
            title: "Turnkey Unit",
            price: "34900.00",
            compare_at_price: "38000.00",
          },
        ],
        images: [
          {
            id: "img_103",
            src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
            alt: "Urban Suite ADU Exterior",
          },
        ],
      },
    ];
  }

  private getMockCollections(): ShopifyCollection[] {
    return [
      {
        id: "shopify_col_201",
        title: "Precision Cabins Series",
        handle: "cabins-series",
        body_html: "Pre-engineered luxury cabin kits with rapid installation.",
        image: {
          src: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
          alt: "Cabins Banner",
        },
      },
      {
        id: "shopify_col_202",
        title: "Modern Barndominiums",
        handle: "modern-barndominiums",
        body_html: "Heavy gauge clear-span steel frame homes.",
        image: {
          src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
          alt: "Barndominiums Banner",
        },
      },
    ];
  }

  private getMockPages(): ShopifyPage[] {
    return [
      {
        id: "shopify_page_301",
        title: "About ModularHome Factory",
        handle: "about-factory",
        body_html:
          "<p>ModularHome is redefining modern residential construction through precision robotics, cold-formed steel framing, and climate-controlled indoor assembly.</p>",
        author: "Founder",
      },
      {
        id: "shopify_page_302",
        title: "Warranty & Engineering Certifications",
        handle: "warranty-certifications",
        body_html:
          "<p>Every ModularHome structure is backed by our 10-Year Structural Steel Warranty and engineered to exceed IBC wind and snow loads nationwide.</p>",
        author: "Engineering Dept",
      },
    ];
  }

  private getMockArticles(): ShopifyArticle[] {
    return [
      {
        id: "shopify_art_401",
        title: "Why Cold-Formed Steel Framing Outlasts Traditional Lumber",
        handle: "why-steel-framing-outlasts-lumber",
        body_html:
          "<p>Learn why steel framing provides unmatched dimensional stability, zero termite vulnerability, and exceptional seismic/hurricane resistance compared to stick-built lumber.</p>",
        summary_html:
          "An in-depth breakdown of steel modular advantages over standard wood framing.",
        author: "Chief Engineer",
        tags: "engineering, steel framing, modular homes",
        image: {
          src: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?q=80&w=1200&auto=format&fit=crop",
          alt: "Steel Framing Construction",
        },
      },
      {
        id: "shopify_art_402",
        title: "How to Prepare Your Land for a Modular Home Delivery",
        handle: "how-to-prepare-land-for-modular-delivery",
        body_html:
          "<p>Step-by-step guide on grading, soil testing, utility trenching, and crane access planning for a seamless home delivery day.</p>",
        summary_html:
          "Essential checklist for site prep, foundations, and crane access requirements.",
        author: "Installation Team",
        tags: "site prep, delivery, guide",
        image: {
          src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
          alt: "Site Preparation and Crane",
        },
      },
    ];
  }
}
