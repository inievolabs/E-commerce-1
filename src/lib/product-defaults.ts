import type { Category } from "@/data/products";

export type SizeGuideRow = { eu: string; uk: string; us: string; cm: string };
export type TrustBadge = { icon: string; label: string };

export const DEFAULT_TAX_LABEL = "Tax included";

export const DEFAULT_SHIPPING_INFO = "Complimentary express shipping nationwide.";

export const DEFAULT_RETURNS_INFO = "Free 30-day returns on unworn pieces in original packaging.";

export const DEFAULT_SIZE_GUIDE_TITLE = "European sizing";

export const DEFAULT_SIZE_GUIDE: SizeGuideRow[] = [
  { eu: "36", uk: "3", us: "5", cm: "23" },
  { eu: "37", uk: "4", us: "6", cm: "23.5" },
  { eu: "38", uk: "5", us: "7", cm: "24" },
  { eu: "39", uk: "6", us: "8", cm: "24.5" },
  { eu: "40", uk: "7", us: "9", cm: "25.5" },
  { eu: "41", uk: "8", us: "10", cm: "26" },
];

export const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { icon: "truck", label: "Complimentary shipping" },
  { icon: "hammer", label: "Hand-finished in Italy" },
  { icon: "rotate-ccw", label: "30-day returns" },
];

const SIZES_BY_CATEGORY: Record<Category, string[]> = {
  bags: [],
  luggage: [],
  slippers: ["36", "37", "38", "39", "40", "41"],
  wallets: [],
};

export function defaultSizesForCategory(category: Category): string[] {
  return [...(SIZES_BY_CATEGORY[category] ?? [])];
}

export function defaultShowSizeGuide(category: Category): boolean {
  return category === "slippers";
}
