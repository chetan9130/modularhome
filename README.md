# MODULARHOME — PHASE 2 IMPLEMENTATION PROMPT

## Phase 2: Shopify Migration + Premium Frontend + Floor-Plan E-commerce

You are working on the existing **ModularHome / SteelWeb** project.

Phase 1 — Admin Backend & CMS has already been implemented. Your job now is to implement **Phase 2 only**.

The project currently uses:

* Next.js 16.3.5
* React 19
* TypeScript
* Tailwind CSS v4
* Supabase as the backend
* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage
* Next.js App Router
* Existing Admin CMS
* Existing public frontend
* Existing Quote Wizard
* Existing video/YouTube functionality

---

# 1. CRITICAL INSTRUCTIONS

Before changing anything:

1. Inspect the complete existing codebase.
2. Understand the current folder structure.
3. Inspect the existing Supabase schema, migrations, clients, queries, server actions and API routes.
4. Inspect the existing Admin CMS.
5. Inspect the existing public frontend.
6. Inspect existing authentication and middleware.
7. Inspect existing Quote Wizard.
8. Inspect existing product/model pages.
9. Inspect existing blog pages.
10. Inspect existing floor-plan functionality.
11. Inspect existing YouTube functionality.
12. Inspect existing environment variables.
13. Inspect package.json and existing dependencies.

### DO NOT:

* Rebuild Phase 1 from scratch.
* Replace Supabase with Convex.
* Introduce Prisma.
* Introduce PostgreSQL separately from Supabase.
* Introduce MongoDB.
* Replace the existing authentication architecture unnecessarily.
* Delete working features.
* Create duplicate database systems.
* Create unnecessary API layers.
* Rewrite the entire application just for styling.
* Implement Phase 3 AI automation yet.

Use and extend the existing architecture wherever possible.

---

# 2. PRIMARY OBJECTIVE

Complete Phase 2 in the following areas:

### A. Shopify data migration

### B. SEO migration

### C. Premium frontend integration

### D. Floor-plan e-commerce

### E. Payment integration

### F. Supabase Storage integration

### G. End-to-end validation

The implementation must integrate with the existing Phase 1 Admin CMS.

---

# 3. CURRENT BACKEND ARCHITECTURE

The backend is now Supabase.

Use:

* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Row Level Security
* Supabase server/client SDKs already present in the project

The logical CMS entities include:

* admin users
* global settings
* pages
* page sections
* products/models
* collections
* product-collection relationships
* blogs
* leads
* quotations

For Phase 2, extend the database only where required.

Potential additional entities for e-commerce may include:

* floor_plans
* orders
* order_items
* payments
* download_access

Do not create these blindly.

First inspect the existing schema and reuse existing structures where appropriate.

---

# 4. PHASE 2 — SHOPIFY MIGRATION

## 4.1 Shopify API Integration

Implement a secure Shopify Admin API integration.

Requirements:

* Store Shopify configuration securely.
* Never expose Shopify Admin API credentials to the browser.
* Use server-side code for Shopify requests.
* Create reusable Shopify service functions.
* Handle API errors.
* Handle rate limits.
* Log migration errors safely.
* Make migration repeatable/idempotent where possible.

Suggested conceptual structure:

```text
src/
  lib/
    shopify/
      client.ts
      products.ts
      collections.ts
      pages.ts
      blogs.ts
      media.ts
      seo.ts
      migration.ts
```

Adapt this to the existing project structure rather than forcing this exact structure.

---

# 5. SHOPIFY PRODUCT MIGRATION

Migrate:

* Products
* Product titles
* Descriptions
* Handles
* Product status
* Prices
* Variants where applicable
* Specifications
* Images
* Featured images
* Product metadata
* SEO title
* SEO description
* Product relationships

Map Shopify products into the existing Supabase product/model structure.

Before migration:

1. Inspect the existing `products` table.
2. Determine which fields already exist.
3. Add only missing fields.
4. Create a mapping between Shopify fields and Supabase fields.

Do not duplicate products.

Use Shopify IDs or another stable external ID to make migration idempotent.

Example conceptual field:

```text
shopify_id
```

If an equivalent field already exists, reuse it.

---

# 6. COLLECTION MIGRATION

Migrate:

* Collection title
* Handle
* Description
* Image/banner
* SEO metadata
* Product relationships

Map collections into the existing Supabase collections structure.

Maintain:

```text
Shopify Collection
        ↓
Supabase Collection
        ↓
Products
```

Do not break existing product-collection relationships.

---

# 7. PAGE CONTENT MIGRATION

Migrate required Shopify pages.

Examples:

