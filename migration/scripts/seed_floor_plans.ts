import "dotenv/config";
import { Client } from "pg";
import { INITIAL_FLOOR_PLANS } from "../../src/data/floorPlans";

async function seedFloorPlans() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  console.log("Connecting to PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  console.log("✓ Connected to PostgreSQL database.");

  console.log(`Seeding ${INITIAL_FLOOR_PLANS.length} Floor Plan Kits into floor_plans table...`);

  const insertQuery = `
    INSERT INTO floor_plans (
      title,
      slug,
      tagline,
      description,
      price,
      sale_price,
      currency,
      preview_image,
      gallery,
      file_format,
      category,
      bedrooms,
      bathrooms,
      square_feet,
      dimensions,
      stories,
      included_items,
      features,
      specs,
      status,
      is_featured,
      display_order,
      seo_title,
      meta_description,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, now()
    )
    ON CONFLICT (slug)
    DO UPDATE SET
      title = EXCLUDED.title,
      tagline = EXCLUDED.tagline,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      sale_price = EXCLUDED.sale_price,
      currency = EXCLUDED.currency,
      preview_image = EXCLUDED.preview_image,
      gallery = EXCLUDED.gallery,
      file_format = EXCLUDED.file_format,
      category = EXCLUDED.category,
      bedrooms = EXCLUDED.bedrooms,
      bathrooms = EXCLUDED.bathrooms,
      square_feet = EXCLUDED.square_feet,
      dimensions = EXCLUDED.dimensions,
      stories = EXCLUDED.stories,
      included_items = EXCLUDED.included_items,
      features = EXCLUDED.features,
      specs = EXCLUDED.specs,
      status = EXCLUDED.status,
      is_featured = EXCLUDED.is_featured,
      display_order = EXCLUDED.display_order,
      seo_title = EXCLUDED.seo_title,
      meta_description = EXCLUDED.meta_description,
      updated_at = now()
    RETURNING id, title, slug, price, category, status;
  `;

  for (const plan of INITIAL_FLOOR_PLANS) {
    const res = await client.query(insertQuery, [
      plan.title,
      plan.slug,
      plan.tagline,
      plan.description,
      plan.price,
      plan.salePrice || null,
      plan.currency,
      plan.previewImage,
      JSON.stringify(plan.gallery),
      plan.fileFormat,
      plan.category,
      plan.bedrooms,
      plan.bathrooms,
      plan.squareFeet,
      plan.dimensions,
      plan.stories,
      JSON.stringify(plan.includedItems),
      JSON.stringify(plan.features),
      JSON.stringify(plan.specs),
      plan.status,
      plan.isFeatured,
      plan.displayOrder,
      plan.seoTitle,
      plan.metaDescription,
    ]);
    console.log(`✓ Seeded: ${res.rows[0].title} (${res.rows[0].slug}) -> Category: ${res.rows[0].category}, Price: $${res.rows[0].price}`);
  }

  const { rows: countRows } = await client.query("SELECT count(*) FROM floor_plans;");
  console.log(`\n✓ Total Floor Plan Kits in database: ${countRows[0].count}`);

  await client.end();
  console.log("=== FLOOR PLAN KITS SEEDING COMPLETE ===");
}

seedFloorPlans().catch((err) => {
  console.error("Seed floor plans error:", err);
  process.exit(1);
});
