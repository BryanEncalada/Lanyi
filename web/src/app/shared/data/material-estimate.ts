export interface MaterialEstimate {
  quantity: number;
  total: number | null;
  valid: boolean;
}
/** Quantity includes 10% extra, rounded upwards to 0.01 m² or m lineal. */
export function estimateMaterial(quantity: number, price?: string): MaterialEstimate {
  if (!Number.isFinite(quantity) || quantity < 0.01 || quantity > 1_000_000)
    return { quantity: 0, total: null, valid: false };
  const hundredths = Math.ceil((Math.ceil(quantity * 100 - 1e-8) * 110) / 100);
  const result = { quantity: hundredths / 100, total: null as number | null, valid: true };
  if (typeof price !== 'string' || !/^\d{1,10}(?:\.\d{1,2})?$/.test(price.trim())) return result;
  const cents = Math.round(Number(price) * 100);
  const product = cents * hundredths;
  if (!Number.isSafeInteger(product)) return result;
  result.total = Math.round(product / 100) / 100;
  return result;
}
export function roomPerimeter(length: number, width: number): number {
  return Number.isFinite(length) &&
    Number.isFinite(width) &&
    length >= 0.01 &&
    width >= 0.01 &&
    length <= 10_000 &&
    width <= 10_000
    ? 2 * (length + width)
    : 0;
}
