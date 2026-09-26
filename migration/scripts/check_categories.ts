import "dotenv/config";
import { supabaseAdmin } from "../../src/lib/supabase";

async function checkCategories() {
  console.log("Checking categories...");
  const { data: pTypes, error: pErr } = await supabaseAdmin
    .from("products")
    .select("product_type");

  if (pErr) console.error("Error fetching product_types:", pErr);

  const typeCounts: Record<string, number> = {};
  pTypes?.forEach((p) => {
    const t = (p.product_type || "").trim();
    if (t) typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  console.log("Top 20 Product Types in DB:");
  console.table(Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 20));

  const { data: cols, error: cErr } = await supabaseAdmin
    .from("collections")
    .select("id, title, handle")
    .limit(30);

  if (cErr) console.error("Error fetching collections:", cErr);

  console.log("Sample Collections in DB:");
  console.table(cols?.slice(0, 20));
}

checkCategories();
