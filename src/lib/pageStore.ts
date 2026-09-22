import fs from "fs";
import path from "path";
import { CmsPage, PageSection } from "./publicData";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const PAGES_FILE = path.join(DATA_DIR, "custom_pages.json");
const SECTIONS_FILE = path.join(DATA_DIR, "custom_sections.json");

export function isUuidString(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

const SEED_PAGES: CmsPage[] = [
  {
    id: "page-new-home",
    title: "New Home",
    slug: "new-home",
    subtitle: "Discover our newest modular and prefabricated custom homes",
    content: `<h2>Welcome to Our New Modular Home Designs</h2>
<p>Explore cutting-edge floor plans, energy-efficient steel framing, and precision manufacturing engineered for modern living.</p>
<h3>Key Features</h3>
<ul>
  <li><strong>Precision Steel Framing:</strong> Zero warping, mold-proof, and engineered for high wind zones.</li>
  <li><strong>Turnkey Rapid Delivery:</strong> Factory-built in 4-8 weeks and assembled on your foundation.</li>
  <li><strong>Customizable Layouts:</strong> Choose your bedrooms, bathrooms, exterior siding, and luxury finishes.</li>
</ul>`,
    status: "PUBLISHED",
    featuredImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    seoTitle: "New Home | ModularHome.com",
    metaDescription: "Explore our newest modular home designs, modern floor plans, and rapid prefab delivery.",
    sections: [
      {
        id: "sec-new-home-trust",
        pageId: "page-new-home",
        type: "TRUST",
        title: "Why Choose Our New Home Series",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "sec-new-home-cta",
        pageId: "page-new-home",
        type: "CTA",
        title: "Ready to Build Your New Home?",
        subtitle: "Get a free itemized quote or consult with our architectural design team.",
        displayOrder: 2,
        isVisible: true,
      }
    ]
  },
  {
    id: "page-warranty",
    title: "Warranty & Engineering Certifications",
    slug: "warranty-certifications",
    subtitle: "Comprehensive 50-Year Structural Steel & 10-Year Weatherproofing Guarantee",
    content: `<h2>50-Year Structural Warranty</h2>
<p>Every ModularHome structure is built with precision cold-formed galvanized steel trusses and framing members engineered to withstand hurricane winds (up to 150 MPH) and extreme snow loads (up to 50 PSF). Our structural frames are guaranteed against rust-through, rot, warping, and seismic failure for 50 full years.</p>

<h3>What Is Covered</h3>
<ul>
  <li><strong>Structural Steel Frame:</strong> 50-year non-prorated structural integrity warranty.</li>
  <li><strong>Roofing & Thermal Envelope:</strong> 25-year manufacturer standing seam roof & weather barrier warranty.</li>
  <li><strong>Plumbing & Electrical:</strong> 10-year comprehensive factory installed systems warranty.</li>
  <li><strong>Interior Fixtures & Appliances:</strong> Full manufacturer warranties passed directly to the homeowner.</li>
</ul>

<h3>IBC & State Modular Certifications</h3>
<p>All plans and builds carry stamped state engineering approvals and comply with all applicable International Building Codes (IBC) and International Residential Codes (IRC).</p>`,
    status: "PUBLISHED",
    featuredImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1600&q=80",
    seoTitle: "Warranty & Engineering Certifications | ModularHome.com",
    metaDescription: "Learn about ModularHome.com's 50-year structural warranty, IBC engineering certifications, and quality standards.",
    sections: [
      {
        id: "sec-trust-1",
        pageId: "page-warranty",
        type: "TRUST",
        title: "Built For Generations",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "sec-how-1",
        pageId: "page-warranty",
        type: "HOW_IT_WORKS",
        title: "Our Precision Build Quality",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "sec-cta-1",
        pageId: "page-warranty",
        type: "CTA",
        title: "Ready to Build Your Certified Modular Home?",
        subtitle: "Speak with an architectural housing advisor today or get an instant engineering estimate.",
        displayOrder: 3,
        isVisible: true,
      }
    ]
  },
  {
    id: "page-privacy",
    title: "Privacy Policy",
    slug: "privacy-policy",
    subtitle: "How ModularHome.com collects, uses, and protects your information",
    content: `<h2>Your Privacy Matters</h2>
<p>At ModularHome.com, we respect your privacy and are committed to protecting your personal data. This privacy policy describes how we handle information collected on our website, quotation wizards, and consultation forms.</p>

<h3>Information We Collect</h3>
<p>We may collect personal details such as your name, email address, phone number, delivery ZIP code, and floor plan preferences when you request a custom price quote, upload blueprints, or contact our team.</p>

<h3>How We Use Your Information</h3>
<ul>
  <li>To generate accurate regional housing quotations and delivery estimates.</li>
  <li>To connect you with certified builders and logistics partners in your area.</li>
  <li>To provide customer support and project updates.</li>
</ul>

<p>We do not sell your personal information to third-party marketing companies.</p>`,
    status: "PUBLISHED",
    seoTitle: "Privacy Policy | ModularHome.com",
    metaDescription: "Read the ModularHome.com privacy policy to understand how we protect your personal and project information.",
  },
  {
    id: "page-terms",
    title: "Terms of Service",
    slug: "terms-of-service",
    subtitle: "Terms and conditions governing the use of ModularHome.com services and marketplace",
    content: `<h2>Terms of Use</h2>
<p>By accessing or using ModularHome.com, you agree to comply with and be bound by these terms of service.</p>

<h3>Modular Home Quotes & Estimates</h3>
<p>All pricing estimates provided by our online calculators and quotation tools are preliminary approximations based on standard site conditions. Final binding contracts are subject to local site inspection, foundation engineering, and local municipal zoning requirements.</p>

<h3>Architectural Plans & CAD Licensing</h3>
<p>Purchased floor plans and blueprints are licensed for single-structure construction unless a multi-use developer license is explicitly issued.</p>`,
    status: "PUBLISHED",
    seoTitle: "Terms of Service | ModularHome.com",
    metaDescription: "Terms of service and customer agreements for ModularHome.com.",
  }
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

export function readPagesFromStore(): CmsPage[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(PAGES_FILE)) {
      fs.writeFileSync(PAGES_FILE, JSON.stringify(SEED_PAGES, null, 2), "utf-8");
      return SEED_PAGES;
    }
    const data = fs.readFileSync(PAGES_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(PAGES_FILE, JSON.stringify(SEED_PAGES, null, 2), "utf-8");
      return SEED_PAGES;
    }
    return parsed;
  } catch (error) {
    console.error("Error reading custom_pages.json:", error);
    return SEED_PAGES;
  }
}

