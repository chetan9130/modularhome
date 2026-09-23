import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

// In-memory fallback for local media assets
const memoryMediaAssets: any[] = [
  {
    id: "med-1",
    filename: "finallogo.avif",
    file_path: "/finallogo.avif",
    public_url: "/finallogo.avif",
    mime_type: "image/avif",
    file_size: 45000,
    alt_text: "ModularHome Official Brand Logo",
    created_at: new Date().toISOString(),
  },
  {
    id: "med-2",
    filename: "the-aspen-exterior.jpg",
    file_path: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    public_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    mime_type: "image/jpeg",
    file_size: 184000,
    alt_text: "The Aspen Exterior Front Rendering",
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const mimeType = searchParams.get("mimeType");
    const search = searchParams.get("search");

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (mimeType && mimeType !== "ALL") {
        query = query.ilike("mime_type", `%${mimeType}%`);
      }
      if (search) {
        query = query.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    let filtered = [...memoryMediaAssets];
    if (search) {
      filtered = filtered.filter((m) =>
        m.filename.toLowerCase().includes(search.toLowerCase())
      );
    }
    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("Error fetching media assets:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch media assets.", code: "MEDIA_FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { filename, filePath, publicUrl, mimeType, fileSize, width, height, altText } = body;

    if (!publicUrl || !filename) {
      return NextResponse.json(
        { success: false, error: { message: "filename and publicUrl are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const newAsset = {
      filename,
      file_path: filePath || publicUrl,
      public_url: publicUrl,
      mime_type: mimeType || "image/jpeg",
      file_size: fileSize || null,
      width: width || null,
      height: height || null,
      alt_text: altText || filename,
      uploaded_by: authResult.id && authResult.id !== "admin-root" ? authResult.id : null,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("media_assets")
        .insert(newAsset)
        .select()
        .single();

      if (error) throw error;

      await logAdminActivity(
        authResult,
        "MEDIA_UPLOADED",
        "media_assets",
        data?.id,
        `Uploaded media asset: ${filename}`
      );

      return NextResponse.json({
        success: true,
        data,
        message: "Media asset registered successfully.",
      });
    }

    const mockCreated = { id: `med_${Date.now()}`, ...newAsset, created_at: new Date().toISOString() };
    memoryMediaAssets.unshift(mockCreated);

    return NextResponse.json({
      success: true,
      data: mockCreated,
      message: "Media asset saved (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating media asset:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to save media asset.", code: "MEDIA_CREATE_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Media ID required.", code: "ID_REQUIRED" } },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      await supabaseAdmin.from("media_assets").delete().eq("id", id);
    }

    const idx = memoryMediaAssets.findIndex((m) => m.id === id);
    if (idx !== -1) memoryMediaAssets.splice(idx, 1);

    await logAdminActivity(
      authResult,
      "MEDIA_DELETED",
      "media_assets",
      id,
      `Deleted media asset ID: ${id}`
    );

    return NextResponse.json({
      success: true,
      message: "Media asset deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting media asset:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete media asset.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
