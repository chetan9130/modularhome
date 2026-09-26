import "dotenv/config";
import { supabaseAdmin, isSupabaseConfigured } from "../../src/lib/supabase";

async function debug() {
  console.log("isSupabaseConfigured:", isSupabaseConfigured());
  console.log("Supabase URL configured:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  console.log("\n1. Testing products table select...");
  const { data: pData, error: pError, count: pCount } = await supabaseAdmin
    .from("products")
    .select("*, product_variants(*), product_media(*)", { count: "exact" })
    .limit(3);

  console.log("Products query error:", pError);
  console.log("Products total count in DB:", pCount);
  console.log("Products sample fetched:", pData?.length);
  if (pData && pData.length > 0) {
    console.log("Sample product row title:", pData[0].title, "| handle:", pData[0].handle, "| variants:", pData[0].product_variants?.length);
  }

  console.log("\n2. Testing collections table select...");
  const { data: cData, error: cError, count: cCount } = await supabaseAdmin
    .from("collections")
    .select(`*, product_collections(product_id)`, { count: "exact" })
    .limit(3);

  console.log("Collections query error:", cError);
  console.log("Collections total count in DB:", cCount);
  console.log("Collections sample fetched:", cData?.length);
  if (cData && cData.length > 0) {
    console.log("Sample collection row title:", cData[0].title, "| handle:", cData[0].handle, "| product_collections count:", cData[0].product_collections?.length);
  }

  console.log("\n3. Testing blog_posts table select...");
  const { data: bData, error: bError, count: bCount } = await supabaseAdmin
    .from("blog_posts")
    .select("*", { count: "exact" })
    .limit(3);

  console.log("Blog posts query error:", bError);
  console.log("Blog posts total count in DB:", bCount);
  console.log("Blog posts sample fetched:", bData?.length);
  if (bData && bData.length > 0) {
    console.log("Sample blog post title:", bData[0].title, "| handle:", bData[0].handle);
  }

  console.log("\n4. Testing floor_plans table select...");
  const { data: fData, error: fError, count: fCount } = await supabaseAdmin
    .from("floor_plans")
    .select("*", { count: "exact" })
    .limit(3);

  console.log("Floor plans query error:", fError);
  console.log("Floor plans total count in DB:", fCount);
  console.log("Floor plans sample fetched:", fData?.length);

  console.log("\n5. Testing pages table select...");
  const { data: pgData, error: pgError, count: pgCount } = await supabaseAdmin
    .from("pages")
    .select("*", { count: "exact" })
    .limit(3);

  console.log("Pages query error:", pgError);
  console.log("Pages total count in DB:", pgCount);
  console.log("Pages sample fetched:", pgData?.length);

  console.log("\n6. Testing redirects table select...");
  const { data: rData, error: rError, count: rCount } = await supabaseAdmin
    .from("redirects")
    .select("*", { count: "exact" })
    .limit(3);

  console.log("Redirects query error:", rError);
  console.log("Redirects total count in DB:", rCount);
}

debug();