* About
* Contact
* Services
* FAQ
* Other existing marketing pages

Preserve:

* Title
* Slug
* Content
* Images
* SEO metadata

Map content into the existing:

```text
pages
page_sections
```

CMS structure wherever practical.

Do not create a second page/content system.

---

# 8. BLOG MIGRATION

Migrate:

* Blog/article title
* Content
* Author
* Publish date
* Handle/slug
* Categories
* Tags
* Featured image
* SEO title
* Meta description

Map them into the existing Supabase `blogs` structure.

Preserve original URLs wherever possible.

---

# 9. MEDIA MIGRATION

Inspect how the existing project handles images.

Prefer:

```text
Shopify media
      ↓
Supabase Storage
      ↓
Supabase database reference
      ↓
Next.js frontend
```

Do not store large images as base64 inside database records.

Use appropriate Supabase Storage buckets.

Create separate storage policies for:

* Public website media
* Admin-managed media
* Protected paid floor-plan files

---

# 10. MIGRATION TOOLING

Create a controlled migration process.

The migration should support:

```text
Products
Collections
Pages
Blogs
Media
SEO
```

Provide:

* Migration command or admin action
* Progress logging
* Error reporting
* Duplicate detection
* Retry support
* Migration summary

Example conceptual output:

```text
Shopify Migration
-----------------
Products:     120 imported
Collections:   12 imported
Pages:         18 imported
Blogs:         46 imported
Media:        238 processed
SEO:          184 records updated
Errors:         2
```

Do not perform destructive deletion of existing CMS data unless explicitly required.

---

# 11. SEO MIGRATION

Preserve existing Shopify SEO as much as possible.

Implement:

### SEO metadata

* SEO title
* Meta description
* Canonical URL
* Open Graph title
* Open Graph description
* Open Graph image

### URLs

Preserve existing URLs where possible.

For changed URLs create:

```text
old URL → new URL
```

301 redirects.

Create a redirect data structure if the project does not already have one.

---

# 12. SITEMAP

Ensure the production website has a dynamic sitemap containing:

* Pages
* Products/models
* Collections
* Blogs
* Other indexable public content

Exclude:

* Admin pages
* Private pages
* Draft content
* Customer-specific pages
* Checkout/payment pages

---

# 13. ROBOTS.TXT

Configure robots appropriately.

Allow public website content.

Disallow private/admin areas such as:

```text
/admin
```

and other private application routes where appropriate.

Do not accidentally block:

* Products
* Blogs
* Public pages
* Important SEO content

---

# 14. BROKEN-LINK VALIDATION

After migration:

Check:

* Product URLs
* Collection URLs
* Blog URLs
* Page URLs
* Images
* Internal links
* Redirects
* Sitemap URLs

Generate a report of:

```text
Working
Redirected
Broken
Missing
```

Fix all critical broken links before Phase 2 completion.

---

# 15. PREMIUM FRONTEND

Connect the existing public frontend to Supabase.

The frontend must consume CMS-controlled data instead of hardcoded content wherever Phase 1 CMS already supports that content.

---

# 16. REQUIRED PUBLIC AREAS

Verify and improve:

### Homepage

* Hero
* Featured models
* Collections
* Features
* Trust indicators
* Testimonials
* Gallery
* CTA
* FAQ

### Models

* Model listing
* Filtering
* Search
* Categories
* Square footage
* Bedrooms
* Bathrooms
* Price

### Model Detail

* Gallery
* Specifications
* Pricing
* Features
* Floor plans
* CTA
* Quote action

### Collections

* Collection landing pages
* Related models

### Blog

* Blog listing
* Categories
* Tags
* Blog details
* SEO metadata

### Videos

* Video gallery
* YouTube integration

### Quote

* Existing Quote Wizard
* Backend quotation submission

### Contact

* Contact form
* Lead creation

### Floor Plan

* Upload workflow
* E-commerce floor-plan catalog

---

# 17. DESIGN DIRECTION

The final frontend should look like a premium modular-home / architectural manufacturing platform.

Use:

* Warm orange as primary brand color
* Cream/light-neutral backgrounds
* White surfaces
* Neutral dark typography
* Premium spacing
* Strong visual hierarchy
* Architectural imagery
* Clean cards
* Professional CTA sections
* Subtle animations

IMPORTANT:

### Do NOT use red as the primary brand color.

Review existing styles and replace outdated red-primary branding where necessary.

Do not blindly change every existing color.

Preserve colors that are part of semantic UI states such as:

* error
* warning
* success
* validation

---

# 18. TYPOGRAPHY

Maintain the existing typography system if it is already established.

Use consistent:

