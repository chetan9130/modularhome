# ModularHome Migration Report — Dry Run

**Generated:** 2026-09-26T15:55:38.675Z
**Mode:** DRY RUN (0 Database Writes)
**Total Duration:** 19.68s

## 1. Import Stage Breakdown

| Stage | Source Rows | Processed | Created | Updated | Rejected | Errors | Duration | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1. Collections | 12 | 12 | 12 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 2. Products | 759 | 759 | 759 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 3. Variants | 1789 | 1789 | 1789 | 0 | 0 | 0 | 0.01s | **SUCCESS** |
| 4. Product Media | 11791 | 11791 | 11791 | 0 | 0 | 0 | 0.01s | **SUCCESS** |
| 5. Product ↔ Collection Memberships | 208617 | 3577 | 3577 | 0 | 205040 | 0 | 0.09s | **SUCCESS** |
| 6. Pages | 13 | 13 | 13 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 7. Blogs / Articles | 0 | 0 | 0 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 8. Existing Redirects | 0 | 0 | 0 | 0 | 0 | 0 | 0.00s | **SUCCESS** |
| 9. ModularHome URL Mappings & 301s | 784 | 784 | 784 | 0 | 0 | 0 | 0.00s | **SUCCESS** |

## 2. Rejection Summary
- **Total Rejected Records:** 0

## 3. SEO & Branding Audit
- **Customer-Facing References Normalized:** 330
- Replaced `amishbuiltcabins.com` domains with `https://modularhome.com`
- Replaced legacy phone numbers (`502-298-8946`) with `+1 (812) 595-4033`
- Normalized Shopify internal links (`/products/*` → `/buildings/*`, `/blogs/news/*` → `/resources/*`)
- Preserved factual descriptive craftsmanship references ("Amish built")
