# MODULARHOME / STEELWEB

# REMAINING CUSTOMER ECOMMERCE + REPORTING + CUSTOMER ACCOUNT IMPLEMENTATION PROMPT

## PROJECT CONTEXT

You are working on the existing **ModularHome / SteelWeb** project.

The project already contains a substantial Admin CMS, public storefront, Supabase backend, Stripe payment integration, secure floor-plan downloads, Shopify migration, SEO/redirects, YouTube synchronization, CRM, security controls, RBAC, 2FA, activity logging, content versioning, and CMS functionality.

The purpose of this task is **NOT to rebuild the existing Admin CMS**.

The goal is to complete the remaining requirements from the **Final Master Developer Specification**, specifically:

1. Customer Ecommerce
2. Customer Accounts
3. Customer Account Administration
4. Ecommerce Reporting & Analytics
5. Data Export
6. Remaining Payment/Order operational features
7. Mobile Ecommerce QA
8. Complete End-to-End Ecommerce QA
9. Final documentation and handover

---

# 1. CRITICAL RULE — INSPECT BEFORE IMPLEMENTING

Before writing code:

1. Inspect the complete existing SteelWeb codebase.
2. Inspect the current Supabase schema.
3. Inspect existing Stripe integration.
4. Inspect existing authentication.
5. Inspect existing Admin roles and permissions.
6. Inspect existing order/payment/download implementation.
7. Inspect existing customer/lead/quotation structures.
8. Inspect existing email functionality.
9. Inspect existing analytics.
10. Inspect existing reporting/dashboard functionality.

DO NOT assume a feature is missing merely because it was not listed in the previous architecture summary.

For every requirement below, classify it as:

* ALREADY COMPLETE
* PARTIALLY COMPLETE
* MISSING
* BROKEN
* NEEDS QA ONLY

Then implement only what is actually required.

Do not duplicate existing functionality.

---

# 2. EXISTING TECHNOLOGY — PRESERVE

Continue using the existing architecture:

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS v4
* Supabase PostgreSQL
* Supabase RLS
* Supabase Storage
* Stripe
* Existing CMS
* Existing Admin Dashboard
* Existing middleware
* Existing APIs
* Existing publicData layer

Do NOT introduce:

* Convex
* Prisma
* MongoDB
* Razorpay
* Another database
* Another CMS
* Another payment gateway

Stripe remains the payment provider.

Supabase remains the primary database/storage platform.

---

# 3. CUSTOMER ACCOUNT SYSTEM

Implement a complete customer account lifecycle if not already present.

Required flow:

```text
Visitor
  ↓
Signup / Login
  ↓
Email Verification
  ↓
Customer Account
  ↓
Browse Floor Plans
  ↓
Cart
  ↓
Checkout
  ↓
Stripe
  ↓
Verified Payment
  ↓
Order
  ↓
Invoice / Receipt
  ↓
Customer Dashboard
  ↓
Secure Download
```

---

# 4. CUSTOMER SIGNUP

Implement customer registration.

Support where applicable:

* Name
* Email
* Password
* Phone
* Required profile information
* Terms/policy acceptance where required

Requirements:

* Server-side validation
* Password handled securely through the authentication system
* No plaintext password storage
* Duplicate email handling
* Rate limiting
* Abuse protection

After signup:

```text
Account Created
      ↓
Verification Required
      ↓
Verification Email
      ↓
Verified Customer
```

---

# 5. EMAIL VERIFICATION

Implement complete email verification.

Requirements:

* Verification email
* Secure verification token/process
* Verification status
* Verification timestamp where available
* Resend verification
* Resend rate limiting
* Expired/invalid verification handling

Admin should be able to see whether a customer is verified.

Never allow admin users to manually manipulate authentication records as a substitute for the proper verification flow.

---

# 6. CUSTOMER LOGIN

Implement customer login.

Requirements:

* Email/password login
* Secure session
* HttpOnly cookies where applicable
* Secure session handling
* Rate limiting
* Failed login handling
* Logout
* Session expiration

Do not expose authentication secrets to the browser.

---

# 7. GOOGLE / SOCIAL LOGIN

Inspect the current authentication architecture.

If Google authentication is already configured or enabled, complete its integration.

