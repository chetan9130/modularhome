import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedVariant {
  productHandle: string;
  productSourceId?: string;
  sku: string | null;
  barcode: string | null;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: number | null;
  compare_at_price: number | null;
  inventory_quantity: number | null;
  source_id: string;
  position: number;
}

export function mapVariantRow(row: Record<string, any>, currentProductHandle: string, fallbackPosition: number): MappedVariant {
  const productHandle = String(row["Handle"] || currentProductHandle).trim().toLowerCase();
  const sourceId = String(row["Variant ID"] || row["ID"] || "").trim();
  const sku = row["Variant SKU"] ? String(row["Variant SKU"]).trim() : null;
  const barcode = row["Variant Barcode"] ? String(row["Variant Barcode"]).trim() : null;
  
  const opt1 = row["Option1 Value"] ? String(row["Option1 Value"]).trim() : null;
  const opt2 = row["Option2 Value"] ? String(row["Option2 Value"]).trim() : null;
  const opt3 = row["Option3 Value"] ? String(row["Option3 Value"]).trim() : null;

  let title = [opt1, opt2, opt3].filter(Boolean).join(" / ");
  if (!title) title = "Default Title";

  let price: number | null = null;
  if (row["Variant Price"] !== undefined && row["Variant Price"] !== "") {
    const p = parseFloat(String(row["Variant Price"]).replace(/[^0-9.-]+/g, ""));
    if (!isNaN(p)) price = p;
  }

  let compareAtPrice: number | null = null;
  if (row["Variant Compare At Price"] !== undefined && row["Variant Compare At Price"] !== "") {
    const cp = parseFloat(String(row["Variant Compare At Price"]).replace(/[^0-9.-]+/g, ""));
    if (!isNaN(cp)) compareAtPrice = cp;
  }

  let inventoryQty: number | null = null;
  if (row["Variant Inventory Qty"] !== undefined && row["Variant Inventory Qty"] !== "") {
    const q = parseInt(String(row["Variant Inventory Qty"]), 10);
    if (!isNaN(q)) inventoryQty = q;
  }

  let position = fallbackPosition;
  if (row["Variant Position"] !== undefined && row["Variant Position"] !== "") {
    const pos = parseInt(String(row["Variant Position"]), 10);
    if (!isNaN(pos)) position = pos;
  }

  return {
    productHandle,
    productSourceId: row["ID"] ? String(row["ID"]).trim() : undefined,
    sku,
    barcode,
    title,
    option1: opt1,
    option2: opt2,
    option3: opt3,
    price,
    compare_at_price: compareAtPrice,
    inventory_quantity: inventoryQty,
    source_id: sourceId,
    position,
  };
}

export function validateVariant(item: MappedVariant, productExists: boolean): ValidationResult<MappedVariant> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.productHandle) {
    errors.push({ field: "productHandle", message: "Variant missing parent product handle", severity: "ERROR" });
  }

  if (!productExists) {
    errors.push({ field: "product_id", message: `Orphan variant: parent product '${item.productHandle}' does not exist`, severity: "ERROR" });
  }

  if (item.price !== null && item.price < 0) {
    errors.push({ field: "price", message: `Invalid negative variant price: ${item.price}`, severity: "ERROR" });
  }

  return {
    isValid: errors.length === 0,
    data: item,
    errors,
    warnings,
  };
}
