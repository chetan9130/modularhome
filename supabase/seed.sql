-- ==============================================================================
-- MODULARHOME.COM - INITIAL SUPABASE SEED DATA (PHASE 1 + PHASE 2)
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
  '[{"label":"Home","href":"/"},{"label":"Models","href":"/buildings"},{"label":"Floor Plans","href":"/floor-plans"},{"label":"Video Tours","href":"/videos"},{"label":"Instant Quote","href":"#quote"},{"label":"Blog","href":"/resources"},{"label":"Contact","href":"/contact"}]'::jsonb,
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

-- 4. Phase 2 - Default Floor Plan Blueprints Catalog
INSERT INTO floor_plans (
  title,
  slug,
  tagline,
  description,
  price,
  sale_price,
  preview_image,
  gallery,
  category,
  bedrooms,
  bathrooms,
  square_feet,
  dimensions,
  stories,
  status,
  is_featured,
  display_order,
  seo_title,
  meta_description
) VALUES
(
  'The Alpine Sanctuary 900',
  'alpine-sanctuary-900',
  'Modern Scandinavian A-Frame Cabin with Loft & Glass Gable',
  'A high-performance 2-bedroom modern cabin blueprint package optimized for sloped terrain, snowy climates, and rapid steel framing assembly. Includes complete foundation engineering, framing layouts, electrical blueprints, and plumbing riser diagrams.',
  495,
  395,
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop"]'::jsonb,
  'Cabins',
  2,
  1,
  900,
  '26x36 ft',
  2,
  'PUBLISHED',
  true,
  1,
  'The Alpine Sanctuary 900 Floor Plan Blueprint | ModularHome',
  'Download complete architectural construction blueprints for The Alpine Sanctuary 900 cabin kit. PDF + CAD formats included.'
),
(
  'The Haven Barndominium 2400',
  'haven-barndominium-2400',
  'Spacious 4-Bedroom Open Concept Steel Home with Integrated Shop',
  'Complete builder-ready architectural plans for a 2,400 sqft residential steel barndominium with a 30x40 attached 2-bay garage and workshop. Features cathedral ceilings, wraparound porch, and structural steel load calculations.',
  795,
  595,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"]'::jsonb,
  'Barndominiums',
  4,
  3,
  2400,
  '40x60 ft',
  1,
  'PUBLISHED',
  true,
  2,
  'The Haven Barndominium 2400 Architectural Plans | ModularHome',
  'Complete 4-bedroom barndominium floor plan package with shop space. Instant CAD & stamped PDF download.'
),
(
  'The Metro Backyard ADU 550',
  'metro-backyard-adu-550',
  'Efficient 1-Bedroom Turnkey Accessory Dwelling Unit',
  'Designed specifically to meet nationwide municipal ADU setback and height requirements. Includes full kitchen layout, walk-in shower, dedicated laundry closet, and pre-engineered rooftop solar structural provisions.',
  350,
  275,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop"]'::jsonb,
  'ADUs',
  1,
  1,
  550,
  '20x28 ft',
  1,
  'PUBLISHED',
  true,
  3,
  'The Metro Backyard ADU 550 Plans | ModularHome',
  'Builder-grade accessory dwelling unit floor plan blueprints. Rapid permit ready.'
),
(
  'The Horizon Vista Villa 1800',
  'horizon-vista-villa-1800',
  'Modern 3-Bedroom Steel Frame Residence with Courtyard',
  'A luxury modern residential layout with split-bedroom configuration, master retreat with private patio, and 12-foot floor-to-ceiling glass wall framing details.',
  650,
  495,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
  '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop"]'::jsonb,
  'Modern Residential',
  3,
  2,
  1800,
  '36x50 ft',
  1,
  'PUBLISHED',
  false,
  4,
  'The Horizon Vista Villa 1800 Blueprint Set | ModularHome',
  'Contemporary 3-bedroom luxury modular home architectural blueprints and engineering diagrams.'
)
ON CONFLICT (slug) DO NOTHING;