export function writePagesToStore(pages: CmsPage[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to custom_pages.json:", error);
  }
}

export function saveCustomPage(page: Partial<CmsPage> & { title: string; slug: string }): CmsPage {
  const pages = readPagesFromStore();
  const cleanSlug = page.slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
  const existingIdx = pages.findIndex(
    (p) => (page.id && p.id === page.id) || p.slug.toLowerCase() === cleanSlug
  );

  const now = new Date().toISOString();
  const fullPage: CmsPage = {
    id: page.id || (existingIdx >= 0 ? pages[existingIdx].id : `page_${Date.now()}`),
    title: page.title,
    slug: cleanSlug,
    subtitle: page.subtitle || "",
    content: page.content || "",
    status: page.status || "PUBLISHED",
    featuredImage: page.featuredImage || "",
    seoTitle: page.seoTitle || `${page.title} | ModularHome.com`,
    metaDescription: page.metaDescription || page.subtitle || "",
    canonicalUrl: page.canonicalUrl || "",
    createdAt: page.createdAt || (existingIdx >= 0 ? pages[existingIdx].createdAt : now),
    updatedAt: now,
    sections: page.sections || (existingIdx >= 0 ? pages[existingIdx].sections : []),
  };

  if (existingIdx >= 0) {
    pages[existingIdx] = { ...pages[existingIdx], ...fullPage };
  } else {
    pages.unshift(fullPage);
  }

  writePagesToStore(pages);
  return fullPage;
}

export function deleteCustomPage(idOrSlug: string): boolean {
  const pages = readPagesFromStore();
  const filtered = pages.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  if (filtered.length !== pages.length) {
    writePagesToStore(filtered);
    
    // Also delete associated sections
    const sections = readSectionsFromStore();
    const remainingSections = sections.filter(
      (s) => s.pageId !== idOrSlug && s.pageId !== `page-${idOrSlug}`
    );
    if (remainingSections.length !== sections.length) {
      writeSectionsToStore(remainingSections);
    }
    
    return true;
  }
  return false;
}

