import { ValidationResult, ValidationError } from "../validators/types";

export interface MappedProductCollection {
  productHandle: string;
  collectionHandle: string;
}

export function validateProductCollection(
  item: MappedProductCollection,
  productExists: boolean,
  collectionExists: boolean
): ValidationResult<MappedProductCollection> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!item.productHandle) {
    errors.push({ field: "productHandle", message: "Missing product handle for relationship", severity: "ERROR" });
  } else if (!productExists) {
    errors.push({ field: "product_id", message: `Relationship refers to non-existent product '${item.productHandle}'`, severity: "ERROR" });
  }

  if (!item.collectionHandle) {
    errors.push({ field: "collectionHandle", message: "Missing collection handle for relationship", severity: "ERROR" });
  } else if (!collectionExists) {
    errors.push({ field: "collection_id", message: `Relationship refers to non-existent collection '${item.collectionHandle}'`, severity: "ERROR" });
  }

  return {
    isValid: errors.length === 0,
    data: item,
    errors,
    warnings,
  };
}
