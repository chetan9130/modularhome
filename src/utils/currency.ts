export function formatRupees(val: number | string | null | undefined): string {
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : Number(val);
  if (!num || isNaN(num) || num <= 0) {
    return "Contact for Pricing";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatPrice(val: number | string | null | undefined, fallbackText: string = "Contact for Pricing"): string {
  if (val === null || val === undefined || val === "") {
    return fallbackText;
  }
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : Number(val);
  if (isNaN(num) || num <= 0) {
    return fallbackText;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

