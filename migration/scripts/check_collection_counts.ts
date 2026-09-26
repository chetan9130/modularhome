import "dotenv/config";
import { supabaseAdmin } from "../../src/lib/supabase";

async function checkCollectionCounts() {
  const { data: cols } = await supabaseAdmin
    .from("collections")
    .select(`
      id,
      title,
      handle,
      product_collections (count)
    `)
    .order("created_at", { ascending: false });

  const sorted = cols
    ?.map(c => ({
      title: c.title,
      handle: c.handle,
      count: c.product_collections?.[0]?.count || 0
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  console.log("Top 25 Collections by Product Count in DB:");
  console.table(sorted?.slice(0, 25));
}

checkCollectionCounts();
