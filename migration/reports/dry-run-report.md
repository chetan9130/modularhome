# ModularHome Migration Report — Dry Run

**Generated:** 2026-09-26T05:41:05.163Z
**Mode:** DRY RUN (0 Database Writes)
**Total Duration:** 175.53s

## 1. Import Stage Breakdown

| Stage | Source Rows | Processed | Created | Updated | Rejected | Errors | Duration | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1. Collections | 461 | 461 | 461 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 2. Products | 5925 | 5925 | 5925 | 0 | 0 | 0 | 0.01s | **SUCCESS** |
| 3. Variants | 120513 | 120513 | 120513 | 0 | 0 | 0 | 0.04s | **SUCCESS** |
| 4. Product Media | 20192 | 20191 | 20191 | 0 | 1 | 0 | 0.02s | **WARNING** |
| 5. Product ↔ Collection Memberships | 215717 | 215717 | 215717 | 0 | 0 | 0 | 0.16s | **SUCCESS** |
| 6. Pages | 233 | 233 | 233 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 7. Blogs / Articles | 199 | 199 | 199 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 8. Existing Redirects | 472 | 472 | 472 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 9. ModularHome URL Mappings & 301s | 6818 | 6818 | 6818 | 0 | 0 | 0 | 0.02s | **SUCCESS** |

## 2. Rejection Summary
- **Total Rejected Records:** 1
  - media: 1 rejected (see `migration/rejected/rejected-media.csv`)

## 3. SEO & Branding Audit
- **Customer-Facing References Normalized:** 1038
- Replaced `amishbuiltcabins.com` domains with `https://modularhome.com`
- Replaced legacy phone numbers (`502-298-8946`) with `+1 (812) 595-4033`
- Normalized Shopify internal links (`/products/*` → `/buildings/*`, `/blogs/news/*` → `/resources/*`)
- Preserved factual descriptive craftsmanship references ("Amish built")
