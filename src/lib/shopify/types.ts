export interface ShopifyProduct {
  id: number | string;
  title: string;
  handle: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  status: string;
  tags?: string;
  variants?: Array<{
    id: number | string;
    title: string;
    price: string;
    sku?: string;
    compare_at_price?: string;
    inventory_quantity?: number;
  }>;
  images?: Array<{
    id: number | string;
    src: string;
    alt?: string;
    position?: number;
  }>;
  image?: {
    src: string;
  };
  options?: Array<{
    name: string;
    values: string[];
  }>;
  metafields?: Array<{
    key: string;
    value: string;
    namespace?: string;
  }>;
}

export interface ShopifyCollection {
  id: number | string;
  title: string;
  handle: string;
  body_html?: string;
  image?: {
    src: string;
    alt?: string;
  };
  sort_order?: string;
  published_at?: string;
}

export interface ShopifyPage {
  id: number | string;
  title: string;
  handle: string;
  body_html?: string;
  author?: string;
  published_at?: string;
}

export interface ShopifyArticle {
  id: number | string;
  title: string;
  handle: string;
  body_html?: string;
  summary_html?: string;
  author?: string;
  tags?: string;
  published_at?: string;
  image?: {
    src: string;
    alt?: string;
  };
}

export interface MigrationLogItem {
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR";
  category: "PRODUCTS" | "COLLECTIONS" | "PAGES" | "BLOGS" | "MEDIA" | "SEO" | "GENERAL";
  message: string;
  details?: any;
}

export interface MigrationSummary {
  startedAt: string;
  completedAt?: string;
  status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
  counts: {
    productsImported: number;
    productsUpdated: number;
    collectionsImported: number;
    collectionsUpdated: number;
    pagesImported: number;
    pagesUpdated: number;
    blogsImported: number;
    blogsUpdated: number;
    errorsCount: number;
  };
  logs: MigrationLogItem[];
}