* Heading hierarchy
* Body typography
* Button typography
* Card titles
* Navigation typography

Do not introduce unnecessary font libraries.

---

# 19. RESPONSIVE DESIGN

Test:

### Desktop

1920px
1440px
1280px

### Tablet

1024px
768px

### Mobile

430px
390px
375px

Check:

* Navigation
* Cards
* Galleries
* Tables
* Forms
* Quote Wizard
* Product filters
* Checkout
* Floor-plan pages

---

# 20. FLOOR-PLAN E-COMMERCE

This is a mandatory Phase 2 feature.

Build a complete floor-plan store.

Customer flow:

```text
Floor Plan Catalog
        ↓
Floor Plan Detail
        ↓
Add to Cart / Buy
        ↓
Checkout
        ↓
Razorpay
        ↓
Payment Verification
        ↓
Order
        ↓
Secure Download
```

---

# 21. FLOOR-PLAN DATABASE

Inspect the existing Supabase schema first.

If required, create structures similar to:

```text
floor_plans
orders
order_items
payments
download_access
```

Potential floor-plan fields:

```text
id
title
slug
description
price
preview_image
file_path
category
bedrooms
bathrooms
square_feet
status
created_at
updated_at
```

Do not implement fields that are unnecessary for the actual application.

---

# 22. FLOOR-PLAN ADMIN MANAGEMENT

Where appropriate, connect floor plans to the existing Admin CMS.

Admin should be able to:

* Create floor plan
* Edit floor plan
* Upload preview image
* Upload protected PDF/file
* Set price
* Set category
* Publish/unpublish
* View orders

Protected paid files must not be publicly accessible.

---

# 23. SUPABASE STORAGE SECURITY

Use:

### Public storage

For:

* Product images
* Collection banners
* Blog images
* Public website media

### Private storage

For:

* Paid floor-plan PDFs
* Customer-specific downloads
* Protected documents

Use signed URLs or an equivalent authorized download mechanism.

Never expose a private bucket's permanent public URL.

---

# 24. RAZORPAY INTEGRATION

Use Razorpay Test Mode first.

Environment variables:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Never expose:

```text
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

to the browser.

---

# 25. PAYMENT FLOW

Implement:

```text
Customer
   ↓
Create Order
   ↓
Razorpay Checkout
   ↓
Payment
   ↓
Server Verification
   ↓
Webhook
   ↓
Payment Status
   ↓
Order Status
   ↓
Secure Download
```

The server must verify payment before granting access to the paid floor-plan file.

Do not trust only frontend payment-success callbacks.

---

# 26. ORDER MANAGEMENT

Create an order workflow supporting statuses such as:

```text
PENDING
PAYMENT_PENDING
PAID
FAILED
CANCELLED
REFUNDED
COMPLETED
```

Adapt status names to the existing database conventions if they already exist.

Admin should be able to view:

* Customer
* Order ID
* Products
* Amount
* Payment status
* Order status
* Date
* Download status

---

# 27. SECURE DOWNLOAD

After successful verified payment:

```text
Payment Verified
       ↓
Order = PAID
       ↓
Generate authorized download
       ↓
Temporary signed URL
       ↓
Customer downloads file
```

Do not expose the original private storage path publicly.

---

# 28. CART / CHECKOUT

Inspect whether a cart already exists.

If it exists:

* Reuse it.
* Improve it where necessary.

If it does not exist:

Implement a minimal reliable floor-plan purchase flow.

Do not introduce unnecessary state-management libraries if the existing architecture already provides an appropriate solution.

---

# 29. PHASE 2 API/SERVER STRUCTURE

Reuse existing API routes/server actions.

Potential server operations:

```text
Shopify migration
Product migration
Collection migration
Blog migration
Floor-plan creation
Order creation
Payment verification
Razorpay webhook
Secure download
```

Keep sensitive operations server-side.

---

# 30. SUPABASE SECURITY

Review:

* RLS policies
* Admin authorization
* Public read policies
* Protected writes
* Storage policies
* Server-side secrets
* API routes

A user must never be able to:

* Edit products without authorization
* Modify orders
* Mark payments as paid
* Download unpaid floor plans
* Access private admin data

---

# 31. DO NOT IMPLEMENT PHASE 3 YET

Do NOT implement the following unless required for Phase 2 compatibility:

* AI chatbot
* AI lead qualification
* AI-generated blogs
* AI quotation assistance
* YouTube → AI blog automation
* Advanced AI lead generation

These belong to Phase 3.

You may create clean integration points for them, but do not spend Phase 2 time implementing them.

---

# 32. ENVIRONMENT VARIABLES

Inspect the current `.env` structure first.

Add only required variables.

Expected categories:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Shopify
SHOPIFY_STORE_DOMAIN=
SHOPIFY_ACCESS_TOKEN=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=
```

