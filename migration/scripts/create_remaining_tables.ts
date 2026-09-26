import "dotenv/config";
import { Client } from "pg";

async function createTables() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to PostgreSQL.");

  const queries = [
    `
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
      file_path TEXT,
      file_format TEXT DEFAULT 'PDF + CAD (DWG)',
      category TEXT NOT NULL DEFAULT 'Cabins',
      bedrooms INTEGER DEFAULT 2,
      bathrooms INTEGER DEFAULT 1,
      square_feet INTEGER DEFAULT 800,
      dimensions TEXT DEFAULT '24x36 ft',
      stories INTEGER DEFAULT 1,
      included_items JSONB DEFAULT '["Full Construction Blueprints", "Electrical & Plumbing Schematic", "Foundation Engineering Details"]'::jsonb,
      features JSONB DEFAULT '[]'::jsonb,
      specs JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'PUBLISHED',
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
    `,
    `
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name TEXT NOT NULL,
      location TEXT,
      rating NUMERIC NOT NULL DEFAULT 5,
      review_text TEXT NOT NULL,
      project_title TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'PUBLISHED',
      is_featured BOOLEAN DEFAULT false,
      display_order INTEGER DEFAULT 0,
      review_date TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
    `,
    `
    CREATE TABLE IF NOT EXISTS faqs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      page_slug TEXT DEFAULT 'all',
      status TEXT DEFAULT 'PUBLISHED',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status);
    `,
    `
    CREATE TABLE IF NOT EXISTS global_settings (
      id TEXT PRIMARY KEY DEFAULT 'primary',
      company_name TEXT DEFAULT 'ModularHome.com',
      phone TEXT DEFAULT '+1 (812) 595-4033',
      email TEXT DEFAULT 'support@modularhome.com',
      announcement_text TEXT DEFAULT 'MODERN. AFFORDABLE. BUILT FOR LIFE.',
      announcement_enabled BOOLEAN DEFAULT true,
      default_seo_title TEXT DEFAULT 'Modular Homes For A Better Tomorrow',
      default_seo_desc TEXT DEFAULT 'Leading precision steel modular homes manufacturer.',
      header_navigation JSONB DEFAULT '[]'::jsonb,
      footer_navigation JSONB DEFAULT '[]'::jsonb,
      social_links JSONB DEFAULT '{}'::jsonb,
      custom_scripts JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    `,
    `
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
      payment_status TEXT DEFAULT 'PENDING',
      order_status TEXT DEFAULT 'PENDING',
      payment_provider TEXT DEFAULT 'STRIPE',
      payment_id TEXT,
      notes TEXT,
      attribution JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      slug TEXT,
      price NUMERIC NOT NULL,
      quantity INTEGER DEFAULT 1,
      format TEXT DEFAULT 'PDF + CAD (DWG)',
      created_at TIMESTAMPTZ DEFAULT now()
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS download_access (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
      customer_email TEXT NOT NULL,
      floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      download_count INTEGER DEFAULT 0,
      max_downloads INTEGER DEFAULT 5,
      last_downloaded_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    `
  ];

  for (const q of queries) {
    try {
      await client.query(q);
    } catch (e: any) {
      console.warn("Query notice:", e.message);
    }
  }
  console.log("✓ Core tables created successfully.");

  // Insert default setting row if not exists
  await client.query(`
    INSERT INTO global_settings (id, company_name, phone, email)
    VALUES ('primary', 'ModularHome.com', '+1 (812) 595-4033', 'support@modularhome.com')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Check and seed initial floor plans if empty
  const { rows: fpCount } = await client.query("SELECT count(*) FROM floor_plans;");
  if (parseInt(fpCount[0].count) === 0) {
    console.log("Adding initial precision floor plans...");
    await client.query(`
      INSERT INTO floor_plans (title, slug, tagline, description, price, sale_price, preview_image, category, bedrooms, bathrooms, square_feet, dimensions, stories, status, is_featured)
      VALUES 
      ('The Nordic Cabin', 'the-nordic-cabin', 'Scandinavian-Inspired Precision Steel Cabin', 'Minimalist Scandinavian architectural modular cabin featuring expansive floor-to-ceiling panoramic glass and soaring vaulted ceilings.', 495, 395, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'Cabins', 2, 1, 850, '24x36 ft', 1, 'PUBLISHED', true),
      ('The Modern Barndominium', 'the-modern-barndominium', 'Spacious Dual-Story Steel Living & Workshop', 'Industrial modern farmhouse barndominium floor plan with clearspan steel truss framing, open-concept great room, and loft.', 595, 495, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Barndominiums', 4, 3, 2400, '40x60 ft', 2, 'PUBLISHED', true),
      ('The Compact ADU', 'the-compact-adu', 'Backyard Granny Pod & Rental Suite Plan', 'Engineered secondary dwelling unit plan with full kitchen, bathroom, and private living quarters optimized for rapid permitting.', 395, 295, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'ADUs', 1, 1, 480, '20x24 ft', 1, 'PUBLISHED', true)
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log("✓ Floor plans seeded.");
  }

  // Seed reviews if empty
  const { rows: revCount } = await client.query("SELECT count(*) FROM reviews;");
  if (parseInt(revCount[0].count) === 0) {
    console.log("Adding initial customer reviews...");
    await client.query(`
      INSERT INTO reviews (customer_name, location, rating, review_text, project_title, status, is_featured)
      VALUES 
      ('David M.', 'Colorado', 5, 'Built our mountain cabin in 4 weeks from order to dry-in. The steel frame tolerances were within 1/16th inch across the whole slab. Phenomenal engineering.', 'The Nordic Cabin', 'PUBLISHED', true),
      ('Sarah & James K.', 'Texas Hill Country', 5, 'ModularHome delivered our custom barndominium kit on schedule. The wet-stamped engineering package sailed through county permitting on the very first submittal.', 'The Modern Barndominium', 'PUBLISHED', true),
      ('Marcus T.', 'North Carolina', 5, 'We added an ADU in our backyard for rental income. Super easy assembly, top notch energy insulation, and great customer support throughout.', 'The Compact ADU', 'PUBLISHED', true)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✓ Reviews seeded.");
  }

  await client.end();
  console.log("=== SETUP COMPLETE ===");
}

createTables().catch(console.error);
