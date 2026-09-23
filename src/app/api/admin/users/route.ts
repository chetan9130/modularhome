import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole, hashPassword } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

export async function GET() {
  const authResult = await requireAdminRole(["SUPER_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (isSupabaseConfigured()) {
      const { data: users, error } = await supabaseAdmin
        .from("admin_users")
        .select("id, email, name, role, status, last_login_at, two_factor_enabled, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: users || [],
      });
    }

    return NextResponse.json({
      success: true,
      data: [
        {
          id: authResult.id,
          email: authResult.email,
          name: authResult.name,
          role: authResult.role || "SUPER_ADMIN",
          status: "ACTIVE",
          two_factor_enabled: false,
          created_at: new Date().toISOString(),
        },
      ],
    });
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch users.", code: "DB_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { name, email, password, role, status } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Name, email and password are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await hashPassword(password);
    const validRole = ["SUPER_ADMIN", "CONTENT_ADMIN", "SALES"].includes(role) ? role : "CONTENT_ADMIN";

    if (isSupabaseConfigured()) {
      const { data: newUser, error } = await supabaseAdmin
        .from("admin_users")
        .insert({
          name,
          email: normalizedEmail,
          password_hash: passwordHash,
          role: validRole,
          status: status || "ACTIVE",
          two_factor_enabled: false,
        })
        .select("id, email, name, role, status, created_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { success: false, error: { message: "A user with this email already exists.", code: "DUPLICATE_EMAIL" } },
            { status: 400 }
          );
        }
        throw error;
      }

      await logAdminActivity(
        authResult,
        "USER_CREATED",
        "admin_users",
        newUser.id,
        `Created admin user ${newUser.email} with role ${newUser.role}`,
        { name, email: normalizedEmail, role: validRole }
      );

      return NextResponse.json({
        success: true,
        data: newUser,
        message: "Admin user created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: `usr_${Date.now()}`, name, email: normalizedEmail, role: validRole, status: "ACTIVE" },
      message: "Admin user created (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create user.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