If it is not configured:

* Prepare the architecture cleanly
* Do not introduce unnecessary providers
* Document the required external configuration

Customer identity provider information must never expose OAuth secrets/tokens.

---

# 8. FORGOT PASSWORD / RESET PASSWORD

Implement the normal secure password reset workflow.

Required:

```text
Forgot Password
      ↓
Reset Email
      ↓
Secure Reset Link
      ↓
Customer Sets New Password
      ↓
Account Updated
```

Admins must NEVER:

* See passwords
* Retrieve passwords
* Set a customer's password directly
* Store plaintext passwords

Admin assistance should only trigger the secure reset workflow.

---

# 9. CUSTOMER PROFILE

Create a customer profile/account area.

Customer should be able to manage permitted information such as:

* Name
* Email through secure email-change flow
* Phone
* Billing/contact information
* Account information

Authentication email changes must use a secure verified workflow.

Do not simply update authentication email through direct database SQL.

---

# 10. CUSTOMER DASHBOARD

Create/complete:

`/account`

or the existing customer account route.

Dashboard should show:

* Customer information
* Account status
* Verification status where useful
* Recent orders
* Purchased floor plans
* Download access
* Download history
* Invoices/receipts
* Relevant account events
* Support/help option

Example:

```text
MY ACCOUNT

Welcome, Customer

Orders
--------------------------------
#MH-10021    Paid
#MH-10019    Paid

Purchased Plans
--------------------------------
Modern Cabin 2400
Download

Invoices
--------------------------------
INV-10021
Download Invoice
```

---

# 11. CUSTOMER ORDER HISTORY

Customers must be able to see their own orders.

Show:

* Order number
* Order date
* Purchased products
* Quantity
* Price
* Discount if applicable
* Tax where applicable
* Total
* Payment status
* Order status
* Download status

Customers must only be able to access their own orders.

Test direct API access using another customer's order ID.

It must fail.

---

# 12. CUSTOMER ORDER DETAILS

Create a customer-facing order detail page.

Example:

`/account/orders/[orderId]`

Display:

* Order information
* Product/floor plan
* Price
* Payment status
* Payment date
* Invoice
* Download access
* Download expiry
* Support option

Do not expose:

* Stripe secret keys
* Internal webhook data
* Other customer's data
* Card information

---

# 13. SHOPPING CART

Inspect the existing floor-plan ecommerce implementation.

If a proper persistent cart does not exist, implement it.

Support:

* Add to cart
* Remove
* Update quantity where applicable
* Empty cart
* Cart persistence
* Price display
* Subtotal
* Discount where supported
* Checkout

Do not treat cart data as proof of purchase.

Only Stripe/server-side verified payment creates a paid entitlement.

---

# 14. SERVER-SIDE PRICE VALIDATION

This is CRITICAL.

Never trust prices received from the browser.

When creating Stripe checkout:

```text
Browser
   ↓
Product ID
   ↓
Server
   ↓
Load current authoritative price from Supabase
   ↓
Validate product availability
   ↓
Create Stripe Checkout
```

The browser must never be able to change:

```text
$595 → $1
```

or manipulate discounts.

Test by modifying browser requests.

---

# 15. STRIPE CHECKOUT

Preserve the existing Stripe integration.

Verify:

* Checkout creation
* Product validation
* Correct amount
* Correct currency
* Customer information
* Metadata/order reference
* Success URL
* Cancel URL
* Webhook processing

Do not replace the existing Stripe implementation unnecessarily.

---

# 16. PAYMENT / WEBHOOK LOG

Create or complete a payment/webhook diagnostic system.

Store safe information such as:

* Stripe event ID
* Event type
* Processing status
* Related order
* Received timestamp
* Processed timestamp
* Error state
* Retry state

Never store sensitive payment credentials.

Admin should be able to diagnose:

```text
Order Pending
↓
Webhook Received?
↓
Webhook Processed?
↓
Payment Confirmed?
↓
Entitlement Created?
```

---

# 17. IDEMPOTENCY / DUPLICATE PROTECTION

This is CRITICAL.

Repeated Stripe webhook events must NOT create:

* Duplicate orders
* Duplicate payments
* Duplicate download entitlements
* Duplicate emails

