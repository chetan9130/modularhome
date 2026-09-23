# MODULARHOME / STEELWEB

## ADMIN COMPLETION + SECURITY HARDENING IMPLEMENTATION PROMPT

You are working on the existing **ModularHome / SteelWeb** project.

The current project already has a functioning admin dashboard, Supabase backend, Stripe integration, Shopify migration tooling, floor-plan e-commerce, CMS structure, and public frontend.

The client has reviewed the admin and wants the existing structure completed before considering the Admin Backend finished.

### PRIMARY OBJECTIVE

Complete the existing admin system so that the client has **full operational control of the website without needing developer/code changes for normal website management**.

Do NOT redesign the admin dashboard from scratch.

The current admin design and structure are acceptable. Focus on:

* Completing missing functionality
* Connecting admin controls to the live frontend
* Correct CRUD operations
* Proper relationships between entities
* Role-based permissions
* Security
* Auditability
* Version/recovery capability
* End-to-end testing

Do not implement Phase 3 AI functionality unless it is required for an existing admin integration.

---

# 1. EXISTING TECHNOLOGY — DO NOT CHANGE UNNECESSARILY

Use the existing architecture:

* Next.js 16 App Router
* React 19
* TypeScript
* Tailwind CSS v4
* Supabase PostgreSQL
* Supabase RLS
* Supabase Storage
* Stripe
* Existing Shopify migration system
* Existing YouTube synchronization
* Existing admin authentication/session architecture

Do NOT introduce:

* Convex
* Prisma
* MongoDB
* A second database
* A second payment gateway
* Unnecessary authentication providers
* A complete admin UI rewrite

Preserve working functionality.

Before making changes, inspect the existing implementation and understand:

* database schema
* RLS policies
* admin authentication
* middleware
* API routes
* admin components
* public data fetching
* frontend CMS rendering
* Stripe integration
* storage implementation
* Shopify migration
* YouTube sync

---

# 2. HOME MODELS — COMPLETE MANAGEMENT

Admin must provide complete control over every Home Model.

For every model support:

* Name
* Slug
* Price
* Category
* Collections
* Square footage
* Bedrooms
* Bathrooms
* Specifications
* Description
* Main image
* Image gallery
* Floor plans
* Status
* Featured
* Trending
* SEO title
* SEO description
* Canonical URL
* OG image
* Other relevant SEO metadata

Support:

* Create
* Read
* Edit
* Delete
* Publish/unpublish
* Draft/active status where applicable

### Price issue

Some models currently display only `$` without an actual price.

Investigate the complete data flow:

Database → API → publicData → model page/card → formatting component.

Fix the root cause.

Do not simply hardcode a price on the frontend.

Ensure:

* Missing prices are handled correctly
* Valid prices display correctly
* Currency formatting is consistent
* Admin price changes immediately reflect on the frontend

---

# 3. COLLECTION MANAGEMENT

Complete Collections functionality.

Admin must be able to:

* Create collections
* Edit collections
* Delete collections
* Change collection name
* Change slug
* Change description/content
* Upload/change collection image
* Manage SEO
* Assign models
* Remove models
* Reorder models if supported by the existing architecture

### IMPORTANT

Collections currently show **0 models**.

Investigate and fix the model-to-collection relationship.

Verify:

products
↓
product_collections
↓
collections
↓
public frontend

Make sure assigned models actually appear on:

* Collection admin
* Collection pages
* Related model listings
* Any collection filters

Test both:

* Assign model → model appears
* Remove model → model disappears

Do not merely fix the UI count.

Fix the underlying database/API relationship.

---

# 4. FLOOR PLAN MANAGEMENT

The Floor Plan Manager must provide complete control.

Admin must manage:

* Plan name
* Slug
* Price
* Category
* Description
* Square footage
* Bedrooms
* Bathrooms
* Specifications
* Main image
* Image gallery
* Preview images
* PDF
* CAD/DWG files
* ZIP files where applicable
* Status
* Featured
* SEO metadata

Support:

* Create
* Edit
* Delete
* Publish/unpublish

### Secure files

Paid PDF/CAD/ZIP files MUST NOT be publicly accessible.

Use:

