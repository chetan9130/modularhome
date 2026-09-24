import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logActivity } from "@/lib/activityLog";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "orders"; // 'orders', 'sales', 'downloads'

    if (reportType === "orders") {
      let orders: any[] = [];
      if (isSupabaseConfigured()) {
        const { data } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(title, price, quantity)")
          .order("created_at", { ascending: false });
        if (data) orders = data;
      }

      const headers = [
        "Order Number",
        "Date",
        "Customer Name",
        "Customer Email",
        "Total Amount (USD)",
        "Payment Status",
        "Order Status",
        "Payment ID",
        "Items Count",
        "Blueprint Titles",
      ];

      const rows = orders.map((o) => {
        const titles = (o.order_items || []).map((i: any) => i.title).join("; ");
        return [
          `"${o.order_number}"`,
          `"${new Date(o.created_at).toISOString()}"`,
          `"${(o.customer_name || "").replace(/"/g, '""')}"`,
          `"${o.customer_email}"`,
          Number(o.total_amount || 0).toFixed(2),
          `"${o.payment_status}"`,
          `"${o.order_status}"`,
          `"${o.payment_id || ""}"`,
          o.order_items?.length || 1,
          `"${titles.replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");

      await logActivity({
        user_id: authResult.id,
        user_name: authResult.name,
        user_role: authResult.role,
        action: "EXPORT_ORDERS_REPORT",
        entity_type: "orders",
        description: `Exported ${orders.length} orders to CSV`,
      });

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="modularhome-orders-register-${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (reportType === "downloads") {
      let downloads: any[] = [];
      if (isSupabaseConfigured()) {
        const { data } = await supabaseAdmin
          .from("download_access")
          .select("*, orders(order_number, customer_name, customer_email)")
          .order("created_at", { ascending: false });
        if (data) downloads = data;
      }

      const headers = [
        "Download Token",
        "Customer Email",
        "Order Number",
        "File Path",
        "Download Count",
        "Max Allowed",
        "Expires At",
        "Created At",
      ];

      const rows = downloads.map((d) => [
        `"${d.download_token}"`,
        `"${d.customer_email}"`,
        `"${d.orders?.order_number || ""}"`,
        `"${d.file_path || ""}"`,
        d.download_count || 0,
        d.max_downloads || 5,
        `"${d.expires_at}"`,
        `"${d.created_at}"`,
      ].join(","));

      const csvContent = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="modularhome-download-activity-${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: { message: `Unknown export type: ${reportType}` } },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Export failed." } },
      { status: 500 }
    );
  }
}
