export interface FloorPlan {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: string;
  previewImage: string;
  gallery: string[];
  filePath?: string;
  fileFormat: string;
  category: "Cabins" | "ADUs" | "Barndominiums" | "Modern Residential" | "Duplex & Multi-Family";
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  dimensions: string;
  stories: number;
  includedItems: string[];
  features: string[];
  specs: Record<string, string>;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  isFeatured: boolean;
  displayOrder: number;
  seoTitle?: string;
  metaDescription?: string;
}

export const INITIAL_FLOOR_PLANS: FloorPlan[] = [];
