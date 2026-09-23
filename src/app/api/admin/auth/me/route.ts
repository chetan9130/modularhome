import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  let twoFactorEnabled = false;

  if (isSupabaseConfigured() && authResult.id && authResult.id !== "admin-root") {
    try {
      const { data } = await supabaseAdmin
        .from("admin_users")
        .select("two_factor_enabled, role")
        .eq("id", authResult.id)
        .single();

      if (data) {
        twoFactorEnabled = Boolean(data.two_factor_enabled);
      }
    } catch {}
  }

  const enhancedUser = {
    ...authResult,
    twoFactorEnabled,
  };

  return NextResponse.json({
    success: true,
    user: enhancedUser,
    data: enhancedUser,
  });
}