* Private Supabase Storage
* Authorization checks
* Signed/time-limited URLs
* Purchase verification
* Download access records

Never expose permanent public URLs for paid files.

---

# 5. ORDER MANAGEMENT

Complete the existing Orders admin.

When opening an order, display complete information.

### Customer

Show:

* Name
* Email
* Phone if collected
* Billing details where applicable
* Shipping/customer information where applicable

### Payment

Show:

* Order number
* Stripe payment/order identifiers
* Payment status
* Payment amount
* Currency
* Payment date
* Relevant Stripe status
* Refund status if supported

### Purchased product

Show:

* Floor plan
* Quantity
* Price
* Purchased files/product
* Download access status

### Download

Show:

* Download token/access
* Expiration
* Download count
* Download status

Do not expose Stripe secret information.

Never store card numbers, CVV, or other card details.

Stripe remains responsible for payment information.

---

# 6. LEADS — COMPLETE CRM MANAGEMENT

The Leads section must become a real lead-management interface instead of only a table.

When opening a lead, show:

### Customer information

* Name
* Email
* Phone
* Location
* Source
* Submission date

### Lead information

* Original inquiry
* Quote information
* Selected model
* Requirements
* Budget
* Square footage
* Other submitted fields

### Lead management

Admin should be able to:

* Add notes
* Edit notes
* Change lead status
* Assign lead
* Set follow-up date
* Set follow-up reminder/status
* Track lead history
* Add internal comments
* View previous interactions
* Manage quotation

Suggested statuses:

* New
* Contacted
* Qualified
* Quote Sent
* Follow-up
* Won
* Lost

Do not hardcode these in a way that prevents future extension.

---

# 7. QUOTE SUBMISSIONS

Quote submissions need complete management.

Admin should see:

* Customer details
* Building/model selection
* Foundation
* Insulation
* Roof style
* ZIP/location
* Square footage
* Budget
* Requirements
* Submitted date
* Current status

Allow:

* Notes
* Status changes
* Follow-up
* Quote editing
* Final quotation amount
* Internal comments
* Quote history

The client should be able to manage a quotation from the admin without developer involvement.

---

# 8. PAGE MANAGER + SECTION BLOCKS

This is one of the highest-priority requirements.

The client must have complete control of all pages.

Admin should support:

* Create page
* Edit page
* Delete page
* Publish/unpublish
* Draft state
* Page title
* Slug
* SEO
* Sections
* Section visibility

For every section/block allow:

* Add
* Edit
* Delete
* Duplicate if practical
* Hide/show
* Reorder
* Change text
* Change images
* Change videos
* Change buttons
* Change links
* Change CTA
* Configure section-specific content

### Drag and drop

Implement drag-and-drop section ordering if compatible with the existing architecture.

The ordering must be persisted in the database.

Example:

section_order:

1. Hero
2. Home Types
3. Available Homes
4. Budget
5. Locations
6. Trending Homes
7. Customization
8. Floor Plans
9. Quote CTA
10. How It Works
11. Financing
12. Videos
13. Reviews
14. Blogs

The exact order must be configurable from admin.

---

# 9. HOMEPAGE — NO HARDCODED CONTENT

Every important homepage section must be manageable through admin.

Verify and connect:

* Hero
* Home Types
* Available Homes
* Budget section
* Locations
* Trending Homes
* Customization
* Floor Plans
* Quote section
* How It Works
* Financing
* Videos
* Reviews
* Blogs
* Testimonials
* FAQs
* Trust sections
* Other existing homepage sections

IMPORTANT:

Do not create admin controls that only exist visually.

Every admin change must actually affect the public website.

Test:

Admin edit
→ database
→ API/data layer
→ frontend
→ live rendered result

---

# 10. HEADER + MENU MANAGEMENT

Create/complete Header and Navigation management.

Admin must control:

* Main menu
* Menu labels
* Links
* Dropdown menus
* Dropdown items
* Ordering
* Visibility
* External/internal URLs

Support nested navigation where appropriate.

Changes must reflect on the live website without code changes.

---

# 11. FOOTER MANAGEMENT

Admin must control:

* Footer columns
* Footer links
* Link labels
* URLs
* Ordering
* Social links
* Contact information
* Copyright text
* CTA
* Other footer content

