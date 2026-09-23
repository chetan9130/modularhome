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
