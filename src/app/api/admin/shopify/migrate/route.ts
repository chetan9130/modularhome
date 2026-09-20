import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { ShopifyClient } from "@/lib/shopify/client";
import { ShopifyMigrator } from "@/lib/shopify/migration";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  const client = new ShopifyClient();
  return NextResponse.json({
    success: true,
    isConfigured: client.isConfigured(),
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || null,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    let body = {};
    try {
      body = await request.json();
    } catch {}

    const { storeDomain, accessToken } = body as {
      storeDomain?: string;
      accessToken?: string;
    };

    const client = new ShopifyClient({
      storeDomain: storeDomain || undefined,
      accessToken: accessToken || undefined,
    });

    const migrator = new ShopifyMigrator(client);
    const result = await migrator.runFullMigration();

    return NextResponse.json({
      success: true,
      data: result,
      message: "Shopify migration run completed.",
    });
  } catch (error: any) {
    console.error("Shopify migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || "Failed to execute Shopify migration.",
          code: "MIGRATION_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