Ensure changes appear on the public website.

---

# 12. GLOBAL SETTINGS

Verify that all Global Settings are actually connected.

Admin controls:

* Logo
* Favicon
* Phone
* Email
* Address
* Announcement bar
* Social links
* Footer information
* Global CTA
* Global SEO

The current phone number should remain:

812-595-4033

Verify that the value comes from the appropriate settings source rather than being independently hardcoded in multiple frontend components.

Test every setting against the live website.

---

# 13. MEDIA LIBRARY

Add a centralized Media Library.

The purpose is to prevent repeatedly uploading the same assets.

Support:

* Images
* Documents
* Videos where appropriate
* Search
* Filtering
* Preview
* File metadata
* Upload
* Delete
* Reuse existing media
* Copy/select existing media when editing CMS content

For each asset consider storing:

* Filename
* Storage path
* MIME type
* File size
* Width/height for images
* Upload date
* Uploaded by
* Alt text
* Usage/reference information where practical

Use Supabase Storage.

Do not expose private files publicly unless intentionally configured as public assets.

---

# 14. ARTICLES / BLOG CMS

Complete blog management.

Admin must control:

* Title
* Slug
* Content
* Featured image
* Gallery/media
* Category
* Author
* Video
* Tags where applicable
* Excerpt
* SEO title
* SEO description
* Canonical URL
* OG image
* Draft/published status
* Publish date

Support:

* Create
* Edit
* Delete
* Draft
* Publish
* Unpublish

Ensure published content appears correctly on the public resources/blog pages.

---

# 15. YOUTUBE AUTO-SYNC MANAGEMENT

The existing YouTube synchronization must have an admin status interface.

Display:

* Connection status
* Connected channel
* Last successful sync
* Last attempted sync
* Number of videos imported
* Generated blogs
* Failed syncs
* Error messages
* Sync history

Allow:

* Manual sync
* View sync result
* Review failed items
* Retry failed sync

Do not hide synchronization failures.

---

# 16. SEO MANAGEMENT

SEO must be manageable for each major content entity.

Support individual SEO fields for:

### Pages

* Meta title
* Meta description
* Canonical
* OG title
* OG description
* OG image
* Robots/indexing settings

### Models

Same SEO controls.

### Collections

Same SEO controls.

### Blogs

Same SEO controls.

### Floor Plans

Same SEO controls.

Verify:

* sitemap.xml
* robots.txt
* canonical URLs
* metadata rendering
* OG tags
* noindex handling

---

# 17. SHOPIFY SEO + 301 REDIRECT MANAGEMENT

Preserve old Shopify URLs.

Admin should have redirect management where practical.

Support:

* Old URL
* New URL
* Redirect type
* Active/inactive
* Source entity
* Creation/update date

Shopify migration must preserve:

* Product URLs
* Collection URLs
* Blog URLs
* Page URLs

All relevant old URLs should redirect using **301 redirects**.

Verify that the existing middleware redirect system and database redirects do not conflict.

Test old Shopify URL → new URL.

---

# 18. REVIEWS / TESTIMONIALS

Add CMS management for reviews/testimonials.

Admin should be able to:

* Create
* Edit
* Delete
* Publish/unpublish
* Change customer name
* Change review text
* Rating
* Image where applicable
* Location
* Date
* Featured status
* Ordering

No important testimonials should remain hardcoded in the frontend.

---

# 19. FAQ MANAGEMENT

Add complete FAQ management.

Admin should be able to:

* Create FAQ
* Edit FAQ
* Delete FAQ
* Question
* Answer
* Category
* Page association
* Publish/unpublish
* Ordering

FAQs should be dynamically loaded on the frontend.

---

# 20. ADMIN ROLES

Implement proper role-based access control.

Minimum roles:

### Super Admin

Full access:

* All CMS
* Products
* Collections
* Floor plans
* Orders
* Payments
* Leads
* Quotes
* Settings
* Users
* Security
* Activity logs
* Migration
* Media

### Content/Admin

Access:

* Pages
* Sections
* Products/models
* Collections
* Blogs
* Media
* Reviews
* FAQs
* SEO

Should NOT automatically have access to:

* Payment secrets
* Security settings
* Admin user management
* Sensitive financial controls

