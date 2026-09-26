import "dotenv/config";
import { Client } from "pg";
import fs from "fs";
import path from "path";

async function applyRemainingSchema() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");

    const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      console.log("Applying supabase/schema.sql...");
      await client.query(sql);
      console.log("✓ supabase/schema.sql applied successfully!");
    }

    const seedPath = path.join(process.cwd(), "supabase", "seed.sql");
    if (fs.existsSync(seedPath)) {
      // Check if floor_plans is empty
      const { rows: fpRows } = await client.query("SELECT count(*) FROM floor_plans;");
      if (parseInt(fpRows[0].count) === 0) {
        console.log("Seeding initial floor plans and settings from supabase/seed.sql...");
        const seedSql = fs.readFileSync(seedPath, "utf-8");
        await client.query(seedSql);
        console.log("✓ supabase/seed.sql applied successfully!");
      } else {
        console.log(`floor_plans table already has ${fpRows[0].count} rows.`);
      }
    }

    await client.end();
  } catch (err) {
    console.error("Error applying schema/seed:", err);
  }
}

applyRemainingSchema();
