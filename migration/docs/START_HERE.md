# START HERE — ModularHome.com Shopify → Next.js + Supabase

## Locked migration rules
- Use the supplied AmishBuiltCabins Matrixify exports as the primary catalog/content source.
- Destination brand/domain is ModularHome.com.
- Do not manually enter products.
- Do not blindly clone AmishBuiltCabins branding, contact details, internal links, or URLs.
- Preserve existing ModularHome.com indexed URLs and SEO wherever an equivalent page/product/collection exists.
- Any unavoidable URL change requires a tested server-side 301 redirect.

## Developer start order
1. Create/use the approved Supabase staging project.
2. Run `02_DATABASE/10_SUPABASE_SCHEMA.sql`.
3. Keep all files in `01_RAW_MATRIXIFY_EXPORTS` unchanged as source/audit files.
4. Build an idempotent ETL importer (upsert by stable source ID/handle; log rejected rows).
5. Import: Collections → Products → Variants → Media → Product/Collection mappings → Pages → Blogs → Redirects.
6. Create the ModularHome old-URL → new-URL map before production launch.
7. Connect Next.js staging to Supabase and QA all dynamic routes and admin CRUD.
8. Do NOT point ModularHome.com to Vercel until `04_AUDIT/PRE_LAUNCH_CHECKLIST.md` passes.

## Go-live
Take a final backup, freeze content briefly, run any delta import, switch the production domain, then crawl old URLs and verify 200/301 behavior, canonicals, sitemap, robots, analytics and Search Console tags.