### Sales

Access:

* Leads
* Quotes
* Customer details required for sales
* Follow-ups
* Relevant models/floor plans

Should NOT have unrestricted access to:

* Global settings
* Security
* Admin users
* Payment configuration
* CMS structure

Permissions must be enforced on the backend/database.

Do NOT rely only on hiding menu items.

---

# 21. TWO-FACTOR AUTHENTICATION

Implement admin 2FA.

Prefer a secure TOTP-based approach compatible with authenticator applications.

Requirements:

* 2FA enrollment
* QR/setup process
* Verification
* Recovery codes
* Login challenge
* Disable/reset process requiring appropriate authorization
* Re-authentication for sensitive security changes

Do not store raw recovery codes.

Hash sensitive recovery credentials where appropriate.

---

# 22. ADMIN SESSION SECURITY

Implement:

* Automatic inactivity expiration
* Secure HTTP-only cookies
* Secure cookie configuration in production
* Session invalidation
* Logout
* Logout all devices/sessions
* Session/device visibility where practical

An admin should be able to invalidate all active sessions when necessary.

---

# 23. LOGIN RATE LIMITING + LOCKOUT

Protect admin authentication against brute force.

Implement:

* Login attempt rate limiting
* Temporary lockout after repeated failures
* Increasing delay/backoff where appropriate
* Logging of failed attempts
* IP/user-based controls where practical

Do not permanently lock accounts without a recovery mechanism.

---

# 24. SENSITIVE ACTION CONFIRMATION

Require confirmation for destructive or high-impact operations.

Examples:

* Delete model
* Delete page
* Delete collection
* Delete floor plan
* Delete order-related records
* Delete blog
* Delete media
* Change pricing
* Change global settings
* Create admin
* Delete admin
* Change role
* Change 2FA/security settings

For highly sensitive security/account actions require:

* Current password confirmation
* 2FA confirmation where applicable

---

# 25. ADMIN ACTIVITY LOG

Create an Admin Activity Log.

Record:

* Admin user
* Role
* Action
* Entity/type
* Entity ID
* Description
* Timestamp
* IP address where appropriate
* User agent where appropriate
* Before/after data for important changes where appropriate

Examples:

* Login
* Failed login
* Logout
* Model created
* Model edited
* Price changed
* Page deleted
* Settings changed
* Admin user created
* Role changed
* Order viewed
* Refund/payment action where supported
* Security setting changed

Activity logs should be protected from normal modification/deletion.

---

# 26. CONTENT VERSION HISTORY

For important CMS content, maintain previous versions where practical.

At minimum consider:

* Pages
* Sections
* Blogs
* Models
* Collections
* Global settings

Store:

* Previous data
* Changed by
* Changed at

Provide a restore capability for appropriate content.

The goal is to recover from accidental changes.

---

# 27. SUPABASE RLS + BACKEND AUTHORIZATION

This is CRITICAL.

Do not depend on:

* Frontend route protection
* Hidden buttons
* Admin-only navigation

Every sensitive operation must be protected.

Implement and verify:

* Supabase RLS
* Server-side authorization
* Role checks
* API authorization
* Ownership/access checks
* Admin session verification

Verify that unauthorized users cannot access:

* Leads
* Quotes
* Orders
* Payments
* Customer information
* Private files
* Admin settings

Test APIs directly, not only through the UI.

---

# 28. SECRETS MANAGEMENT

Never expose:

* Supabase service-role key
* Stripe secret key
* Stripe webhook secret
* OpenAI API key
* Shopify Admin credentials
* YouTube credentials
* Email provider credentials

These must only exist in secure server-side environment variables.

Review the complete codebase for accidental exposure.

Check:

* Client components
* `NEXT_PUBLIC_*`
* API responses
* browser network requests
* logs
* Git history where appropriate

Only genuinely public values should use `NEXT_PUBLIC_*`.

---

# 29. CUSTOMER DATA PROTECTION

Customer information must only be available to authorized admin roles.

Protect:

* Email
* Phone
* Address
* Quote information
* Lead information
* Order information
* Payment information

Do not expose customer data through public APIs.

Check all:

* `/api/*`
* Server actions
* Public data functions
* Supabase policies
* Search endpoints
* Frontend requests

