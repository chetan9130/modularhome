import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { AdminSessionUser } from "./auth";

export interface ActivityLogEntry {
  id?: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// In-memory activity log store fallback
const memoryActivityLogs: ActivityLogEntry[] = [];

/**
 * Records an admin activity event
 */
export async function logAdminActivity(
  user: AdminSessionUser | null,
  action: string,
  entityType: string,
  entityId: string | undefined,
  description: string,
  details: Record<string, any> = {},
  ip: string = "system",
  userAgent: string = ""
): Promise<void> {
  const logEntry: ActivityLogEntry = {
    user_id: user?.id,
    user_name: user?.name || "System / Guest",
    user_role: user?.role || "SYSTEM",
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
    details,
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date().toISOString(),
  };

  memoryActivityLogs.unshift(logEntry);
  if (memoryActivityLogs.length > 500) {
    memoryActivityLogs.pop();
  }

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from("activity_logs").insert({
        user_id: user?.id && user.id !== "admin-root" ? user.id : null,
        user_name: user?.name || "Admin Superuser",
        user_role: user?.role || "SUPER_ADMIN",
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        description,
        details,
        ip_address: ip,
        user_agent: userAgent,
      });
    } catch (e) {
      console.warn("Could not insert activity log to Supabase:", e);
    }
  }
}

export interface LogActivityParams {
  user?: AdminSessionUser | null;
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  entityType?: string;
  entity_type?: string;
  entityId?: string;
  entity_id?: string;
  description?: string;
  details?: Record<string, any>;
  ip?: string;
  ip_address?: string;
  userAgent?: string;
  user_agent?: string;
}

/**
 * Universal flexible activity logging helper supporting both object options and positional arguments
 */
export async function logActivity(
  arg1: AdminSessionUser | null | LogActivityParams,
  action?: string,
  entityType?: string,
  entityId?: string,
  description?: string,
  details: Record<string, any> = {},
  ip: string = "system",
  userAgent: string = ""
): Promise<void> {
  // If first parameter is an options object
  if (arg1 && typeof arg1 === "object" && !("email" in arg1 && "role" in arg1 && "name" in arg1 && !("action" in arg1))) {
    const opts = arg1 as LogActivityParams;
    const user: AdminSessionUser | null = opts.user || (opts.adminId || opts.user_id ? {
      id: opts.adminId || opts.user_id || "",
      email: opts.adminEmail || "",
      name: opts.adminName || opts.user_name || "Admin",
      role: opts.user_role || "SUPER_ADMIN",
    } : null);

    return logAdminActivity(
      user,
      opts.action || "ACTION",
      opts.entityType || opts.entity_type || "SYSTEM",
      opts.entityId || opts.entity_id,
      opts.description || opts.action || "",
      opts.details || {},
      opts.ip || opts.ip_address || "system",
      opts.userAgent || opts.user_agent || ""
    );
  }

  // Positional fallback
  return logAdminActivity(
    arg1 as AdminSessionUser | null,
    action || "ACTION",
    entityType || "SYSTEM",
    entityId,
    description || action || "",
    details,
    ip,
    userAgent
  );
}

/**
 * Retrieves recent activity logs with optional filters
 */
export async function getActivityLogs(params?: {
  limit?: number;
  entityType?: string;
  action?: string;
  userId?: string;
}): Promise<ActivityLogEntry[]> {
  const limit = params?.limit || 50;

  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (params?.entityType) query = query.eq("entity_type", params.entityType);
      if (params?.action) query = query.eq("action", params.action);
      if (params?.userId) query = query.eq("user_id", params.userId);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Could not retrieve activity logs from Supabase:", e);
    }
  }

  return memoryActivityLogs.slice(0, limit);
}
