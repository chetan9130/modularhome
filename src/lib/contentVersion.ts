import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { AdminSessionUser } from "./auth";

export interface ContentVersion {
  id?: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  data: Record<string, any>;
  created_by?: string;
  creator_name?: string;
  notes?: string;
  created_at?: string;
}

// In-memory versions store fallback
const memoryVersions: ContentVersion[] = [];

/**
 * Saves a version snapshot of an entity
 */
export async function saveContentVersion(
  entityType: string,
  entityId: string,
  data: Record<string, any>,
  user: AdminSessionUser | null,
  notes?: string
): Promise<number> {
  let nextVersionNumber = 1;

  if (isSupabaseConfigured()) {
    try {
      const { data: latest } = await supabaseAdmin
        .from("content_versions")
        .select("version_number")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      if (latest && latest.version_number) {
        nextVersionNumber = latest.version_number + 1;
      }

      await supabaseAdmin.from("content_versions").insert({
        entity_type: entityType,
        entity_id: entityId,
        version_number: nextVersionNumber,
        data,
        created_by: user?.id && user.id !== "admin-root" ? user.id : null,
        creator_name: user?.name || "Admin",
        notes: notes || `Revision #${nextVersionNumber}`,
      });

      return nextVersionNumber;
    } catch (e) {
      console.warn("Could not save content version to Supabase:", e);
    }
  }

  // Memory fallback
  const existing = memoryVersions.filter(
    (v) => v.entity_type === entityType && v.entity_id === entityId
  );
  nextVersionNumber = existing.length + 1;
  memoryVersions.unshift({
    entity_type: entityType,
    entity_id: entityId,
    version_number: nextVersionNumber,
    data,
    created_by: user?.id,
    creator_name: user?.name || "Admin",
    notes: notes || `Revision #${nextVersionNumber}`,
    created_at: new Date().toISOString(),
  });

  return nextVersionNumber;
}

/**
 * Gets revision history for an entity
 */
export async function getContentVersions(
  entityType: string,
  entityId: string
): Promise<ContentVersion[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("content_versions")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("version_number", { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn("Could not load content versions from Supabase:", e);
    }
  }

  return memoryVersions.filter(
    (v) => v.entity_type === entityType && v.entity_id === entityId
  );
}

/**
 * Gets a specific version data
 */
export async function getContentVersion(
  versionId: string
): Promise<ContentVersion | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from("content_versions")
        .select("*")
        .eq("id", versionId)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn("Could not load specific content version from Supabase:", e);
    }
  }

  return memoryVersions.find((v) => v.id === versionId) || null;
}
