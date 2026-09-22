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

const SEED_LEADS: LeadItem[] = [
  {
    id: "lead-1001",
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    phone: "+1 (512) 844-9120",
    location: "Austin, TX (ZIP: 78704)",
    zip: "78704",
    enquiry_details: "[Interest: Barndominiums] Looking for a 3-bedroom, 2,400 sq ft steel barndominium with a 2-car integrated workshop garage. Land is already cleared and foundation permit in progress.",
    source: "CONTACT_FORM",
    status: "NEW",
    notes: "High priority lead. Requested architectural drawings & steel framing specs.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "lead-1002",
    name: "Eleanor Wright",
    email: "ewright.design@gmail.com",
    phone: "+1 (317) 620-4491",
    location: "Bloomington, IN (ZIP: 47401)",
    zip: "47401",
    enquiry_details: "Quote Request: Modern Alpine Cabin (1,200 sq ft) - Est: $148,000 - Notes: Inquiring about crane logistics and state certified energy envelope.",
    source: "QUOTE_WIZARD",
    status: "QUALIFIED",
    notes: "Site visit scheduled for next week with regional builder partner.",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "lead-1003",
    name: "David Sterling",
    email: "dsterling@sterlingproperties.org",
    phone: "+1 (916) 773-8822",
    location: "Sacramento, CA (ZIP: 95814)",
    zip: "95814",
    enquiry_details: "Inquiring about 4x ADU / Tiny Home units for multi-family residential parcel development.",
    source: "WEBSITE",
    status: "CONTACTED",
    notes: "Sent developer multi-unit catalog & engineering compliance packet.",
    created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
  {
    id: "lead-1004",
    name: "Sarah Jenkins",
    email: "sjenkins@gmail.com",
    phone: "+1 (407) 912-3345",
    location: "Orlando, FL (ZIP: 32801)",
    zip: "32801",
    enquiry_details: "Subscribed to modular housing newsletter and updates.",
    source: "NEWSLETTER",
    status: "NEW",
    notes: "Auto-subscribed from website footer.",
    created_at: new Date(Date.now() - 3600000 * 70).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 70).toISOString(),
  },
];

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
