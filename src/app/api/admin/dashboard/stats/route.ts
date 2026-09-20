import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          metrics: {
            totalProducts: 10,
            totalCollections: 3,
            totalPages: 1,
            publishedBlogs: 1,
            draftBlogs: 0,
            totalLeads: 0,
            newLeads: 0,
            totalQuotations: 0,
            pendingQuotations: 0,
          },
          recentLeads: [],
          recentQuotations: [],
        },
      });
    }

    const [
      { count: totalProducts },
      { count: totalCollections },
      { count: totalPages },
      { data: blogs },
      { data: leads, count: totalLeads },
      { data: quotations, count: totalQuotations },
    ] = await Promise.all([
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("collections").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("pages").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("blogs").select("status"),
      supabaseAdmin.from("leads").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("quotations").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
    ]);

    const publishedBlogs = (blogs || []).filter((b) => b.status === "PUBLISHED").length;
    const draftBlogs = (blogs || []).filter((b) => b.status !== "PUBLISHED").length;

    const { count: newLeadsCount } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "NEW");

    const { count: pendingQuotesCount } = await supabaseAdmin
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING");

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalProducts: totalProducts || 0,
          totalCollections: totalCollections || 0,
          totalPages: totalPages || 0,
          publishedBlogs,
          draftBlogs,
          totalLeads: totalLeads || 0,
          newLeads: newLeadsCount || 0,
          totalQuotations: totalQuotations || 0,
          pendingQuotations: pendingQuotesCount || 0,
        },
        recentLeads: leads || [],
        recentQuotations: quotations || [],
      },
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to retrieve dashboard stats.", code: "STATS_ERROR" } },
      { status: 500 }
    );
  }
}
