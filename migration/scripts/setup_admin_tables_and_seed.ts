import "dotenv/config";
import { Client } from "pg";
import bcrypt from "bcryptjs";

async function setupAdminTablesAndSeed() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL / SUPABASE_DB_URL is missing from environment.");
  }

  console.log("Connecting to PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  console.log("✓ Connected to PostgreSQL database.");

  console.log("Creating Admin Auth, Session, Security, and Activity Log tables...");

  const queries = [
    // 1. Admin Users table
    `
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
    `,

    // 2. Admin Sessions table
    `
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_token TEXT UNIQUE NOT NULL,
      user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at BIGINT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    `,

    // 3. Login Attempts & Rate Limiting table
    `
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
    `,

    // 4. Admin Activity & Audit Logs table
    `
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
    `,
  ];

  for (const q of queries) {
    try {
      await client.query(q);
    } catch (err: any) {
      console.warn("Schema creation notice:", err.message);
    }
  }
  console.log("✓ Admin tables and indexes verified/created successfully.");

  // Seed Admin Credentials
  const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@modularhome.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin@26";
  const adminName = "Admin Superuser";
  const adminRole = "SUPER_ADMIN";
  const adminStatus = "ACTIVE";

  console.log(`\nGenerating bcrypt password hash for admin (${adminEmail})...`);
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const insertQuery = `
    INSERT INTO admin_users (email, password_hash, name, role, status, updated_at)
    VALUES ($1, $2, $3, $4, $5, now())
    ON CONFLICT (email) 
    DO UPDATE SET 
      password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      updated_at = now()
    RETURNING id, email, name, role, status, created_at, updated_at;
  `;

  const { rows } = await client.query(insertQuery, [
    adminEmail,
    passwordHash,
    adminName,
    adminRole,
    adminStatus,
  ]);

  const seededAdmin = rows[0];
  console.log("✓ Admin credentials successfully added/updated in database:");
  console.log({
    id: seededAdmin.id,
    email: seededAdmin.email,
    name: seededAdmin.name,
    role: seededAdmin.role,
    status: seededAdmin.status,
    created_at: seededAdmin.created_at,
    updated_at: seededAdmin.updated_at,
  });

  // Verify bcrypt password verification against stored DB hash
  const verifyRes = await client.query("SELECT password_hash FROM admin_users WHERE email = $1", [adminEmail]);
  const isMatch = await bcrypt.compare(adminPassword, verifyRes.rows[0].password_hash);
  console.log(`\n✓ Password Verification Test: ${isMatch ? "SUCCESS (Credentials Validated)" : "FAILED"}`);

  // Query all admin users
  const allUsers = await client.query("SELECT id, email, name, role, status, created_at FROM admin_users;");
  console.log("\nAll Admin Users currently in DB:", allUsers.rows);

  await client.end();
  console.log("\n=== ADMIN CREDENTIALS SETUP COMPLETE ===");
}

setupAdminTablesAndSeed().catch((err) => {
  console.error("Setup error:", err);
  process.exit(1);
});
