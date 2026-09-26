import { Pool, PoolClient } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

export class DatabaseService {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL / SUPABASE_DB_URL environment variable is missing");
    }

    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
    });
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async query(sql: string, params: any[] = []) {
    return this.pool.query(sql, params);
  }

  public async close() {
    await this.pool.end();
  }

  /**
   * Fetch maps of handle -> UUID for collections and products
   */
  public async getEntityLookups(): Promise<{
    productHandleToId: Map<string, string>;
    collectionHandleToId: Map<string, string>;
  }> {
    const client = await this.getClient();
    try {
      const prodRes = await client.query(`SELECT id, handle FROM products;`);
      const colRes = await client.query(`SELECT id, handle FROM collections;`);

      const productHandleToId = new Map<string, string>();
      for (const row of prodRes.rows) {
        if (row.handle) productHandleToId.set(row.handle.toLowerCase(), row.id);
      }

      const collectionHandleToId = new Map<string, string>();
      for (const row of colRes.rows) {
        if (row.handle) collectionHandleToId.set(row.handle.toLowerCase(), row.id);
      }

      return { productHandleToId, collectionHandleToId };
    } finally {
      client.release();
    }
  }

  /**
   * Counts rows in all relevant public tables
   */
  public async getTableCounts(): Promise<Record<string, number>> {
    const client = await this.getClient();
    try {
      const tables = [
        "collections",
        "products",
        "product_variants",
        "product_media",
        "product_collections",
        "pages",
        "blog_posts",
        "redirects",
        "url_migrations",
      ];

      const counts: Record<string, number> = {};
      for (const t of tables) {
        const res = await client.query(`SELECT count(*)::int as count FROM "${t}";`);
        counts[t] = res.rows[0].count;
      }
      return counts;
    } finally {
      client.release();
    }
  }
}
