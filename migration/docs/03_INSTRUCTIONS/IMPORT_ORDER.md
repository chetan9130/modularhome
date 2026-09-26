# Import order
1. Collections
2. Products
3. Variants/options
4. Product images/media
5. Product ↔ collection relationships
6. Pages
7. Blogs/articles
8. Existing redirects
9. ModularHome old → new URL mappings

Use stable source IDs/handles for idempotent upserts. Import on staging first. Log rejected rows; never silently drop records.
