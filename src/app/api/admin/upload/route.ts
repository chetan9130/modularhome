import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: "No file provided in request." } },
        { status: 400 }
      );
    }

    // MIME type check
    const fileType = file.type || "application/octet-stream";
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";

    if (!ALLOWED_MIME_TYPES.has(fileType) && !["jpg", "jpeg", "png", "webp", "avif", "svg", "pdf", "zip", "ico"].includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `File type '${fileType}' is not supported. Please upload an image, PDF, or ZIP package.` },
        },
        { status: 400 }
      );
    }

    // Size limit check (30MB max)
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: { message: "File exceeds the 30MB maximum upload size limit." } },
        { status: 400 }
      );
    }

    // Sanitize folder and filename
    const cleanFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, "").replace(/^\/+|\/+$/g, "");
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 50);
    const uniqueFileName = `${cleanFolder ? `${cleanFolder}/` : ""}${baseName}-${Date.now()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage 'media' bucket
    const client = supabaseAdmin || supabase;
    const { data, error } = await client.storage
      .from("media")
      .upload(uniqueFileName, buffer, {
        contentType: fileType,
        upsert: true,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return NextResponse.json(
        { success: false, error: { message: error.message || "Failed to upload file to storage." } },
        { status: 500 }
      );
    }

    // Generate public URL
    const { data: publicUrlData } = client.storage
      .from("media")
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
      fileName: file.name,
      size: file.size,
      mimeType: fileType,
    });
  } catch (err: any) {
    console.error("Admin upload API exception:", err);
    return NextResponse.json(
      { success: false, error: { message: err.message || "Internal server error during upload." } },
      { status: 500 }
    );
  }
}