export function getCustomPageBySlug(slug: string): CmsPage | null {
  const clean = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, "");
  const pages = readPagesFromStore();
  const found = pages.find(
    (p) =>
      p.slug.toLowerCase() === clean ||
      p.id === clean ||
      p.slug.replace(/[^a-z0-9]/g, "") === clean.replace(/[^a-z0-9]/g, "")
  );

  if (!found) return null;

  // Attach sections from sections store or inline
  const sections = getPageSections(found.id || found.slug);
  found.sections = sections;

  return found;
}

export function readSectionsFromStore(): PageSection[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(SECTIONS_FILE)) {
      // Seed sections from initial pages if any
      const pages = readPagesFromStore();
      const initialSections: PageSection[] = [];
      for (const p of pages) {
        if (p.sections && Array.isArray(p.sections)) {
          for (const s of p.sections) {
            initialSections.push({
              ...s,
              pageId: s.pageId || p.id,
            });
          }
        }
      }
      fs.writeFileSync(SECTIONS_FILE, JSON.stringify(initialSections, null, 2), "utf-8");
      return initialSections;
    }
    const data = fs.readFileSync(SECTIONS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function writeSectionsToStore(sections: PageSection[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(SECTIONS_FILE, JSON.stringify(sections, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to custom_sections.json:", error);
  }
}

export function getPageSections(pageIdOrSlug: string): PageSection[] {
  if (!pageIdOrSlug) return [];
  const cleanKey = String(pageIdOrSlug).toLowerCase().trim().replace(/^\/+|\/+$/g, "");
  const allSections = readSectionsFromStore();
  const pages = readPagesFromStore();

  const matchedPage = pages.find(
    (p) =>
      p.id?.toLowerCase() === cleanKey ||
      p.slug?.toLowerCase() === cleanKey ||
      p.slug?.replace(/[^a-z0-9]/g, "") === cleanKey.replace(/[^a-z0-9]/g, "")
  );

  const targetKeys = new Set<string>();
  targetKeys.add(cleanKey);
  if (matchedPage) {
    if (matchedPage.id) targetKeys.add(matchedPage.id.toLowerCase());
    if (matchedPage.slug) targetKeys.add(matchedPage.slug.toLowerCase());
  }

  // Find matching sections from sections store
  const matchedSections: PageSection[] = allSections.filter((s) => {
    if (!s.pageId) return false;
    const sPageId = String(s.pageId).toLowerCase();
    return targetKeys.has(sPageId);
  });

  // Also include any inline sections from matched page if not already in store
  if (matchedPage?.sections && Array.isArray(matchedPage.sections)) {
    const existingIds = new Set(matchedSections.map((s) => s.id));
    for (const inSec of matchedPage.sections) {
      if (!existingIds.has(inSec.id)) {
        matchedSections.push({ ...inSec, pageId: matchedPage.id });
        existingIds.add(inSec.id);
      }
    }
  }

  return matchedSections.map((s, idx) => ({
    ...s,
    displayOrder: s.displayOrder !== undefined ? s.displayOrder : idx + 1,
    order: s.displayOrder !== undefined ? s.displayOrder : idx + 1,
    isVisible: s.isVisible !== false,
  })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export function getPageSectionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  const pages = readPagesFromStore();
  const allSections = readSectionsFromStore();

  for (const p of pages) {
    const pageId = p.id;
    const slug = p.slug;
    const targetKeys = new Set<string>();
    if (pageId) targetKeys.add(pageId.toLowerCase());
    if (slug) targetKeys.add(slug.toLowerCase());

    const inStoreCount = allSections.filter(
      (s) => s.pageId && targetKeys.has(String(s.pageId).toLowerCase())
    ).length;

    const inPageCount = p.sections && Array.isArray(p.sections) ? p.sections.length : 0;
    const count = Math.max(inStoreCount, inPageCount);

    if (pageId) counts[pageId] = count;
    if (slug) counts[slug] = count;
  }

  return counts;
}

export function saveSection(section: Partial<PageSection> & { pageId: string; type: string }): PageSection {
  const sections = readSectionsFromStore();
  const now = new Date().toISOString();
  
  const existingIdx = sections.findIndex((s) => section.id && s.id === section.id);
  
  const newSection: PageSection = {
    id: section.id || `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pageId: section.pageId,
    type: section.type.toUpperCase(),
    title: section.title || "",
    subtitle: section.subtitle || "",
    content: typeof section.content === "object" ? JSON.stringify(section.content) : section.content || "",
    displayOrder: section.displayOrder ?? (existingIdx >= 0 ? sections[existingIdx].displayOrder : sections.length + 1),
    isVisible: section.isVisible !== false,
  };

  if (existingIdx >= 0) {
    sections[existingIdx] = { ...sections[existingIdx], ...newSection };
  } else {
    sections.push(newSection);
  }

  writeSectionsToStore(sections);

  // Also sync with page in custom_pages.json if applicable
  const pages = readPagesFromStore();
  const targetKeys = new Set([section.pageId.toLowerCase()]);
  const pageIdx = pages.findIndex(
    (p) => (p.id && targetKeys.has(p.id.toLowerCase())) || (p.slug && targetKeys.has(p.slug.toLowerCase()))
  );

  if (pageIdx >= 0) {
    const pageSections = pages[pageIdx].sections || [];
    const inIdx = pageSections.findIndex((s) => s.id === newSection.id);
    if (inIdx >= 0) {
      pageSections[inIdx] = newSection;
    } else {
      pageSections.push(newSection);
    }
    pages[pageIdx].sections = pageSections;
    pages[pageIdx].updatedAt = now;
    writePagesToStore(pages);
  }

  return newSection;
}

export function updateSection(id: string, updates: Partial<PageSection>): PageSection | null {
  const sections = readSectionsFromStore();
  const idx = sections.findIndex((s) => s.id === id);
  if (idx < 0) return null;

  const updated: PageSection = {
    ...sections[idx],
    ...updates,
    type: updates.type ? updates.type.toUpperCase() : sections[idx].type,
    content: typeof updates.content === "object" ? JSON.stringify(updates.content) : (updates.content !== undefined ? updates.content : sections[idx].content),
    isVisible: updates.isVisible !== undefined ? updates.isVisible : sections[idx].isVisible,
  };

  sections[idx] = updated;
  writeSectionsToStore(sections);

  // Sync to page
  if (updated.pageId) {
    const pages = readPagesFromStore();
    const pageIdx = pages.findIndex((p) => p.id === updated.pageId || p.slug === updated.pageId);
    if (pageIdx >= 0 && pages[pageIdx].sections) {
      const sIdx = pages[pageIdx].sections!.findIndex((s) => s.id === id);
      if (sIdx >= 0) {
        pages[pageIdx].sections![sIdx] = updated;
        writePagesToStore(pages);
      }
    }
  }

  return updated;
}

export function deleteSection(id: string): boolean {
  const sections = readSectionsFromStore();
  const filtered = sections.filter((s) => s.id !== id);
  if (filtered.length !== sections.length) {
    writeSectionsToStore(filtered);

    // Also remove from any inline page sections
    const pages = readPagesFromStore();
    let pagesChanged = false;
    for (const p of pages) {
      if (p.sections && Array.isArray(p.sections)) {
        const pFiltered = p.sections.filter((s) => s.id !== id);
        if (pFiltered.length !== p.sections.length) {
          p.sections = pFiltered;
          pagesChanged = true;
        }
      }
    }
    if (pagesChanged) {
      writePagesToStore(pages);
    }

    return true;
  }
  return false;
}

export function reorderSections(items: { id: string; order: number }[]): boolean {
  const sections = readSectionsFromStore();
  const orderMap = new Map(items.map((it) => [it.id, it.order]));

  let changed = false;
  for (const s of sections) {
    if (orderMap.has(s.id)) {
      s.displayOrder = orderMap.get(s.id)!;
      changed = true;
    }
  }

  if (changed) {
    sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    writeSectionsToStore(sections);
    return true;
  }
  return false;
}

export function toggleSectionVisibility(id: string, isVisible: boolean): boolean {
  const sections = readSectionsFromStore();
  const target = sections.find((s) => s.id === id);
  if (target) {
    target.isVisible = isVisible;
    writeSectionsToStore(sections);

    // Sync to page
    if (target.pageId) {
      const pages = readPagesFromStore();
      const pageIdx = pages.findIndex((p) => p.id === target.pageId || p.slug === target.pageId);
      if (pageIdx >= 0 && pages[pageIdx].sections) {
        const s = pages[pageIdx].sections!.find((sec) => sec.id === id);
        if (s) {
          s.isVisible = isVisible;
          writePagesToStore(pages);
        }
      }
    }

    return true;
  }
  return false;
}
