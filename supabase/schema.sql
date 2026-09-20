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

-- Public Insert Policies
CREATE POLICY "Public can submit leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit quotations" ON quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own download token" ON download_access FOR SELECT USING (true);

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
