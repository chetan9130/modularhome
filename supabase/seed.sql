-- ==============================================================================
-- MODULARHOME.COM - INITIAL SUPABASE SEED DATA
-- ==============================================================================

-- 1. Default Global Settings
INSERT INTO global_settings (
  key,
  company_name,
  logo_url,
  favicon_url,
  phone,
  email,
  address,
  social_links,
  announcement_enabled,
  announcement_text,
  announcement_link,
  nav_links,
  footer_text,
  footer_links,
  default_seo_title,
  default_meta_description,
  cta_label,
  cta_link
) VALUES (
  'default',
  'ModularHome',
  '/finallogo.avif',
  '/favicon.ico',
  '+1 (812) 595-4033',
  'support@modularhome.com',
  '100 Industrial Parkway, Austin, TX 78701',
  '[{"platform":"youtube","url":"https://youtube.com/@modularhome"},{"platform":"instagram","url":"https://instagram.com/modularhome"},{"platform":"facebook","url":"https://facebook.com/modularhome"},{"platform":"tiktok","url":"https://tiktok.com/@modularhome"}]'::jsonb,
  true,
  '✨ Nationwide Factory Modular Delivery & Precision Engineering',
  '/buildings',
  '[{"label":"Home","href":"/"},{"label":"Models","href":"/buildings"},{"label":"Floor Plans","href":"/upload-floor-plan"},{"label":"Video Tours","href":"/videos"},{"label":"Instant Quote","href":"#quote"},{"label":"Blog","href":"/resources"},{"label":"Contact","href":"/contact"}]'::jsonb,
  'ModularHome is the leading precision steel-frame and modular home manufacturer delivering sustainable, energy-efficient luxury homes in record time.',
  '[{"label":"Privacy Policy","href":"/privacy"},{"label":"Terms of Service","href":"/terms"},{"label":"Warranty Info","href":"/warranty"},{"label":"Admin Portal","href":"/admin"}]'::jsonb,
  'ModularHome | Premium Precision Engineered Modular & Steel Homes',
  'Discover next-generation precision-engineered modular homes. Rapid build, engineered durability, luxury architectural finishes.',
  'Get a Free Quote',
  '#quote'
) ON CONFLICT (key) DO NOTHING;

-- 2. Default Admin Superuser (Password: Admin@ModularHome2026!)
INSERT INTO admin_users (
  email,
  password_hash,
  name,
  role,
  status
) VALUES (
  'admin@modularhome.com',
  '$2a$10$R9w7e0kM2xS5yP0xV7hO8.9j1h7bQ7fN2n8X5yK4l3m2p1q0r9s8t', -- bcrypt hash for Admin@ModularHome2026!
  'Admin Superuser',
  'ADMIN',
  'ACTIVE'
) ON CONFLICT (email) DO NOTHING;

-- 3. Default Collections
INSERT INTO collections (
  name,
  slug,
  tagline,
  description,
  image,
  banner_image,
  display_order,
  is_featured,
  status,
  seo_title,
  meta_description
) VALUES
(
  'Modern Minimalist',
  'modern-minimalist',
  'Clean architectural lines with panoramic glass walls',
  'Engineered for contemporary lifestyles with open-concept layouts, high ceilings, and seamless indoor-outdoor living spaces.',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
  1,
  true,
  'PUBLISHED',
  'Modern Minimalist Modular Homes | ModularHome',
  'Explore our signature Modern Minimalist steel-framed modular homes featuring floor-to-ceiling glass and smart home integration.'
),
(
  'Luxury Architectural',
  'luxury-architectural',
  'Multi-level luxury estates built to the highest engineering standards',
  'Spacious 4-6 bedroom floor plans designed for large families and luxury living with custom steel truss architectures.',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop',
  2,
  true,
  'PUBLISHED',
  'Luxury Architectural Modular Homes | ModularHome',
  'Discover high-end luxury modular homes engineered with sustainable steel framing and designer interior finishes.'
),
(
  'Compact ADUs & Cabins',
  'compact-adus-cabins',
  'Fast-deploy accessory dwelling units and off-grid mountain cabins',
  'Turnkey backyard suites, rental guest houses, and remote cabins ready to install in under 60 days.',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1600&auto=format&fit=crop',
  3,
  true,
  'PUBLISHED',
  'ADU & Cabin Modular Units | ModularHome',
  'Backyard granny pods, accessory dwelling units, and pre-engineered cabins delivered nationwide.'
)
ON CONFLICT (slug) DO NOTHING;