Use:

* Unique Stripe event IDs
* Unique checkout/payment references
* Database constraints
* Idempotent processing

Test the same webhook twice.

Expected:

```text
1 webhook event
1 paid order
1 entitlement
```

---

# 18. REFUND WORKFLOW

If business policy allows refunds, implement controlled refund handling.

Admin requirements:

* Authorized refund action
* Confirmation
* Optional reason
* Stripe server-side refund
* Refund status
* Refund history
* Audit log

After refund:

* Update order state
* Update entitlement according to business policy
* Record refund information

Never trust frontend refund status.

---

# 19. TAX & BILLING CONFIGURATION

Implement only according to the client's actual Stripe/business configuration.

Support:

* Currency
* Business information
* Billing information
* Tax configuration
* Stripe Tax where enabled
* Manual tax rules where appropriate

Store authoritative totals.

Verify:

```text
Subtotal
+
Tax
-
Discount
=
Final Total
```

Invoice totals must match the authoritative order/payment records.

---

# 20. COUPONS / PROMOTIONS

If required by the business, implement controlled discounts.

Support:

* Coupon code
* Discount type
* Fixed/percentage value
* Start date
* End date
* Usage limits
* Eligible products/plans
* Active/inactive state

Validate coupons server-side.

Never trust discount values from the browser.

If coupons are not required for launch, prepare the architecture without making it a launch blocker.

---

# 21. ABANDONED CHECKOUT

If technically and legally appropriate, track:

* Cart created
* Checkout started
* Checkout abandoned
* Purchase completed

Never classify abandoned checkout as a purchase.

If reminder emails are implemented:

* Require appropriate consent/legal basis
* Avoid spam
* Rate-limit communication
* Keep analytics separate from paid orders

---

# 22. INVOICES

Implement customer-accessible invoices if not already present.

Invoice should contain:

* Business information
* Customer information
* Invoice number
* Order number
* Date
* Product/floor plan
* Quantity
* Unit price
* Subtotal
* Tax
* Discount
* Total
* Payment status

Provide:

* View invoice
* Download invoice

Invoice must reflect authoritative order/payment records.

---

# 23. TRANSACTIONAL EMAIL SYSTEM

Implement/complete transactional email flows.

Required where applicable:

### Account

* Verification email
* Password reset

### Ecommerce

* Order confirmation
* Payment receipt
* Invoice
* Download instructions

### Refund

* Refund confirmation

### Support

* Relevant customer/order communication

Every email event should be logged where practical.

Never claim delivery metrics that the email provider does not provide.

---

# 24. DOWNLOAD HISTORY

Customer dashboard should show:

* Purchased plan
* Download date
* Download status
* Remaining download attempts where applicable
* Expiry
* File/package name

Existing secure download rules must remain intact.

Do not weaken:

* Private storage
* Signed access
* Token validation
* Expiration
* Download limits

---

# 25. CUSTOMER SUPPORT FLOW

From an order/account page provide a support route.

Where possible, automatically include:

* Customer
* Order number
* Product
* Relevant context

Do not require customers to manually re-enter information already available.

---

# 26. ADMIN CUSTOMER MANAGEMENT

Add/complete:

`/admin/customers`

Admin customer detail must show:

* Customer ID
* Name
* Email
* Phone
* Signup method
* Provider
* Created date
* Verification state
* Account status
* Last relevant activity
* Orders
* Invoices
* Purchased plans
* Downloads
* Account events

Admins must NEVER see customer passwords.

---

# 27. CUSTOMER ACCOUNT ADMIN ACTIONS

Authorized administrators should be able to perform:

### Resend verification

Use secure authentication workflow.

### Send password reset

Send the normal reset email.

### Enable/disable account

Require:

* Permission
* Confirmation
* Reason
* Audit log

### Revoke sessions

Require:

* Permission
* Confirmation
* Audit log

### Edit profile

Allow permitted fields such as:

* Name
* Phone
* Billing/contact information

Separate this from authentication credentials.

---

# 28. CUSTOMER EMAIL CHANGE

Do NOT simply update the customer's authentication email in the database.

Use the supported verified email-change workflow.

Require appropriate:

* Confirmation
* Authorization
* Verification
* Audit logging

