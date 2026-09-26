import { ETLEngine } from "./etl_engine";

async function runDryRun() {
  console.log("==================================================");
  console.log("EXECUTING MODULARHOME ETL DRY RUN");
  console.log("==================================================");

  const engine = new ETLEngine();
  const result = await engine.run({ isDryRun: true });

  if (!result.success) {
    console.error("\n❌ Dry Run encountered validation issues. Review reports in migration/reports/ and migration/rejected/");
    process.exit(1);
  } else {
    console.log("\n✅ Dry Run passed successfully! All records validated. Ready for review before production import.");
  }
}

runDryRun().catch((err) => {
  console.error("Dry run execution failed:", err);
  process.exit(1);
});