---

# 30. PRIVATE FLOOR-PLAN FILE SECURITY

Paid files must use private storage.

Required flow:

Customer completes Stripe payment
→ verified Stripe webhook
→ order/payment validated
→ download access generated
→ signed/time-limited URL
→ authorized download

Do NOT trust:

* Frontend payment status
* Query parameters
* Client-side order status
* Client-provided payment IDs without verification

A user must not be able to access a paid CAD/PDF/ZIP file without a valid purchase.

---

# 31. FILE UPLOAD SECURITY

Validate all uploads server-side.

Restrict:

* MIME type
* File extension
* File size
* Storage destination

Pay particular attention to:

* PDF
* DWG
* ZIP
* Images
* Documents

Do not allow executable files through customer/admin upload endpoints unless there is an explicitly required and secured use case.

Validate files before storing them.

---

# 32. PUBLIC FORM SECURITY

Protect:

* Contact forms
* Quote forms
* Lead forms
* Floor-plan related forms
* Upload forms

Implement:

* Rate limiting
* Server-side validation
* CAPTCHA/Cloudflare Turnstile where appropriate
* Spam protection
* Input sanitization

Do not rely only on client-side validation.

---

# 33. XSS / SQL INJECTION / UNSAFE HTML

Review every dynamic input.

Protect against:

* XSS
* SQL injection
* unsafe HTML
* malicious URLs
* malicious uploaded files

Use parameterized Supabase/database queries.

If rich HTML content is supported, sanitize it before rendering.

Avoid unsafe HTML rendering unless content has been properly sanitized.

---

# 34. CSRF + SECURITY HEADERS

Review application security headers.

Configure appropriate:

* Content Security Policy where practical
* X-Frame-Options/frame-ancestors
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* Strict-Transport-Security in production

Protect state-changing operations against CSRF where applicable.

Review cookies:

* HttpOnly
* Secure
* SameSite

---

# 35. STRIPE SECURITY

Stripe must remain the payment authority.

Never store card information.

Never trust frontend payment status.

Payment/order confirmation must come from verified Stripe webhooks.

Verify:

* Webhook signature
* Event type
* Payment/order identity
* Amount where appropriate
* Currency where appropriate
* Idempotency

Ensure duplicate webhook events cannot create duplicate orders/download access.

---

# 36. DATABASE BACKUPS

Configure a reliable Supabase backup strategy.

Review:

* Automated backups
* Point-in-time recovery availability for the client's Supabase plan
* Recovery procedure
* Backup retention
* Migration backup procedure

Before major schema/data migrations:

1. Backup
2. Apply migration
3. Verify
4. Test
5. Keep recovery path available

Document the recovery process.

---

# 37. END-TO-END ADMIN VERIFICATION

Do not stop when the admin UI looks correct.

For every major admin feature test:

```text
Admin UI
   ↓
API / Server Action
   ↓
Authorization
   ↓
Supabase
   ↓
Database
   ↓
Public API/Data Layer
   ↓
Frontend
```

Verify that actual frontend content changes after admin changes.

Test at minimum:

### Models

Create/edit/delete/price/gallery/SEO/collections.

### Collections

Create/edit/assign models/remove models/SEO.

### Floor Plans

Create/edit/pricing/files/orders/download authorization.

### Leads

Open/details/notes/status/follow-up/history.

### Quotes

Details/status/quotation/follow-up.

### Pages

Sections/add/edit/delete/hide/show/reorder.

### Homepage

Every existing section editable from admin.

### Header/Footer

Menu/dropdowns/footer links.

### Global Settings

Every setting connected to frontend.

### Media

Upload/reuse/delete/authorization.

### Blogs

Create/edit/publish/SEO/media/video.

### YouTube

Sync/status/history/errors/retry.

### SEO

Metadata/sitemap/robots/canonical/redirects.

### Reviews

CRUD + frontend.

### FAQs

CRUD + frontend.

---

# 38. SECURITY TEST MATRIX

Before completion, test:

### Authentication

* Correct credentials
* Incorrect credentials
* Repeated failed login
* 2FA
* Session expiration
* Logout
* Logout all sessions

### Authorization

