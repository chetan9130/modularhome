export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  severity: "ERROR" | "WARN";
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  data: T;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface RejectedRecord {
  entityType: "collection" | "product" | "variant" | "media" | "product_collection" | "page" | "blog" | "redirect";
  sourceRowIndex: number;
  sourceId: string;
  handle: string;
  title: string;
  status: "REJECTED";
  reason: string;
  errors: ValidationError[];
  recommendedAction: string;
  rawRecord: Record<string, any>;
}

export interface EntityCounts {
  sourceRows: number;
  validRows: number;
  created: number;
  updated: number;
  skipped: number;
  rejected: number;
  errors: number;
}
