import { NextRequest, NextResponse } from "next/server";
import { runAutoBlogSync } from "@/lib/autoBlogSync";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const result = await runAutoBlogSync({ force });

    return NextResponse.json({
      executedAt: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Auto blog sync endpoint error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
