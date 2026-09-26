/**
 * Text and HTML processing utilities for ModularHome.com
 */

/**
 * Strips all HTML tags and decodes common entities to produce clean plain text.
 */
export function stripHtml(input?: string | null): string {
  if (!input) return "";
  
  return input
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a string contains HTML tags
 */
export function isHtml(input?: string | null): boolean {
  if (!input) return false;
  return /<[a-z][\s\S]*>/i.test(input);
}

/**
 * Truncates text to a max character length with an ellipsis
 */
export function truncateText(text: string, maxLength: number = 160): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + "...";
}
