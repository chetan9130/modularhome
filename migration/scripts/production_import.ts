import { ETLEngine } from "./etl_engine";
import { DatabaseService } from "./db";
import { runReconciliation } from "./reconciliation";

async function runProductionImport() {
  const isConfirmed =
    process.env.CONFIRM_PRODUCTION_MIGRATION === "true" ||
    process.argv.includes("--confirm") ||
    process.argv.includes("-y");

  if (!isConfirmed) {
    console.error(`
==============================================================================
⚠️  CRITICAL SAFETY WARNING: PRODUCTION SUPABASE WRITE
==============================================================================
This command will write live data to ModularHome Production Supabase.

To proceed, you MUST explicitly confirm by setting the environment variable:
  $env:CONFIRM_PRODUCTION_MIGRATION="true"; npm run migration:production
or pass the argument:
  npm run migration:production -- --confirm

Migration aborted for safety.
==============================================================================
`);
    process.exit(1);
  }

  console.log(`
==============================================================================
🚀 CONFIRMED: EXECUTING LIVE PRODUCTION SUPABASE IMPORT
==============================================================================
Target Database: ModularHome Supabase PostgreSQL
Timestamp: ${new Date().toISOString()}
==============================================================================
`);

  const engine = new ETLEngine();
  const result = await engine.run({ isDryRun: false, batchSize: 500 });

  if (!result.success) {
    console.error("\n❌ Production import finished with errors. Inspect logs in migration/logs/");
    process.exit(1);
  }

  console.log("\nRunning post-import reconciliation...");
  await runReconciliation();

  console.log(`
==============================================================================
🎉 PRODUCTION IMPORT COMPLETED SUCCESSFULLY!
==============================================================================
All stages processed in locked sequence:
1. Collections
2. Products
3. Variants
4. Media
5. Product ↔ Collection Memberships
6. Pages
7. Blogs
8. Existing Redirects
9. ModularHome Old → New URL Mappings
==============================================================================
`);
}

runProductionImport().catch((err) => {
  console.error("Fatal error during production import:", err);
  process.exit(1);
});
