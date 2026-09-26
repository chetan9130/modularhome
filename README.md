MODULARHOME.COM — IMPLEMENT CUSTOMER ECOMMERCE MODULES 01 & 02

PROJECT:
ModularHome.com

CURRENT STACK:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Existing Stripe ecommerce infrastructure
- Existing product/catalog/floor-plan system
- Existing Admin CMS
- Existing production migration/ETL
- Existing SEO and redirect infrastructure

SOURCE OF TRUTH:
Follow the ModularHome Final Master Developer Specification.

This task implements ONLY:

MODULE 01 — Customer Signup
MODULE 02 — Email Verification

Both modules are CRITICAL requirements.

The specification requires:

MODULE 01 — Customer Signup
- New customer can create an account before or during purchase.
- Email/password signup.
- Validation.
- Consent/Terms acceptance.
- Duplicate-account handling.
- Secure Supabase Auth integration.
- Successful signup should lead the customer toward their account.

MODULE 02 — Email Verification
- Confirm ownership of customer's email address.
- Branded verification email.
- Verification callback.
- Verified/unverified account state.
- Customer clicks verification link and becomes verified.

IMPORTANT:
DO NOT rebuild the existing ModularHome system.
DO NOT replace the existing Supabase architecture.
DO NOT replace existing product/catalog functionality.
DO NOT replace existing Stripe functionality.
DO NOT replace existing Admin authentication.
DO NOT modify the existing migration/ETL.
DO NOT modify production data.
DO NOT perform DNS/domain changes.
DO NOT introduce a second authentication provider.

==================================================
1. INSPECT THE EXISTING PROJECT FIRST
==================================================

Before writing code, inspect:

- package.json
- Next.js app structure
- existing Supabase client/server utilities
- existing middleware
- existing authentication/session logic
- existing Admin authentication
- existing database schema
- existing RLS policies
- existing environment variable conventions
- existing public header/navigation
- existing customer/cart/checkout code
- existing Stripe checkout flow
- existing email infrastructure
- existing route structure
- existing UI components
- existing error handling
- existing forms and validation utilities

Determine whether Supabase Auth is already partially implemented.

If customer authentication already exists, EXTEND it instead of creating another implementation.

Clearly identify reusable existing utilities before creating new ones.

==================================================
2. CUSTOMER AUTH MUST BE SEPARATE FROM ADMIN AUTH
==================================================

There are two different authentication domains:

ADMIN:
- /admin/*
- Existing admin authentication/security must remain unchanged.

CUSTOMER:
- Public website
- Customer signup/login/account
- Supabase Auth customer users

Do not accidentally give customer accounts access to admin routes.

Do not weaken existing Admin RBAC, sessions, RLS, or security.

A normal customer must NEVER be able to access:

/admin
/admin/*
/api/admin/*

==================================================
3. MODULE 01 — CUSTOMER SIGNUP
==================================================

Implement a polished customer signup experience.

Preferred route if it does not conflict with the existing architecture:

/signup

If an existing route such as /register exists, inspect it first and reuse/upgrade it instead of creating a duplicate route.

Signup form should support:

- First name
- Last name
- Email
- Password
- Confirm password
- Terms/Privacy acceptance

Use the project's existing design system and Tailwind styling.

Do not create a visually unrelated authentication page.

==================================================
4. SIGNUP VALIDATION
==================================================

Implement client-side AND server/Supabase-side validation.

Validate:

EMAIL:
- Required
- Valid email format
- Normalize email appropriately

PASSWORD:
- Required
- Minimum secure length
- Confirm password must match

NAME:
- Required where applicable
- Trim whitespace
- Reasonable length limits

TERMS:
- Must be explicitly accepted before account creation.

Never trust client-side validation alone.

==================================================
5. SUPABASE AUTH
==================================================

Use the existing Supabase Auth configuration.

Use the correct server/client Supabase utilities already present in the project.

Do NOT expose:

- SUPABASE_SERVICE_ROLE_KEY
- Stripe secret keys
- other server secrets

to browser/client code.

Customer signup should create a Supabase Auth user.

Use email confirmation.

The application should NOT manually store customer passwords.

Passwords must be handled exclusively by Supabase Auth.

==================================================
6. CUSTOMER PROFILE
==================================================

If the project already has a customer/profile table, reuse it.

If not, create the minimum required profile structure according to the existing database architecture.

Do NOT create unnecessary duplicate customer tables.

Recommended relationship:

auth.users
    ↓
customer profile

The profile should be linked to the Supabase Auth user ID.

Possible fields:

- id
- auth_user_id
- first_name
- last_name
- email
- phone if supported by current architecture
- created_at
- updated_at

Use the existing naming conventions if different.

Email should remain authoritative from Supabase Auth where appropriate.

==================================================
7. TERMS / CONSENT
==================================================

Customer signup must capture acceptance of the applicable Terms/Privacy policy.

Do not simply create a checkbox with no stored record if the current ecommerce architecture requires auditable acceptance.

If the database already has policy/version infrastructure, reuse it.

Otherwise implement the minimum auditable structure needed.

Store:

- customer/user ID
- policy/version identifier
- accepted timestamp

Do not store unnecessary personal information.

==================================================
8. DUPLICATE ACCOUNT HANDLING
==================================================

Handle duplicate signup safely.

Do NOT reveal unnecessary account existence information to an unauthenticated user.

Do not display sensitive database/Auth errors directly to the customer.

Use friendly messages such as:

"Unable to create your account with these details. Please sign in or use password recovery if you already have an account."

Use server-side logging for technical errors where appropriate.

Do not leak:

- database errors
- Supabase internal errors
- SQL errors
- user IDs
- authentication internals

==================================================
9. MODULE 02 — EMAIL VERIFICATION
==================================================

Enable Supabase email confirmation.

After signup:

Customer
  ↓
Supabase Auth signup
  ↓
Verification email
  ↓
Customer clicks verification link
  ↓
Verification callback
  ↓
Authenticated/verified session
  ↓
Customer account

Use the project's existing Supabase email confirmation configuration if already present.

Do not implement a custom password/token system if Supabase Auth already provides the required mechanism.

==================================================
10. VERIFICATION CALLBACK
==================================================

Implement the appropriate callback route based on the existing Next.js/Supabase architecture.

Preferred conceptual route:

/auth/callback

But first inspect existing auth callback routes.

If one already exists, extend it.

The callback must:

- securely process the Supabase authentication callback
- establish/refresh the customer session as required
- handle invalid/expired callbacks safely
- redirect successfully verified users to the appropriate customer destination
- display a useful error for failed verification

Do not expose authentication tokens in URLs beyond what the Supabase flow requires.

Do not log sensitive authentication tokens.

==================================================
11. VERIFIED / UNVERIFIED STATE
==================================================

The application must be able to determine whether a customer email is verified.

Support states such as:

VERIFIED
UNVERIFIED

The customer UI should clearly communicate the state.

Example:

"Your email is not verified yet."

Provide:

"Resend verification email"

where supported.

After successful verification:

"Your email has been verified."

==================================================
12. RESEND VERIFICATION
==================================================

Provide a safe resend verification flow.

Possible route/page:

/verify-email

or an existing equivalent.

The page should provide:

- current verification state
- resend button
- success message
- safe error handling

Prevent abuse through appropriate rate limiting/cooldown if the project already has a rate-limiting mechanism.

Do not allow unlimited verification-email requests.

==================================================
13. SIGNUP SUCCESS FLOW
==================================================

After successful signup, the user should NOT simply be dumped onto an unrelated page.

Preferred flow:

Signup
 ↓
Account created
 ↓
Check email
 ↓
/verify-email
 ↓
Customer verifies email
 ↓
Customer continues to customer account

If the project's existing architecture has a different customer flow, preserve it.

The customer should understand exactly what they need to do next.

==================================================
14. CUSTOMER SESSION SECURITY
==================================================

Use Supabase's existing secure session architecture.

Do not store authentication tokens in localStorage unless the existing Supabase architecture explicitly requires it.

Use secure cookies/server-side session handling according to the existing project architecture.

Customer session must not grant admin privileges.

Ensure logout works correctly.

Do not modify existing Admin session behavior.

==================================================
15. RLS / DATABASE SECURITY
==================================================

Apply proper Supabase RLS to customer profile data.

A customer must only be able to access their own profile.

Conceptually:

Customer A
  ↓
Can read/update Customer A profile

Customer B
  ↓
Cannot read/update Customer A profile

Anonymous user
  ↓
Cannot read customer profiles

Admin access should continue through the existing secure server-side authorization architecture.

Do not rely only on frontend route hiding.

==================================================
16. MIDDLEWARE / ROUTE PROTECTION
==================================================

Inspect existing middleware before modifying it.

Do not break:

- /admin/*
- public pages
- API routes
- Stripe webhooks
- existing redirects
- sitemap
- robots.txt
- SEO

Customer routes that require authentication should be protected appropriately.

At this stage, only protect what is actually required by Modules 01–02.

Do not prematurely block public ecommerce browsing.

==================================================
17. EMAIL DESIGN
==================================================

Use the existing email provider/infrastructure if available.

Verification email should be branded for ModularHome.

It should contain:

- ModularHome branding
- verification purpose
- clear verification CTA
- appropriate expiration/security messaging
- support/contact information if the existing email architecture provides it

Do not hardcode secrets.

Do not use development-only sender addresses in production.

==================================================
18. ENVIRONMENT CONFIGURATION
==================================================

Support separate environments:

DEVELOPMENT
STAGING/PREVIEW
PRODUCTION

Do not mix Supabase projects.

Preview/Staging:
    → Supabase STAGING

Production:
    → Supabase PRODUCTION

Never expose:

SUPABASE_SERVICE_ROLE_KEY

to the client.

Use the project's existing environment variable names where possible.

Do not commit .env files containing secrets.

==================================================
19. UI / UX
==================================================

The signup and verification screens must visually match the existing ModularHome website.

Use:

- Existing Tailwind configuration
- Existing typography
- Existing buttons
- Existing form components
- Existing spacing
- Existing responsive behavior
- Existing header/footer where appropriate

Responsive requirements:

Desktop
Tablet
Mobile

Handle:

- loading
- validation errors
- network errors
- signup success
- verification pending
- verification success
- verification failure
- resend cooldown

Do not use fake buttons or simulated authentication.

Every control must perform the real operation.

==================================================
20. SEO
==================================================

Customer authentication pages should not be indexed.

For example:

/signup
/login
/verify-email
/auth/callback

should use appropriate noindex behavior.

Do not allow authentication pages to generate production sitemap entries.

Do not create canonical URLs that cause authentication pages to be indexed.

Preserve the existing public SEO implementation.

==================================================
21. SECURITY TESTING
==================================================

Test:

1. Valid signup
2. Invalid email
3. Weak password
4. Password mismatch
5. Missing required fields
6. Terms not accepted
7. Duplicate signup
8. Verification email
9. Verification callback
10. Expired/invalid verification link
11. Resend verification
12. Unverified account state
13. Verified account state
14. Logout
15. Customer cannot access admin
16. Customer cannot read another customer's profile
17. Anonymous user cannot read customer profile
18. Service-role key is never exposed
19. Authentication errors do not expose sensitive internals
20. Mobile signup
21. Mobile verification flow

==================================================
22. DATABASE TESTING
==================================================

Verify:

- Supabase Auth user is created.
- Customer profile is correctly linked.
- Terms acceptance is recorded if applicable.
- Verification state is correctly represented.
- RLS prevents unauthorized profile access.
- Duplicate profiles are not created.
- Repeated signup attempts do not create duplicate customer records.

Do not modify migrated product/catalog data.

==================================================
23. STRIPE / ECOMMERCE COMPATIBILITY
==================================================

Do not break the existing:

- floor plan catalog
- cart
- checkout
- Stripe integration
- orders
- digital downloads

The new customer identity system should be designed so later ecommerce modules can link:

Customer
  ↓
Orders
  ↓
Purchased Plans
  ↓
Entitlements
  ↓
Downloads

Do not implement Modules 03–50 unless required to make Modules 01–02 function.

==================================================
24. TEST COMMANDS
==================================================

After implementation run:

npm run lint

npx tsc --noEmit

npm run build

Also run any existing test suite.

If the project has existing E2E tests, add tests for:

- signup
- verification state
- verification callback
- RLS/customer isolation

==================================================
25. GIT SAFETY
==================================================

Do not modify production database.

Do not execute ETL.

Do not run:

npm run migration:production

Do not change DNS.

Do not change production Stripe configuration.

Implement and test in the current development/staging workflow.

==================================================
26. FINAL VERIFICATION
==================================================

Before declaring completion, verify:

MODULE 01 — CUSTOMER SIGNUP

[ ] Signup page exists
[ ] Email/password signup works
[ ] Validation works
[ ] Password confirmation works
[ ] Terms acceptance works
[ ] Supabase Auth user is created
[ ] Customer profile is linked
[ ] Duplicate signup handled safely
[ ] No passwords stored in application database
[ ] RLS protects customer profile
[ ] Mobile signup works

MODULE 02 — EMAIL VERIFICATION

[ ] Verification email is sent
[ ] Email is branded appropriately
[ ] Verification callback works
[ ] Verified state is detected
[ ] Unverified state is detected
[ ] Resend verification works
[ ] Resend abuse is controlled
[ ] Invalid/expired verification is handled
[ ] Verified customer reaches correct destination
[ ] Authentication pages are noindex
[ ] No secrets/tokens are exposed

==================================================
27. DO NOT CLAIM COMPLETION WITHOUT REAL VERIFICATION
==================================================

Do not report:

"Module 01 completed"
or
"Module 02 completed"

unless the actual functionality has been implemented and tested.

Final response must contain:

1. Files created
2. Files modified
3. Database changes
4. Supabase Auth configuration changes
5. RLS changes
6. Email configuration changes
7. Routes added/modified
8. Environment variables required (names only; NEVER output secrets)
9. Tests executed
10. TypeScript result
11. Build result
12. Module 01 status
13. Module 02 status
14. Any remaining limitations

Keep all existing ModularHome functionality intact.