Do not invent unnecessary variables.

---

# 33. PERFORMANCE

Optimize:

* Images
* Server-side queries
* Database queries
* Product listing
* Blog listing
* Shopify migration operations
* Supabase requests
* Large media
* Dynamic pages

Avoid:

* N+1 queries
* Large client-side payloads
* Base64 images
* Unnecessary API calls
* Blocking server requests
* Duplicate data fetching

Use Next.js image optimization where appropriate.

---

# 34. ERROR HANDLING

Every external integration should handle:

* Authentication failure
* Rate limits
* Network errors
* Invalid responses
* Missing data
* Duplicate records
* Payment failures
* Webhook failures
* Storage errors

Show user-friendly messages on the frontend.

Log useful technical information server-side without exposing secrets.

---

# 35. TESTING

Before declaring Phase 2 complete, test:

### Shopify

* Product migration
* Collection migration
* Page migration
* Blog migration
* Media migration
* Duplicate handling
* Error handling

### Frontend

* Homepage
* Models
* Product details
* Collections
* Blog
* Videos
* Quote
* Contact
* Floor plans

### SEO

* Metadata
* Sitemap
* Robots
* Canonical URLs
* Redirects
* Broken links

### E-commerce

* Floor-plan listing
* Product detail
* Cart
* Checkout
* Razorpay Test Mode
* Payment verification
* Webhook
* Order creation
* Secure download

### Security

* RLS
* Admin authorization
* Payment verification
* Private file access
* Secret exposure

### Responsive

Test mobile, tablet and desktop.

---

# 36. SEVEN-DAY PHASE 2 SCHEDULE

## DAY 1

* Inspect complete project
* Inspect Supabase schema
* Inspect Phase 1 implementation
* Configure Shopify API
* Create migration architecture
* Prepare migration mappings

## DAY 2

* Product migration
* Collection migration
* Product relationships
* Duplicate detection

## DAY 3

* Page migration
* Blog migration
* Media migration
* Content validation

## DAY 4

* SEO migration
* Redirect system
* Sitemap
* Robots
* Frontend CMS integration

## DAY 5

* Premium frontend refinement
* Product/model pages
* Collections
* Floor-plan catalog
* Floor-plan detail pages

## DAY 6

* Cart/checkout
* Razorpay Test Mode
* Order creation
* Payment verification
* Webhooks
* Secure downloads

## DAY 7

* Full integration testing
* SEO validation
* Responsive testing
* Security testing
* Performance checks
* Fix critical issues
* Final Phase 2 report

---

# 37. ACCEPTANCE CRITERIA

Phase 2 should be considered complete only when:

* Shopify data can be migrated successfully.
* Products appear correctly in the new CMS/frontend.
* Collections work correctly.
* Pages and blogs are migrated.
* Media is correctly stored/referenced.
* SEO metadata is preserved.
* Redirects work.
* Sitemap works.
* Robots configuration works.
* Public frontend uses the Supabase-backed CMS.
* Premium visual direction is implemented.
* Warm orange/light-neutral branding is applied.
* Floor-plan catalog works.
* Floor-plan detail pages work.
* Razorpay Test Mode works.
* Payment verification works server-side.
* Orders are created correctly.
* Protected floor-plan files cannot be accessed without authorization.
* Responsive layouts work.
* No critical security issues remain.
* No critical broken links remain.

---

# 38. FINAL REPORT

At the end, provide a detailed implementation report containing:

### Completed

List everything implemented.

### Partially Completed

List anything requiring client access, credentials or additional work.

### Not Completed

List anything intentionally deferred to Phase 3.

### Database Changes

List:

* New Supabase tables
* Modified tables
* New columns
* Indexes
* RLS policies
* Storage buckets

### API Integrations

List:

* Shopify
* Razorpay
* Supabase
* Any other integration

### Environment Variables

List every new environment variable required.

### Testing

Provide:

* Tests performed
* Results
* Failed tests
* Fixed issues
* Remaining issues

### Phase 3 Preparation

Explain exactly what integration points are ready for:

* AI chatbot
* AI lead generation
* YouTube-to-blog automation
* AI-assisted quotations
* Notifications

---

# FINAL RULE

Do not assume that a feature is missing simply because it is not obvious.

**Inspect first → understand existing implementation → reuse existing code → extend where necessary → test → document.**

The objective is not to rewrite ModularHome.

The objective is to **complete Phase 2 on top of the existing Phase 1 architecture while preserving all working functionality.**
