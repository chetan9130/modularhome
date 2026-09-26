-- ==============================================================================
-- MODULARHOME SUPABASE DATABASE SCHEMA (10_SUPABASE_SCHEMA.sql)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  title TEXT,
  description_html TEXT,
  seo_title TEXT,
  seo_description TEXT,
  source_id TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description_html TEXT,
  vendor TEXT,
  product_type TEXT,
  status TEXT,
  seo_title TEXT,
  seo_description TEXT,
  source_id TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  barcode TEXT,
  title TEXT,
  option1 TEXT,
  option2 TEXT,
  option3 TEXT,
  price NUMERIC(12,2),
  compare_at_price NUMERIC(12,2),
  inventory_quantity INTEGER,
  source_id TEXT,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

-- 4. Product Media Table
CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER,
  media_type TEXT DEFAULT 'image',
  source_id TEXT
);

-- 5. Product Collections Junction Table
CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- 6. Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body_html TEXT,
  seo_title TEXT,
  seo_description TEXT,
  published BOOLEAN DEFAULT true,
  source_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_handle TEXT,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  body_html TEXT,
  excerpt TEXT,
  author TEXT,
  tags TEXT,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  source_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blog_handle, handle)
);

-- 8. Redirects Table
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  http_status INTEGER NOT NULL DEFAULT 301 CHECK (http_status IN (301, 302, 307, 308)),
  source TEXT DEFAULT 'shopify'
);

-- 9. URL Migrations Table
CREATE TABLE IF NOT EXISTS url_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT,
  source_handle TEXT,
  old_modularhome_path TEXT,
  new_path TEXT,
  action TEXT,
  verified BOOLEAN DEFAULT false,
  notes TEXT
);

-- 10. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin User',
  role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  two_factor_recovery_codes JSONB DEFAULT '[]'::jsonb,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

-- 11. Admin Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- 12. Login Attempts Table (Rate Limiting & Account Lockout)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  locked_until TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);

-- 13. Admin Activity & Audit Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
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

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

