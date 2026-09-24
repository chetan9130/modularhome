-- ==============================================================================
-- MODULARHOME.COM - SUPABASE POSTGRESQL SCHEMA (PHASE 1 + PHASE 2)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'ADMIN', -- 'ADMIN', 'EDITOR'
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- 3. Global Settings Table
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'ModularHome',
  logo_url TEXT DEFAULT '/finallogo.avif',
  favicon_url TEXT DEFAULT '/favicon.ico',
  phone TEXT DEFAULT '+1 (812) 595-4033',
  email TEXT DEFAULT 'support@modularhome.com',
  address TEXT DEFAULT '100 Industrial Parkway, Austin, TX 78701',
  social_links JSONB DEFAULT '[]'::jsonb,
  announcement_enabled BOOLEAN DEFAULT true,
  announcement_text TEXT DEFAULT '✨ Nationwide Modular Delivery & Precision Engineering',
  announcement_link TEXT DEFAULT '/buildings',
  nav_links JSONB DEFAULT '[]'::jsonb,
  footer_text TEXT DEFAULT 'ModularHome is the leading precision steel-frame and modular home manufacturer.',
  footer_links JSONB DEFAULT '[]'::jsonb,
  default_seo_title TEXT DEFAULT 'ModularHome | Premium Precision Engineered Modular & Steel Homes',
  default_meta_description TEXT DEFAULT 'Discover next-generation precision-engineered modular homes. Rapid build, engineered durability, luxury architectural finishes.',
  cta_label TEXT DEFAULT 'Get a Free Quote',
  cta_link TEXT DEFAULT '#quote',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_settings_key ON global_settings(key);

-- 4. Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  content TEXT,
  status TEXT DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'DRAFT', 'ARCHIVED'
  featured_image TEXT,
  seo_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  shopify_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_shopify_id ON pages(shopify_id);

-- 5. Page Sections Table
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(page_id, display_order);

-- 6. Products Table (Modular & Steel Building Models)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  series TEXT,
  architectural_style TEXT,
  sqft INTEGER DEFAULT 0,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  stories INTEGER DEFAULT 1,
  starting_price NUMERIC DEFAULT 0,
  dimensions TEXT,
  frame_type TEXT,
  roof_pitch TEXT,
  wind_rating TEXT,
  snow_load TEXT,
  warranty TEXT,
  primary_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  floor_plan_image TEXT,
  video_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '[]'::jsonb,
  customizable_options JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  seo_title TEXT,
  meta_description TEXT,
  image_alt_text TEXT,
  canonical_url TEXT,
  shopify_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_shopify_id ON products(shopify_id);

-- 7. Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tagline TEXT,
  banner_image TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'DRAFT'
  seo_title TEXT,
  meta_description TEXT,
  image_alt_text TEXT,
  shopify_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_shopify_id ON collections(shopify_id);

-- 8. Product Collections Mapping Table
CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_product ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection ON product_collections(collection_id);

-- 9. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT DEFAULT 'ModularHome Team',
  published_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'DRAFT', 'ARCHIVED'
  categories JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  embedded_video_url TEXT,
  seo_title TEXT,
  meta_description TEXT,
  image_alt_text TEXT,
  canonical_url TEXT,
  shopify_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_shopify_id ON blogs(shopify_id);

-- 10. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  zip TEXT,
  enquiry_details TEXT,
  source TEXT DEFAULT 'WEBSITE',
  status TEXT DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'QUALIFIED', 'QUOTE_SENT', 'FOLLOW_UP', 'WON', 'LOST'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- 11. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_zip TEXT,
  model_slug TEXT,
  model_name TEXT,
  sqft INTEGER,
  dimensions TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  pricing_inputs JSONB DEFAULT '{}'::jsonb,
  estimated_amount NUMERIC,
  timeline TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'PENDING',
  source TEXT DEFAULT 'QUOTE_WIZARD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_email ON quotations(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created ON quotations(created_at);

-- ==============================================================================
-- 12. PHASE 2 - FLOOR PLANS E-COMMERCE CATALOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 499,
  sale_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  preview_image TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  file_path TEXT, -- Storage path to downloadable CAD/PDF kit
  file_format TEXT DEFAULT 'PDF + CAD (DWG)',
  category TEXT NOT NULL DEFAULT 'Cabins', -- 'Cabins', 'ADUs', 'Barndominiums', 'Modern Residential'
  bedrooms INTEGER DEFAULT 2,
  bathrooms INTEGER DEFAULT 1,
  square_feet INTEGER DEFAULT 800,
  dimensions TEXT DEFAULT '24x36 ft',
  stories INTEGER DEFAULT 1,
  included_items JSONB DEFAULT '["Full Construction Blueprints", "Electrical & Plumbing Schematic", "Foundation Engineering Details", "Material Takeoff List", "Structural Framing Diagrams"]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'DRAFT', 'ARCHIVED'
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  seo_title TEXT,
  meta_description TEXT,
  shopify_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_floor_plans_slug ON floor_plans(slug);
CREATE INDEX IF NOT EXISTS idx_floor_plans_category ON floor_plans(category);
CREATE INDEX IF NOT EXISTS idx_floor_plans_status ON floor_plans(status);

-- ==============================================================================
-- 13. PHASE 2 - ORDERS & E-COMMERCE TRANSACTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_zip TEXT,
  customer_country TEXT DEFAULT 'US',
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'REFUNDED'
  order_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'
  payment_provider TEXT DEFAULT 'STRIPE', -- 'STRIPE', 'TEST'
  payment_id TEXT, -- Stripe Checkout Session ID or Payment Intent ID
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- 14. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_plan ON order_items(floor_plan_id);

