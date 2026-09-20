import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getPublicGlobalSettings } from "@/lib/settings";

export async function GET() {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (!isSupabaseConfigured()) {
      const defaultSettings = await getPublicGlobalSettings();
      return NextResponse.json({
        success: true,
        data: defaultSettings,
      });
    }

    const { data: settings, error } = await supabaseAdmin
      .from("global_settings")
      .select("*")
      .eq("key", "default")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!settings) {
      const defaultSettings = await getPublicGlobalSettings();
      return NextResponse.json({
        success: true,
        data: defaultSettings,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Error fetching global settings:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to retrieve settings.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();

    const parseJson = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    const updatePayload: Record<string, any> = {
      key: "default",
      updated_at: new Date().toISOString(),
    };

    if (body.companyName !== undefined) updatePayload.company_name = body.companyName;
    if (body.company_name !== undefined) updatePayload.company_name = body.company_name;
    if (body.logoUrl !== undefined) updatePayload.logo_url = body.logoUrl;
    if (body.logo_url !== undefined) updatePayload.logo_url = body.logo_url;
    if (body.faviconUrl !== undefined) updatePayload.favicon_url = body.faviconUrl;
    if (body.favicon_url !== undefined) updatePayload.favicon_url = body.favicon_url;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.address !== undefined) updatePayload.address = body.address;
    if (body.socialLinks !== undefined) updatePayload.social_links = parseJson(body.socialLinks);
    if (body.social_links !== undefined) updatePayload.social_links = parseJson(body.social_links);
    if (body.announcementEnabled !== undefined) updatePayload.announcement_enabled = !!body.announcementEnabled;
    if (body.announcement_enabled !== undefined) updatePayload.announcement_enabled = !!body.announcement_enabled;
    if (body.announcementText !== undefined) updatePayload.announcement_text = body.announcementText;
    if (body.announcement_text !== undefined) updatePayload.announcement_text = body.announcement_text;
    if (body.announcementLink !== undefined) updatePayload.announcement_link = body.announcementLink;
    if (body.announcement_link !== undefined) updatePayload.announcement_link = body.announcement_link;
    if (body.navLinks !== undefined) updatePayload.nav_links = parseJson(body.navLinks);
    if (body.nav_links !== undefined) updatePayload.nav_links = parseJson(body.nav_links);
    if (body.footerText !== undefined) updatePayload.footer_text = body.footerText;
    if (body.footer_text !== undefined) updatePayload.footer_text = body.footer_text;
    if (body.footerLinks !== undefined) updatePayload.footer_links = parseJson(body.footerLinks);
    if (body.footer_links !== undefined) updatePayload.footer_links = parseJson(body.footer_links);
    if (body.defaultSeoTitle !== undefined) updatePayload.default_seo_title = body.defaultSeoTitle;
    if (body.default_seo_title !== undefined) updatePayload.default_seo_title = body.default_seo_title;
    if (body.defaultMetaDescription !== undefined) updatePayload.default_meta_description = body.defaultMetaDescription;
    if (body.default_meta_description !== undefined) updatePayload.default_meta_description = body.default_meta_description;
    if (body.ctaLabel !== undefined) updatePayload.cta_label = body.ctaLabel;
    if (body.cta_label !== undefined) updatePayload.cta_label = body.cta_label;
    if (body.ctaLink !== undefined) updatePayload.cta_link = body.ctaLink;
    if (body.cta_link !== undefined) updatePayload.cta_link = body.cta_link;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("global_settings")
        .upsert(updatePayload, { onConflict: "key" })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: "Global settings updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: updatePayload,
      message: "Global settings updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating global settings:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update global settings.", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}
