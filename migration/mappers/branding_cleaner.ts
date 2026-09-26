/**
 * ModularHome SEO & Branding Normalizer
 * Enforces SEO_AND_BRANDING_RULES.md:
 * - Replaces old domains & contact details in body/SEO text
 * - Preserves factual descriptive phrases like "Amish built craftsmanship"
 * - Replaces hardcoded shopify links with ModularHome routes
 */

export interface BrandingAuditFinding {
  type: "DOMAIN" | "PHONE" | "EMAIL" | "SHOPIFY_LINK" | "BRAND_MENTION";
  original: string;
  replacedWith: string;
  contextSnippet: string;
}

export function cleanHtmlContent(
  html: string | null | undefined,
  entityContext: string
): { cleanedHtml: string; findings: BrandingAuditFinding[] } {
  if (!html) return { cleanedHtml: "", findings: [] };

  const findings: BrandingAuditFinding[] = [];
  let cleaned = html;

  // 1. Replace amishbuiltcabins.com URLs
  const domainRegex = /https?:\/\/(?:www\.)?amishbuiltcabins\.com/gi;
  if (domainRegex.test(cleaned)) {
    const matches = cleaned.match(domainRegex) || [];
    for (const m of matches) {
      findings.push({
        type: "DOMAIN",
        original: m,
        replacedWith: "https://modularhome.com",
        contextSnippet: entityContext,
      });
    }
    cleaned = cleaned.replace(domainRegex, "https://modularhome.com");
  }

  // 2. Replace old phone numbers (502-298-8946, (502) 298-8946, 502.298.8946)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?502\)?[-.\s]?298[-.\s]?8946/gi;
  if (phoneRegex.test(cleaned)) {
    const matches = cleaned.match(phoneRegex) || [];
    for (const m of matches) {
      findings.push({
        type: "PHONE",
        original: m,
        replacedWith: "+1 (812) 595-4033",
        contextSnippet: entityContext,
      });
    }
    cleaned = cleaned.replace(phoneRegex, "+1 (812) 595-4033");
  }

  // 3. Replace old email addresses
  const emailRegex = /[\w.-]+@amishbuiltcabins\.com/gi;
  if (emailRegex.test(cleaned)) {
    const matches = cleaned.match(emailRegex) || [];
    for (const m of matches) {
      findings.push({
        type: "EMAIL",
        original: m,
        replacedWith: "support@modularhome.com",
        contextSnippet: entityContext,
      });
    }
    cleaned = cleaned.replace(emailRegex, "support@modularhome.com");
  }

  // 4. Update internal Shopify paths if present in hrefs
  // href="/products/..." -> href="/buildings/..."
  cleaned = cleaned.replace(/href=["']\/products\/([^"']+)["']/gi, 'href="/buildings/$1"');
  // href="/blogs/news/..." -> href="/resources/$1"
  cleaned = cleaned.replace(/href=["']\/blogs\/(?:news\/)?([^"']+)["']/gi, 'href="/resources/$1"');

  return { cleanedHtml: cleaned, findings };
}

export function cleanSeoTitle(title: string | null | undefined, fallback: string): string {
  if (!title || !title.trim()) return `${fallback} | ModularHome`;
  let cleaned = title.trim();
  cleaned = cleaned.replace(/\s*\|\s*Amish Built Cabins/gi, " | ModularHome");
  cleaned = cleaned.replace(/\s*-\s*Amish Built Cabins/gi, " | ModularHome");
  cleaned = cleaned.replace(/\s*-\s*Amish Made Cabins/gi, "");
  if (!cleaned.toLowerCase().includes("modularhome")) {
    cleaned = `${cleaned} | ModularHome`;
  }
  return cleaned;
}

export function cleanSeoDescription(desc: string | null | undefined, fallback: string): string {
  if (!desc || !desc.trim()) {
    const cleanFallback = fallback.replace(/<[^>]*>?/gm, "").slice(0, 160).trim();
    return cleanFallback || "Explore precision engineered steel-frame modular homes by ModularHome.";
  }
  let cleaned = desc.trim();
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?amishbuiltcabins\.com/gi, "https://modularhome.com");
  cleaned = cleaned.replace(/502-298-8946/g, "+1 (812) 595-4033");
  return cleaned.slice(0, 320);
}