---

# 29. CUSTOMER ACCOUNT SEARCH

Admin customer search should support:

* Name
* Email
* Phone where permitted
* Signup date
* Verification state
* Account status
* Authentication provider
* Purchaser/non-purchaser

Apply role-based access to PII.

---

# 30. CUSTOMER ACCOUNT TIMELINE

Create a customer event timeline.

Example:

```text
Account Created
      ↓
Email Verified
      ↓
Quote Submitted
      ↓
Order Created
      ↓
Payment Completed
      ↓
Invoice Sent
      ↓
Download
      ↓
Password Reset Requested
```

Include:

* Event
* Actor
* Timestamp
* Safe metadata

---

# 31. CUSTOMER DATA EXPORT

Implement controlled customer exports.

Supported formats:

* CSV
* XLSX

Allow filtering.

Possible fields:

* Name
* Email
* Phone
* Signup date
* Verification status
* Order count
* Paid lifetime value
* Last order

Never export:

* Passwords
* Authentication secrets
* Tokens
* Card details
* Unnecessary sensitive information

Log sensitive exports.

---

# 32. CUSTOMER DATA REQUEST WORKFLOW

Create a controlled workflow for:

* Account requests
* Data requests
* Supported deletion requests
* Other relevant privacy requests

Do not blindly delete legally required transaction records.

Retention rules must be configurable/documented according to the client's legal/accounting requirements.

---

# 33. ECOMMERCE ANALYTICS DASHBOARD

Implement the remaining ecommerce reporting layer.

Create a dashboard showing:

* Paid revenue
* Paid orders
* Customers
* New registrations
* Average order value
* Refunds
* Payment failures
* Top floor plans
* Downloads
* Date comparison

All monetary metrics must come from authoritative paid/refunded order data.

---

# 34. PAYMENT METHODS

Do not hardcode card-only checkout.

Use payment methods actually supported and enabled by the client's Stripe account and transaction context.

If Stripe supports/enables another eligible method, the order architecture should support it without requiring a database redesign.

---

# 35. SALES REPORT

Create a Sales Report Generator.

Filters:

* Date range
* Payment status
* Order status
* Product/floor plan
* Customer where authorized

Show:

* Gross paid sales
* Discounts
* Refunds
* Net sales
* Orders
* AOV
* Daily/monthly breakdown

---

# 36. ORDERS REPORT

Create downloadable order reports.

Include:

* Order number
* Date
* Customer
* Products
* Quantity
* Subtotal
* Tax
* Discount
* Total
* Payment status
* Order status
* Download/fulfillment state

---

# 37. CUSTOMER REPORT

Authorized admins should be able to generate customer reports.

Include:

* Customer
* Signup date
* Verification
* Order count
* Paid lifetime value
* Last order
* Customer status

Respect role permissions.

---

# 38. FLOOR PLAN SALES REPORT

Report performance per floor plan:

* Orders
* Units
* Paid revenue
* Refunds
* Net revenue
* Funnel metrics

Support date filtering.

---

# 39. PAYMENTS & REFUNDS REPORT

Create reconciliation-friendly reports containing:

* Order
* Stripe reference
* Amount
* Payment status
* Payment date
* Refund amount
* Refund status

NEVER include raw card data.

---

# 40. INVOICE REPORT

Allow authorized administrators to:

* Search invoices
* Filter invoices
* Download individual invoices
* Generate invoice register
* Export approved invoice data

---

# 41. DOWNLOAD ACTIVITY REPORT

Report:

* Customer
* Order
* Product
* Download date
* Download status
* Expiry
* Download count

Respect privacy permissions.

---

# 42. EMAIL PERFORMANCE REPORT

Where supported by the email provider, report:

* Sent
* Delivered
* Failed
* Bounced
* Other provider-supported metrics

Do not invent unavailable metrics.

---

# 43. SIGNUP & CUSTOMER CONVERSION REPORT

Track:

```text
Signup
↓
Verified Account
↓
First Purchase
↓
Returning Customer
```

Report:

* Signups
* Verified accounts
* First-time purchasers
* Returning purchasers
* Signup-to-purchase conversion

Define event rules consistently.

---

# 44. ECOMMERCE FUNNEL

Track:

