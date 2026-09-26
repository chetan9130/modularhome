# ModularHome.com — Shopify / Matrixify to Supabase ETL Mapping Documentation

This document defines the field-by-field mapping and transformation rules between the Matrixify/Shopify export workbooks and the ModularHome production Supabase schema.

---

## 1. Collections (`Collections.xlsx` → `collections` table)

| Source Excel Column | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| `Handle` | `collections.handle` | Trimmed, lowercase slug. Used for unique identification and URLs. |
| `Title` | `collections.title` | Direct text. Cleaned of redundant legacy suffix if applicable. |
| `Body HTML` | `collections.description_html` | Cleaned of legacy AmishBuiltCabins URLs, phone numbers, and hard-coded Shopify links. |
| `Metafield: title_tag [string]` / `SEO Title` | `collections.seo_title` | Appends `\| ModularHome` and removes legacy brand terms. |
| `Metafield: description_tag [string]` / `SEO Description` | `collections.seo_description` | Cleaned meta description, max 320 characters. |
| `ID` | `collections.source_id` | Stable Shopify Collection ID for idempotency and traceability. |
| `Published: Online Store` / `Published` | `collections.published` | Boolean flag. Defaults to `true` if published online. |
| `Created At` / `Updated At` | `created_at` / `updated_at` | Supabase timestamps. |

### Unmapped / Metadata Source Fields in Collections
- `Sort Order`, `Template Suffix`: Shopify theme-specific presentation fields, not used in Next.js backend.
- `Inclusion: Type`, `Condition: *`: Shopify dynamic collection rule criteria. The concrete evaluated product memberships are extracted from `Sort: Product Handle` / `Sort: Product ID` rows into the `product_collections` table.

---

## 2. Products (`Products.xlsx` → `products` table)

| Source Excel Column | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| `Handle` | `products.handle` | Unique product slug. Preserved exactly for URL stability. |
| `Title` | `products.title` | Product title. Preserved without modification. |
| `Body HTML` | `products.description_html` | Cleaned of legacy domain URLs, old phone numbers, and internal Shopify paths. Preserves factual descriptive phrases like "Amish built". |
| `Vendor` | `products.vendor` | Vendor name. Normalized to ModularHome or preserved vendor. |
| `Type` / `Product Type` | `products.product_type` | Category or building type (e.g., Cabin, ADU, Residential, House Kit). |
| `Status` | `products.status` | Lowercase status: `active`, `draft`, `archived`. |
| `Metafield: title_tag [string]` / `SEO Title` | `products.seo_title` | Cleaned SEO title with `\| ModularHome`. |
| `Metafield: description_tag [string]` / `SEO Description` | `products.seo_description` | Cleaned SEO meta description. |
| `ID` | `products.source_id` | Stable Shopify Product ID for idempotency. |
| `Published At` | `products.published_at` | ISO-8601 Timestamp of original publication. |
| `Created At` / `Updated At` | `created_at` / `updated_at` | Timestamps. |

### Unmapped / Metadata Source Fields in Products
- `Gift Card`, `Tags Command`, `Variant Inventory Item ID`: Shopify internal operational attributes.
- `Google Shopping Metafields` (`mm-google-shopping.*`): Kept in source audit files; not required for core Next.js CMS models.

---

## 3. Product Variants (`Products.xlsx` → `product_variants` table)

| Source Excel Column | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| Parent Product Row / `Handle` | `product_variants.product_id` | Foreign Key UUID referencing `products.id`. |
| `Variant SKU` | `product_variants.sku` | SKU code. Nullable. |
| `Variant Barcode` | `product_variants.barcode` | Barcode/UPC. Nullable. |
| `Option1 Value` + `Option2 Value` + `Option3 Value` | `product_variants.title` | Combined option values (e.g. "Default Title", "24x36 / Metal Roof"). |
| `Option1 Value` | `product_variants.option1` | Option 1 value. |
| `Option2 Value` | `product_variants.option2` | Option 2 value. |
| `Option3 Value` | `product_variants.option3` | Option 3 value. |
| `Variant Price` | `product_variants.price` | Numeric decimal price. |
| `Variant Compare At Price` | `product_variants.compare_at_price` | Numeric decimal original/strikethrough price. |
| `Variant Inventory Qty` | `product_variants.inventory_quantity` | Integer stock quantity. |
| `Variant ID` | `product_variants.source_id` | Stable Shopify Variant ID. |
| `Variant Position` | `product_variants.position` | Order index of variant. |

