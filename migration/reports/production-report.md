# ModularHome Migration Report — Production Import

**Generated:** 2026-09-26T06:41:45.799Z
**Mode:** PRODUCTION (Live Supabase Postgres)
**Total Duration:** 488.15s

## 1. Import Stage Breakdown

| Stage | Source Rows | Processed | Created | Updated | Rejected | Errors | Duration | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1. Collections | 461 | 461 | 0 | 461 | 0 | 0 | 3.64s | **SUCCESS** |
| 2. Products | 5925 | 5925 | 0 | 5925 | 0 | 0 | 12.65s | **SUCCESS** |
| 3. Variants | 120513 | 120513 | 120513 | 0 | 0 | 0 | 120.95s | **SUCCESS** |
| 4. Product Media | 20192 | 20191 | 20191 | 0 | 1 | 0 | 17.76s | **WARNING** |
| 5. Product ↔ Collection Memberships | 215717 | 215717 | 215717 | 0 | 0 | 0 | 159.25s | **SUCCESS** |
| 6. Pages | 233 | 233 | 233 | 0 | 0 | 0 | 1.28s | **SUCCESS** |
| 7. Blogs / Articles | 199 | 199 | 199 | 0 | 0 | 0 | 8.29s | **SUCCESS** |
| 8. Existing Redirects | 472 | 472 | 472 | 0 | 0 | 0 | 0.89s | **SUCCESS** |
| 9. ModularHome URL Mappings & 301s | 6818 | 6818 | 6818 | 0 | 0 | 0 | 11.42s | **SUCCESS** |

## 2. Rejection Summary
- **Total Rejected Records:** 1
  - media: 1 rejected (see `migration/rejected/rejected-media.csv`)

## 3. SEO & Branding Audit
- **Customer-Facing References Normalized:** 1038
- Replaced `amishbuiltcabins.com` domains with `https://modularhome.com`
- Replaced legacy phone numbers (`502-298-8946`) with `+1 (812) 595-4033`
- Normalized Shopify internal links (`/products/*` → `/buildings/*`, `/blogs/news/*` → `/resources/*`)
- Preserved factual descriptive craftsmanship references ("Amish built")