* Product view
* Add to cart
* Checkout start
* Purchase

Example:

```text
1,000 Product Views
        ↓
120 Add to Cart
        ↓
70 Checkout
        ↓
25 Verified Purchases
```

Prevent duplicate purchase events.

---

# 45. ATTRIBUTION

Where technically and legally appropriate, capture:

* UTM source
* UTM medium
* UTM campaign
* Referrer
* Approved acquisition source

Connect attribution to:

* Session
* Customer
* Order

Do not alter authoritative Stripe/payment truth.

---

# 46. DATE FILTERS

All analytics should support:

* Today
* Yesterday
* Last 7 days
* Last 30 days
* Month
* Quarter
* Year
* Custom range
* Previous-period comparison

Use a consistent timezone strategy.

---

# 47. CSV / EXCEL EXPORT

Implement permission-controlled:

* CSV
* XLSX

Exports should respect active filters.

Use stable column names.

Format:

* Dates consistently
* Currency consistently
* Human-readable values

---

# 48. PDF MANAGEMENT REPORTS

Create formatted PDF summaries for authorized users.

Possible reports:

* Executive sales summary
* Monthly sales
* Product/floor-plan performance
* Customer summary
* Payment/refund summary

Include:

* Date range
* Generated timestamp
* Filters
* KPIs
* Tables

---

# 49. EXPORT PERMISSIONS

Create strict export permissions.

Example:

### Super Admin

Can access authorized:

* Customer exports
* Payment reports
* Financial reports

### Sales

Can access:

* Sales/customer information necessary for sales

### Content Admin

Should NOT access:

* Full payment export
* Sensitive financial data
* Unnecessary customer PII

Enforce on:

* API
* Server
* Database/RLS

Not only UI.

---

# 50. DASHBOARD DRILL-DOWN

Dashboard KPIs must be clickable.

Example:

```text
12 Refunded Orders
        ↓
Filtered Orders
        ↓
Exactly those 12 orders
```

Apply permissions.

---

# 51. REPORTING RECONCILIATION

Before declaring reporting complete:

Compare reports against:

* Supabase orders
* Payment records
* Stripe records

Test:

* Totals
* Refunds
* Filters
* Date boundaries
* Timezones
* Duplicate events
* Export rows

---

# 52. SALES ROLE

Complete RBAC with:

### SUPER_ADMIN

Full authorized access.

### CONTENT_ADMIN / EDITOR

CMS/content/media access.

### SALES

Customer/lead/quote/sales access required for operations.

Sales should NOT automatically receive:

* Security administration
* Admin-user management
* Payment secrets
* Unnecessary system settings

Every permission must be enforced server/database-side.

---

# 53. CUSTOMER DATA PRIVACY

Verify that:

* Customer A cannot access Customer B
* Public APIs cannot expose customer PII
* Customer orders are isolated
* Customer invoices are isolated
* Customer downloads are isolated
* Admin roles only access necessary information
* Exports respect permissions
* Logs don't contain unnecessary sensitive information

---

# 54. BACKUPS & RECOVERY

Verify the production Supabase backup strategy.

Implement/document:

* Automated backups
* Recovery process
* PITR where supported by the selected Supabase plan
* Pre-migration backup
* Pre-major-release backup

Do not consider a local JSON fallback equivalent to production database backup.

---

# 55. MOBILE CUSTOMER QA

Test the entire customer journey on common mobile screen sizes:

* Signup
* Verification
* Login
* Password reset
* Account
* Catalog
* Product detail
* Cart
* Checkout
* Stripe
* Order
* Invoice
* Download

Fix mobile-specific layout/interaction issues.

---

# 56. COMPLETE END-TO-END QA

This is the final critical test.

Run:

```text
New Customer
      ↓
Signup
      ↓
Email Verification
      ↓
Login
      ↓
Browse Floor Plans
      ↓
Product View
      ↓
Add to Cart
      ↓
Checkout
      ↓
Stripe Test Payment
      ↓
Verified Webhook
      ↓
Paid Order
      ↓
Email
      ↓
Invoice
      ↓
Customer Dashboard
      ↓
Secure Download
      ↓
Admin Order
      ↓
Admin Customer
      ↓
Analytics
      ↓
Reports
      ↓
RLS / Permission Tests
      ↓
Mobile QA
```

