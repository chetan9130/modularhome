import "dotenv/config";
import { Client } from "pg";

async function inspectSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const tables = ['collections', 'blog_posts', 'products', 'pages', 'redirects'];
  for (const table of tables) {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1;
    `, [table]);
    console.log(`\nColumns for table ${table}:`);
    console.log(res.rows.map(r => r.column_name).join(', '));
  }

  await client.end();
}

inspectSchema();
