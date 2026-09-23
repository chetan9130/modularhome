import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { getContentVersions, getContentVersion } from "@/lib/contentVersion";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: { message: "entityType and entityId are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const versions = await getContentVersions(entityType, entityId);

    return NextResponse.json({
      success: true,
      data: versions,
    });
  } catch (error: any) {
    console.error("Error fetching content versions:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch versions.", code: "VERSION_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { success: false, error: { message: "versionId is required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const version = await getContentVersion(versionId);
    if (!version) {
      return NextResponse.json(
        { success: false, error: { message: "Version not found.", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    // Restore to Supabase table based on entity_type
    if (isSupabaseConfigured()) {
      const allowedTables = ["pages", "products", "collections", "blogs", "global_settings"];
      if (allowedTables.includes(version.entity_type)) {
        await supabaseAdmin
          .from(version.entity_type)
          .update({ ...version.data, updated_at: new Date().toISOString() })
          .eq(version.entity_type === "global_settings" ? "key" : "id", version.entity_id);
      }
    }

    await logAdminActivity(
      authResult,
      "VERSION_RESTORED",
      version.entity_type,
      version.entity_id,
      `Restored ${version.entity_type} to revision #${version.version_number}`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to Revision #${version.version_number}`,
      data: version.data,
    });
  } catch (error: any) {
    console.error("Error restoring content version:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to restore version.", code: "RESTORE_ERROR" } },
      { status: 500 }
    );
  }
}
