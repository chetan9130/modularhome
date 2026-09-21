import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/publicData";

export async function GET() {
  try {
    const settings = await getPublicSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
