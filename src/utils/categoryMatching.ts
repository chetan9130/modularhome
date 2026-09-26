/**
 * Category Normalization and Matching Utilities
 */

/**
 * Normalizes a category name or slug to a clean, lowercase space-separated string
 */
export function normalizeCategory(cat?: string | null): string {
  if (!cat) return "";
  return cat
    .toLowerCase()
    .replace(/[-_&+/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if two category labels refer to the same category
 */
export function isCategorySelected(currentCat?: string | null, tabName?: string | null): boolean {
  if (!currentCat || !tabName) return false;
  if (currentCat.toLowerCase() === tabName.toLowerCase()) return true;
  return normalizeCategory(currentCat) === normalizeCategory(tabName);
}

/**
 * Robustly matches a product/model against a selected category or slug
 */
export function matchProductCategory(
  model: {
    name?: string;
    category?: string;
    series?: string;
    tags?: string[];
    collections?: string[];
    description?: string;
    architecturalStyle?: string;
  },
  selectedCat: string
): boolean {
  if (!selectedCat || selectedCat === "All" || selectedCat === "ALL") {
    return true;
  }

  const clean = normalizeCategory(selectedCat);
  if (!clean || clean === "all") return true;

  const mName = (model.name || "").toLowerCase();
  const mCat = (model.category || "").toLowerCase();
  const mSeries = (model.series || "").toLowerCase();
  const mStyle = (model.architecturalStyle || "").toLowerCase();
  const mDesc = (model.description || "").toLowerCase();
  const mTags = (model.tags || []).map((t) => t.toLowerCase()).join(" ");
  const mCols = (model.collections || []).map((c) => c.toLowerCase()).join(" ");

  const combined = `${mName} ${mCat} ${mSeries} ${mStyle} ${mTags} ${mCols} ${mDesc}`;

  // 1. Direct contains check
  if (combined.includes(clean)) return true;
  if (combined.includes(selectedCat.toLowerCase())) return true;

  // 2. Specialized keyword mappings for primary home categories
  if (clean.includes("barndo")) {
    return (
      combined.includes("barndo") ||
      combined.includes("barndominium") ||
      combined.includes("steel home") ||
      combined.includes("barn")
    );
  }

  if (clean.includes("cabin") || clean.includes("prefab cabin")) {
    return (
      combined.includes("cabin") ||
      combined.includes("chalet") ||
      combined.includes("a frame") ||
      combined.includes("a-frame") ||
      combined.includes("rustic")
    );
  }

  if (clean.includes("kit") || clean.includes("kit home")) {
    return (
      combined.includes("kit") ||
      combined.includes("diy") ||
      combined.includes("panelized") ||
      combined.includes("bungalow") ||
      combined.includes("package")
    );
  }

  if (clean.includes("turnkey")) {
    return (
      combined.includes("turnkey") ||
      combined.includes("turn-key") ||
      combined.includes("finished") ||
      combined.includes("complete")
    );
  }

  if (clean.includes("tiny") || clean.includes("adu")) {
    return (
      combined.includes("tiny") ||
      combined.includes("adu") ||
      combined.includes("small") ||
      combined.includes("cottage") ||
      combined.includes("accessory")
    );
  }

  if (clean.includes("log home") || clean.includes("log")) {
    return (
      combined.includes("log") ||
      combined.includes("timber") ||
      combined.includes("wood")
    );
  }

  if (clean.includes("commercial")) {
    return (
      combined.includes("commercial") ||
      combined.includes("warehouse") ||
      combined.includes("workshop") ||
      combined.includes("office") ||
      combined.includes("garage") ||
      combined.includes("storage")
    );
  }

  if (clean.includes("affordable")) {
    return (
      combined.includes("affordable") ||
      combined.includes("starter") ||
      combined.includes("bungalow") ||
      combined.includes("budget") ||
      combined.includes("compact")
    );
  }

  if (clean.includes("modular")) {
    return (
      combined.includes("modular") ||
      combined.includes("prefab") ||
      combined.includes("residential") ||
      combined.includes("home")
    );
  }

  // 3. Fallback: match any significant keyword
  const words = clean
    .split(" ")
    .filter((w) => w.length > 2 && w !== "homes" && w !== "home" && w !== "house" && w !== "and");

  if (words.length > 0) {
    return words.some((w) => combined.includes(w));
  }

  return false;
}
