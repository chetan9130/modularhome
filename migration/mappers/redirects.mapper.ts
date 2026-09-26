import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedRedirect {
  from_path: string;
  to_path: string;
  http_status: number;
  source: string;
}

export function normalizeRedirectPath(p: string): string {
  if (!p) return "/";
  let path = p.trim();
  // Strip domain if absolute URL was provided
  path = path.replace(/^https?:\/\/[^\/]+/i, "");
  if (!path.startsWith("/")) path = `/${path}`;
  // Remove trailing slash except for root
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
}

export function mapRedirectRow(row: Record<string, any>): MappedRedirect {
  const rawFrom = String(row["Path"] || row["Redirect From"] || row["from_path"] || "").trim();
  const rawTo = String(row["Target"] || row["Redirect To"] || row["to_path"] || "").trim();
  
  let status = 301;
  const rawStatus = row["Status Code"] || row["http_status"];
  if (rawStatus) {
    const parsed = parseInt(String(rawStatus), 10);
    if ([301, 302, 307, 308].includes(parsed)) status = parsed;
  }

  const from_path = normalizeRedirectPath(rawFrom);
  const to_path = normalizeRedirectPath(rawTo);
  const source = String(row["Source"] || "shopify").toLowerCase();

  return {
    from_path,
    to_path,
    http_status: status,
    source,
  };
}

export function validateRedirect(item: MappedRedirect): ValidationResult<MappedRedirect> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.from_path || item.from_path === "/") {
    errors.push({ field: "from_path", message: "Redirect from_path cannot be empty or root '/'", severity: "ERROR" });
  }

  if (!item.to_path) {
    errors.push({ field: "to_path", message: "Redirect to_path is required", severity: "ERROR" });
  }

  if (item.from_path === item.to_path) {
    errors.push({ field: "to_path", message: `Infinite redirect loop detected: ${item.from_path} -> ${item.to_path}`, severity: "ERROR" });
  }

  return {
    isValid: errors.length === 0,
    data: item,
    errors,
    warnings,
  };
}
