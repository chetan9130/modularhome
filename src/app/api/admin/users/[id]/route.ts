import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole, hashPassword, invalidateAllUserSessions } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRole(["SUPER_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, role, status, password, disable2FA } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (role !== undefined && ["SUPER_ADMIN", "CONTENT_ADMIN", "SALES"].includes(role)) {
      updates.role = role;
    }
    if (status !== undefined && ["ACTIVE", "INACTIVE"].includes(status)) {
      updates.status = status;
    }
    if (password && password.trim()) {
      updates.password_hash = await hashPassword(password);
      // Invalidate existing sessions on password change
      await invalidateAllUserSessions(id);
    }
    if (disable2FA) {
      updates.two_factor_enabled = false;
      updates.two_factor_secret = null;
      updates.two_factor_recovery_codes = [];
    }

    if (isSupabaseConfigured() && id !== "admin-root") {
      const { data: updated, error } = await supabaseAdmin
        .from("admin_users")
        .update(updates)
        .eq("id", id)
        .select("id, email, name, role, status, two_factor_enabled, updated_at")
        .single();

      if (error) throw error;

      await logAdminActivity(
        authResult,
        "USER_UPDATED",
        "admin_users",
        id,
        `Updated admin user profile: ${updated?.email || id}`,
        { updates: Object.keys(updates) }
      );

      return NextResponse.json({
        success: true,
        data: updated,
        message: "User updated successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id, ...updates },
      message: "User updated (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to update user.", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminRole(["SUPER_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    // Prevent deleting own account
    if (authResult.id === id) {
      return NextResponse.json(
        { success: false, error: { message: "You cannot delete your own account.", code: "SELF_DELETION" } },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && id !== "admin-root") {
      await invalidateAllUserSessions(id);
      const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", id);
      if (error) throw error;
    }

    await logAdminActivity(
      authResult,
      "USER_DELETED",
      "admin_users",
      id,
      `Deleted admin user ${id}`
    );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to delete user.", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
}