Test every role against every sensitive module.

### API

Attempt unauthorized requests directly.

### Database

Verify RLS prevents unauthorized data access.

### Storage

Attempt direct access to private files.

### Payments

Attempt fake frontend payment success.

### Webhooks

Test invalid webhook signatures.

### Forms

Test spam/rate limits.

### Uploads

Test invalid file types and oversized files.

### XSS

Test malicious text in CMS fields/forms.

### SQL injection

Verify query handling.

### Secrets

Verify no secret is exposed to browser.

---

# 39. DO NOT MARK FEATURES COMPLETE BASED ONLY ON UI

A feature is complete only when:

1. Admin control exists
2. Database stores the change
3. API/server authorization works
4. RLS/permissions work
5. Public website reflects the change
6. Validation works
7. Security is verified
8. Error handling works

Do not create placeholder controls.

Do not leave hardcoded frontend data when an admin-controlled equivalent exists.

---

# 40. DEVELOPMENT APPROACH

Work in this order:

### Step 1

Inspect the entire existing implementation.

### Step 2

Map every client requirement to:

* Existing feature
* Partially implemented feature
* Missing feature
* Broken feature

### Step 3

Fix database relationships/schema where necessary.

### Step 4

Fix APIs and server-side authorization.

### Step 5

Complete admin functionality.

### Step 6

Connect admin data to frontend.

### Step 7

Implement security/RLS/roles/2FA.

### Step 8

Implement activity logs/version history.

### Step 9

Test storage/payment/security.

### Step 10

Perform complete end-to-end regression testing.

---

# 41. IMPORTANT PRESERVATION RULE

Do not break existing working functionality.

Before changing:

* Stripe
* Shopify migration
* Supabase
* public pages
* middleware
* SEO
* floor-plan downloads

inspect the current implementation first.

Reuse existing utilities and services where possible.

Avoid unnecessary rewrites.

---

# 42. FINAL ACCEPTANCE CRITERIA

The Admin Backend should be considered complete only when the client can independently:

* Manage all Home Models
* Manage Collections
* Assign models to collections
* Manage Floor Plans
* Manage floor-plan files
* View complete Orders
* Manage Leads
* Manage Quote Submissions
* Manage Homepage sections
* Manage all pages
* Reorder sections
* Manage Header/Menu
* Manage Footer
* Manage Global Settings
* Manage Media
* Manage Articles
* Monitor YouTube sync
* Manage SEO
* Manage Shopify redirects
* Manage Reviews
* Manage FAQs
* Manage admin users/roles
* Use 2FA
* Review activity logs
* Restore important content versions

without requiring developer code changes for normal website operations.

Security acceptance additionally requires:

* 2FA
* Role-based authorization
* Session expiration
* Logout-all-sessions
* Login rate limiting
* Sensitive-action confirmation
* Activity logging
* Supabase RLS
* Server-side authorization
* Private file storage
* Secure signed downloads
* Secure Stripe webhooks
* Upload validation
* Public-form rate limiting
* XSS/input protection
* Security headers
* Secret protection
* Database backup/recovery strategy

---

# 43. FINAL REPORT

After implementation, provide a detailed report containing:

### Completed

List every completed feature.

### Partially Completed

List anything dependent on external credentials, client decisions, or third-party configuration.

### Not Completed

Clearly identify anything remaining.

### Database Changes

List:

* New tables
* Modified tables
* Columns
* Relationships
* RLS policies
* Indexes

### API Changes

List every new/modified endpoint.

### Security Changes

List:

* 2FA
* RBAC
* RLS
* Sessions
* Rate limiting
* Activity logs
* Storage security
* Webhook security
* Upload validation

### Environment Variables

List all required environment variables without exposing secret values.

### Testing

Report:

* TypeScript check
* Build
* API tests
* Admin tests
* Role tests
* RLS tests
* Storage tests
* Stripe webhook tests
* Security tests
* Frontend end-to-end tests

### Remaining Client Requirements

Clearly identify anything that requires client credentials or external configuration.

Do not claim something is complete merely because the UI exists.

The final goal is:

**"The client can operate and manage the entire website from the admin without contacting the developer for normal content, product, CMS, SEO, lead, quote, order, or website changes."**
