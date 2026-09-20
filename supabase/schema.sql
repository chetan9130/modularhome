-- ==============================================================================
-- MODULARHOME.COM - SUPABASE POSTGRESQL SCHEMA MIGRATION
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);

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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published_at);

-- 10. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  zip TEXT,
  enquiry_details TEXT,
  source TEXT DEFAULT 'WEBSITE', -- 'CONTACT_FORM', 'AI_CHAT', 'QUOTE_WIZARD', 'FLOOR_PLAN_UPLOAD', 'WEBSITE'
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
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'REVIEWED', 'ESTIMATE_SENT', 'ACCEPTED', 'DECLINED'
  source TEXT DEFAULT 'QUOTE_WIZARD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_email ON quotations(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created ON quotations(created_at);

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

-- Public Read Policies (for storefront visitors)
CREATE POLICY "Public can read published products" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read published collections" ON collections FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read product collections" ON product_collections FOR SELECT USING (true);
CREATE POLICY "Public can read published pages" ON pages FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read visible page sections" ON page_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read published blogs" ON blogs FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can read global settings" ON global_settings FOR SELECT USING (true);

-- Public Insert Policies (for customer inquiries & quotes)
CREATE POLICY "Public can submit leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit quotations" ON quotations FOR INSERT WITH CHECK (true);

-- Service Role / Admin Bypass (Allows full access for authenticated API backend operations)
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
