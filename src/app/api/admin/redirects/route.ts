import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

let memoryRedirects: any[] = [
  {
    id: "red-1",
    source_path: "/collections/all",
    target_path: "/buildings",
    status_code: 301,
    is_active: true,
    notes: "Legacy Shopify all collections URL",
    created_at: new Date().toISOString(),
  },
  {
    id: "red-2",
    source_path: "/catalog",
    target_path: "/buildings",
    status_code: 301,
    is_active: true,
    notes: "Legacy catalog URL",
    created_at: new Date().toISOString(),
  },
  {
    id: "red-3",
    source_path: "/floorplans",
    target_path: "/floor-plans",
    status_code: 301,
    is_active: true,
    notes: "Shopify unhyphenated floorplans link",
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("redirects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    return NextResponse.json({ success: true, data: memoryRedirects });
  } catch (error: any) {
    console.error("Error fetching redirects:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch redirects.", code: "REDIRECTS_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { sourcePath, targetPath, statusCode, isActive, notes } = body;

    if (!sourcePath || !targetPath) {
      return NextResponse.json(
        { success: false, error: { message: "Source path and target path are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const cleanSource = sourcePath.startsWith("/") ? sourcePath : `/${sourcePath}`;
    const cleanTarget = targetPath.startsWith("/") || targetPath.startsWith("http") ? targetPath : `/${targetPath}`;

    const newRedirect = {
      source_path: cleanSource,
      target_path: cleanTarget,
      status_code: Number(statusCode) || 301,
      is_active: isActive !== undefined ? Boolean(isActive) : true,
      notes: notes || null,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("redirects")
        .insert(newRedirect)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { success: false, error: { message: "A redirect rule for this source path already exists.", code: "DUPLICATE_SOURCE" } },
            { status: 400 }
          );
        }
        throw error;
      }

      await logAdminActivity(
        authResult,
        "REDIRECT_CREATED",
        "redirects",
        data.id,
        `Created 301 redirect: ${cleanSource} -> ${cleanTarget}`
      );

      return NextResponse.json({
        success: true,
        data,
        message: "Redirect rule created successfully.",
      });
    }

    const mock = { id: `red_${Date.now()}`, ...newRedirect, created_at: new Date().toISOString() };
    memoryRedirects.unshift(mock);

    return NextResponse.json({
      success: true,
      data: mock,
      message: "Redirect created (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating redirect:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create redirect.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