---

## 4. Product Media (`Products.xlsx` → `product_media` table)

| Source Excel Column | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| Parent Product Row / `Handle` | `product_media.product_id` | Foreign Key UUID referencing `products.id`. |
| `Image Src` | `product_media.source_url` | Full image URL. |
| `Image Alt Text` | `product_media.alt_text` | Descriptive alt text for accessibility and SEO. |
| `Image Position` | `product_media.position` | Integer display order position. |
| `Image Type` | `product_media.media_type` | `image` (or `video` if video asset). |
| `Image ID` / `ID` | `product_media.source_id` | Stable media asset identifier. |

---

## 5. Product ↔ Collection Memberships (`Collections.xlsx` / `Products.xlsx` → `product_collections` table)

| Source Association | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| Resolved Product Handle | `product_collections.product_id` | Foreign Key UUID referencing `products.id`. |
| Resolved Collection Handle | `product_collections.collection_id` | Foreign Key UUID referencing `collections.id`. |

---

## 6. Pages (`Pages.xlsx` → `pages` table)

| Source Excel Column | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| `Handle` | `pages.handle` | Unique page handle/slug (e.g., `about-us`, `contact`). |
| `Title` | `pages.title` | Page heading / title. |
| `Body HTML` | `pages.body_html` | Full HTML body with legacy contact and URL references replaced. |
| `Metafield: title_tag [string]` / `SEO Title` | `pages.seo_title` | Cleaned SEO title with `\| ModularHome`. |
| `Metafield: description_tag [string]` / `SEO Description` | `pages.seo_description` | Cleaned SEO meta description. |
| `Published` | `pages.published` | Boolean publication status. |
| `ID` | `pages.source_id` | Stable Shopify Page ID. |

---

## 7. Blog Posts (`Blogs.xlsx` → `blog_posts` table)

| Source Excel Column | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| `Blog Handle` | `blog_posts.blog_handle` | Blog category handle (default `news`). Part of composite key. |
| `Handle` | `blog_posts.handle` | Article slug. |
| `Title` | `blog_posts.title` | Article headline. |
| `Body HTML` | `blog_posts.body_html` | Full article content, normalized and sanitized. |
| `Excerpt HTML` / `Summary HTML` | `blog_posts.excerpt` | Article teaser / excerpt. |
| `Author` | `blog_posts.author` | Author name or default `ModularHome Editorial Team`. |
| `Tags` | `blog_posts.tags` | Comma-delimited taxonomy tags. |
| `Metafield: title_tag [string]` / `SEO Title` | `blog_posts.seo_title` | Cleaned SEO title. |
| `Metafield: description_tag [string]` / `SEO Description` | `blog_posts.seo_description` | Cleaned SEO meta description. |
| `Published At` | `blog_posts.published_at` | Publication timestamp. |
| `ID` | `blog_posts.source_id` | Stable Shopify Article ID. |

---

## 8. Redirects (`Redirects.xlsx` → `redirects` table)

| Source Excel Column | Supabase Field | Transformation / Business Logic |
| :--- | :--- | :--- |
| `Path` / `Redirect From` | `redirects.from_path` | Source path (normalized to start with `/` and stripped of host). |
| `Target` / `Redirect To` | `redirects.to_path` | Target path or URL. |
| `Status Code` | `redirects.http_status` | HTTP status (301, 302, 307, 308). Default `301`. |
| Source Identifier | `redirects.source` | `shopify` |

---

## 9. ModularHome Old → New URL Mappings (`url_migrations` table)

| Field | Description / Value |
| :--- | :--- |
| `content_type` | `product`, `collection`, `page`, `blog` |
| `source_handle` | Source entity handle |
| `old_modularhome_path` | `/products/{handle}`, `/collections/{handle}`, `/pages/{handle}`, `/blogs/{blog}/{handle}` |
| `new_path` | `/buildings/{handle}`, `/collections/{handle}`, `/{handle}`, `/resources/{handle}` |
| `action` | `REDIRECT_301` or `PRESERVE` |
| `verified` | `true` |
| `notes` | Context and migration verification details |