-- 15. Payments Table (Transaction Logs)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'CAPTURED', 'FAILED', 'REFUNDED'
  gateway_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

-- 16. Secure Download Access Table
CREATE TABLE IF NOT EXISTS download_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  download_token TEXT UNIQUE NOT NULL,
  file_path TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_token ON download_access(download_token);
CREATE INDEX IF NOT EXISTS idx_download_customer ON download_access(customer_email);

-- 17. URL 301 Redirects Table (SEO Migration)
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT UNIQUE NOT NULL,
  target_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redirects_source ON redirects(source_path);

-- ==============================================================================
-- 18. ADMIN AUDIT TRAILS & ACTIVITY LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  description TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- ==============================================================================
-- 19. CONTENT VERSION HISTORY & RESTORE REVISIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'pages', 'products', 'collections', 'blogs', 'global_settings'
  entity_id TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  creator_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_versions_lookup ON content_versions(entity_type, entity_id, version_number);

-- ==============================================================================
-- 20. MEDIA LIBRARY ASSETS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_mime ON media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created ON media_assets(created_at);

-- ==============================================================================
-- 21. REVIEWS & TESTIMONIALS CMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  location TEXT,
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  project_title TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'DRAFT'
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  review_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);

-- ==============================================================================
-- 22. FAQS CMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  page_slug TEXT DEFAULT 'all',
  status TEXT DEFAULT 'PUBLISHED', -- 'PUBLISHED', 'DRAFT'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- ==============================================================================
-- 23. LOGIN ATTEMPTS & RATE LIMITING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  locked_until TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);

-- Update admin_users with 2FA columns if needed
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS two_factor_recovery_codes JSONB DEFAULT '[]'::jsonb;

-- Update leads and quotations with CRM management fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_history JSONB DEFAULT '[]'::jsonb;

ALTER TABLE quotations ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_users(id);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS quote_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- ==============================================================================
-- 24. CUSTOMER ACCOUNTS & ECOMMERCE PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  billing_address JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'DISABLED'
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMPTZ,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  provider TEXT DEFAULT 'EMAIL', -- 'EMAIL', 'GOOGLE'
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_verification ON customers(verification_token);
CREATE INDEX IF NOT EXISTS idx_customers_reset ON customers(reset_token);

-- 25. Customer Sessions Table
CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON customer_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);

-- 26. Customer Activity Events & Lifecycle Timeline
CREATE TABLE IF NOT EXISTS customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'ACCOUNT_CREATED', 'EMAIL_VERIFIED', 'LOGGED_IN', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'ORDER_PLACED', 'DOWNLOAD_ACCESSED', 'ADMIN_NOTE_ADDED', 'STATUS_CHANGED'
  actor_type TEXT DEFAULT 'CUSTOMER', -- 'CUSTOMER', 'ADMIN', 'SYSTEM'
  actor_id TEXT,
  actor_name TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_events_customer ON customer_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_events_type ON customer_events(event_type);
CREATE INDEX IF NOT EXISTS idx_customer_events_created ON customer_events(created_at);

-- 27. Stripe Webhook Diagnostics & Idempotency Store
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PROCESSED', -- 'RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED'
  error_message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_stripe_id ON payment_webhooks(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_order ON payment_webhooks(order_id);

-- 28. Transactional Email System Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'ORDER_CONFIRMATION', 'INVOICE_RECEIPT', 'REFUND_CONFIRMATION', 'DOWNLOAD_READY'
  subject TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'SENT', -- 'SENT', 'FAILED', 'SIMULATED'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_customer ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_order ON email_logs(order_id);

-- Enhance orders table with customer and billing attributes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS attribution JSONB DEFAULT '{}'::jsonb;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public can read published products" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read published collections" ON collections FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read product collections" ON product_collections FOR SELECT USING (true);
CREATE POLICY "Public can read published pages" ON pages FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read visible page sections" ON page_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read published blogs" ON blogs FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read global settings" ON global_settings FOR SELECT USING (true);
CREATE POLICY "Public can read published floor plans" ON floor_plans FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read active redirects" ON redirects FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read published reviews" ON reviews FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read published faqs" ON faqs FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read media assets" ON media_assets FOR SELECT USING (true);

-- Public Insert Policies
CREATE POLICY "Public can submit leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit quotations" ON quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own download token" ON download_access FOR SELECT USING (true);
CREATE POLICY "Public can register as customer" ON customers FOR INSERT WITH CHECK (true);

-- Service Role / Admin Bypass
CREATE POLICY "Service role full access on admin_users" ON admin_users FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on sessions" ON sessions FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on global_settings" ON global_settings FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on pages" ON pages FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on page_sections" ON page_sections FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on products" ON products FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on collections" ON collections FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on product_collections" ON product_collections FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on blogs" ON blogs FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on leads" ON leads FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on quotations" ON quotations FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on floor_plans" ON floor_plans FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on orders" ON orders FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on order_items" ON order_items FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on payments" ON payments FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on download_access" ON download_access FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on redirects" ON redirects FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on activity_logs" ON activity_logs FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on content_versions" ON content_versions FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on media_assets" ON media_assets FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on reviews" ON reviews FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on faqs" ON faqs FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on login_attempts" ON login_attempts FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on customers" ON customers FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on customer_sessions" ON customer_sessions FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on customer_events" ON customer_events FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on payment_webhooks" ON payment_webhooks FOR ALL USING (auth.jwt() IS NULL OR true);
CREATE POLICY "Service role full access on email_logs" ON email_logs FOR ALL USING (auth.jwt() IS NULL OR true);

-- Schema and Table Permissions for PostgREST & Supabase Client Roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;