Also test:

* Failed payment
* Cancelled checkout
* Duplicate webhook
* Invalid payment
* Refund
* Expired download
* Download limit
* Unauthorized customer
* Unauthorized admin
* Incorrect role
* Rate limiting

---

# 57. SECURITY REGRESSION TEST

Do not weaken existing security.

Verify:

### Authentication

* Admin 2FA
* Customer authentication
* Session expiry
* Logout
* Password reset

### Authorization

* Admin roles
* Customer ownership
* API authorization
* Supabase RLS

### Storage

* Private paid files
* Signed URLs
* Expiration
* Download limits

### Payments

* Stripe webhook signature
* Idempotency
* Server-side price validation
* Refund authorization

### Data

* PII protection
* Export permissions
* Audit logs

---

# 58. DO NOT REBUILD COMPLETED FEATURES

Before modifying any existing module:

1. Inspect it.
2. Test it.
3. Reuse it where possible.
4. Extend only where necessary.

Especially preserve:

* Stripe
* Floor-plan ecommerce
* Secure downloads
* Supabase
* Admin CMS
* Shopify migration
* SEO redirects
* YouTube automation
* RBAC
* 2FA
* Activity logs
* Content versioning

---

# 59. DEFINITION OF COMPLETE

A requirement is COMPLETE only when:

```text
UI
 ↓
API / Server Action
 ↓
Authorization
 ↓
Supabase
 ↓
Database/RLS
 ↓
Business Logic
 ↓
Frontend
 ↓
QA
```

All layers must work.

Do not mark a feature complete simply because the page or button exists.

---

# 60. FINAL IMPLEMENTATION REPORT

At the end, provide a detailed implementation report.

## A. Customer Ecommerce

Report status for Modules 1–50.

For each:

* Completed
* Partial
* Missing
* QA Required

## B. Reporting

Report status for Modules 51–70.

## C. Customer Account Administration

Report status for Modules 71–90.

## D. Database

List:

* Tables added
* Tables modified
* Relationships
* Indexes
* RLS policies
* Constraints

## E. APIs

List:

* New API routes
* Modified API routes
* Authentication requirements
* Role requirements

## F. Stripe

Report:

* Checkout
* Webhooks
* Idempotency
* Refunds
* Payment logging
* Price validation

## G. Customer Authentication

Report:

* Signup
* Verification
* Login
* Google/social login if enabled
* Password reset
* Sessions

## H. Analytics

Report:

* Dashboard
* Sales
* Orders
* Customers
* Products
* Payments
* Refunds
* Funnel
* Attribution

## I. Exports

Report:

* CSV
* XLSX
* PDF
* Permission controls

## J. Security

Report:

* RLS
* RBAC
* Rate limiting
* Session security
* PII protection
* Storage
* Stripe security
* Audit logs

## K. QA

Report:

* Unit tests
* API tests
* Integration tests
* Stripe test-mode tests
* RLS tests
* Role tests
* Mobile tests
* End-to-end tests

## L. Remaining

Clearly list anything that still requires:

* Client credentials
* Stripe configuration
* Supabase configuration
* Email provider configuration
* Google OAuth configuration
* Legal/accounting decisions
* Production deployment
* Client verification

---

# FINAL GOAL

After completing this task, the ModularHome platform should support the complete lifecycle:

```text
CUSTOMER
   ↓
Signup
   ↓
Verification
   ↓
Login
   ↓
Browse
   ↓
Cart
   ↓
Stripe Checkout
   ↓
Verified Payment
   ↓
Order
   ↓
Invoice
   ↓
Email
   ↓
Customer Dashboard
   ↓
Secure Download
   ↓
Support

                    ↘
                      ADMIN
                    ↙
             Customer Management
             Order Management
             Payment Management
             Refunds
             Analytics
             Reports
             Exports
             CRM
             Audit
             Security
```

The final system must allow the client to operate the customer ecommerce business **without routine developer intervention**, while preserving the security and CMS functionality already implemented.

Do not declare the project fully complete until the implementation has been tested against the actual requirements and the final report clearly identifies what is **Completed, Ready for QA, or Remaining**.
