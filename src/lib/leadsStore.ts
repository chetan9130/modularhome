import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const LEADS_FILE = path.join(DATA_DIR, "custom_leads.json");

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  zip?: string | null;
  enquiry_details?: string | null;
  source: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "QUOTE_SENT" | "FOLLOW_UP" | "WON" | "LOST";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

const SEED_LEADS: LeadItem[] = [];

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Error creating data directory:", err);
  }
}

export function readLeadsFromStore(): LeadItem[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(SEED_LEADS, null, 2), "utf-8");
      return SEED_LEADS;
    }
    const data = fs.readFileSync(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(SEED_LEADS, null, 2), "utf-8");
      return SEED_LEADS;
    }
    return parsed;
  } catch (error) {
    console.error("Error reading custom_leads.json:", error);
    return SEED_LEADS;
  }
}

export function writeLeadsToStore(leads: LeadItem[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to custom_leads.json:", error);
  }
}

export function saveLead(lead: Partial<LeadItem> & { email: string; name: string }): LeadItem {
  const leads = readLeadsFromStore();
  const now = new Date().toISOString();

  const newLead: LeadItem = {
    id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: lead.name,
    email: lead.email.toLowerCase().trim(),
    phone: lead.phone || null,
    location: lead.location || (lead.zip ? `ZIP: ${lead.zip}` : null),
    zip: lead.zip || null,
    enquiry_details: lead.enquiry_details || null,
    source: lead.source || "WEBSITE",
    status: lead.status || "NEW",
    notes: lead.notes || null,
    created_at: lead.created_at || now,
    updated_at: now,
  };

  const existingIdx = leads.findIndex((l) => l.id === newLead.id);
  if (existingIdx >= 0) {
    leads[existingIdx] = { ...leads[existingIdx], ...newLead };
  } else {
    leads.unshift(newLead);
  }

  writeLeadsToStore(leads);
  return newLead;
}

export function updateLead(id: string, updates: Partial<LeadItem>): LeadItem | null {
  const leads = readLeadsFromStore();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;

  const updated: LeadItem = {
    ...leads[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  leads[idx] = updated;
  writeLeadsToStore(leads);
  return updated;
}

export function deleteLead(id: string): boolean {
  const leads = readLeadsFromStore();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length !== leads.length) {
    writeLeadsToStore(filtered);
    return true;
  }
  return false;
}

export function getLeadStats() {
  const leads = readLeadsFromStore();
  const total = leads.length;
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const qualified = leads.filter((l) => l.status === "QUALIFIED").length;
  const won = leads.filter((l) => l.status === "WON").length;

  return {
    total,
    newLeads,
    qualified,
    won,
    recent: leads.slice(0, 5),
  };
}
