import "dotenv/config";
import { supabaseAdmin } from "../../src/lib/supabase";

async function check() {
  const { data: media, error: mErr } = await supabaseAdmin.from("product_media").select("*").limit(3);
  console.log("Sample product_media rows:", media, "error:", mErr);

  const { data: vars, error: vErr } = await supabaseAdmin.from("product_variants").select("*").limit(3);
  console.log("Sample product_variants rows:", vars, "error:", vErr);
}

check();
