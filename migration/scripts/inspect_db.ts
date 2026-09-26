import { Client } from "pg";
import { supabaseAdmin, isSupabaseConfigured } from "../../src/lib/supabase";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Checking Supabase connection...");
  console.log("isSupabaseConfigured:", isSupabaseConfigured());
  
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not found");
    return;
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully!");

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\nExisting Tables in public schema:");
    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log(tableNames);

    console.log("\nTable Details (Columns & Types):");
    for (const table of tableNames) {
      const colsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      const countRes = await client.query(`SELECT count(*) FROM "${table}";`);
      console.log(`\n--- TABLE: ${table} (row count: ${countRes.rows[0].count}) ---`);
      for (const col of colsRes.rows) {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
      }
    }

    // Also check storage buckets
    try {
      const bucketsRes = await client.query(`
        SELECT id, name, public, created_at FROM storage.buckets;
      `);
      console.log("\nStorage Buckets in storage.buckets:");
      console.log(bucketsRes.rows);
    } catch (err: any) {
      console.log("Could not query storage.buckets via SQL:", err.message);
    }

    // Also test supabase-js client
    const { data: testData, error: testErr } = await supabaseAdmin.from("global_settings").select("key").limit(1);
    console.log("\nSupabase JS Admin Client Test:", { testData, testErr });

  } catch (err: any) {
    console.error("Database inspection error:", err);
  } finally {
    await client.end();
  }
}

main();
