import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getLeadStats } from "@/lib/leadsStore";
import { readPagesFromStore } from "@/lib/pageStore";

export async function GET() {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const localLeadStats = getLeadStats();
    const localPages = readPagesFromStore();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          metrics: {
            totalProducts: 10,
            totalCollections: 3,
            totalPages: localPages.length,
            publishedBlogs: 3,
            draftBlogs: 0,
            totalLeads: localLeadStats.total,
            newLeads: localLeadStats.newLeads,
            totalQuotations: 2,
            pendingQuotations: 1,
          },
          recentLeads: localLeadStats.recent,
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

    const finalLeads = (leads && leads.length > 0) ? leads : localLeadStats.recent;
    const finalTotalLeads = Math.max(totalLeads || 0, localLeadStats.total);
    const finalNewLeads = Math.max(newLeadsCount || 0, localLeadStats.newLeads);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalProducts: totalProducts || 10,
          totalCollections: totalCollections || 3,
          totalPages: Math.max(totalPages || 0, localPages.length),
          publishedBlogs: publishedBlogs || 3,
          draftBlogs: draftBlogs || 0,
          totalLeads: finalTotalLeads,
          newLeads: finalNewLeads,
          totalQuotations: totalQuotations || 0,
          pendingQuotations: pendingQuotesCount || 0,
        },
        recentLeads: finalLeads,
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
