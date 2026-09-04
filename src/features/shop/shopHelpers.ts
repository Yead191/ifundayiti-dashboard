import type {
  Product,
  ProductGender,
  ProductStatus,
  ProductVariant,
} from "@/redux/features/shop/product.types";

export function getCategoryName(category: Product["category"]): string {
  if (!category) return "Uncategorized";
  if (typeof category === "object" && "name" in category) {
    return category.name;
  }
  return String(category);
}

export function getTotalStock(variants?: ProductVariant[]): number {
  if (!variants || !Array.isArray(variants)) return 0;
  return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
}

export function getOutOfStockVariantCount(variants?: ProductVariant[]): number {
  if (!variants || !Array.isArray(variants)) return 0;
  return variants.filter((v) => (Number(v.stock) || 0) <= 0 && !v.isPreOrder).length;
}

export function getPreOrderVariantCount(variants?: ProductVariant[]): number {
  if (!variants || !Array.isArray(variants)) return 0;
  return variants.filter((v) => Boolean(v.isPreOrder)).length;
}

export function calculateDiscountPercent(
  price: number,
  compareAtPrice?: number,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
  return Math.round(discount);
}

export const GENDER_CONFIG: Record<
  ProductGender,
  { label: string; bg: string; text: string; border: string }
> = {
  unisex: {
    label: "Unisex",
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/20",
  },
  men: {
    label: "Men",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/20",
  },
  women: {
    label: "Women",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/20",
  },
  kids: {
    label: "Kids",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/20",
  },
};

export const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; tone: "success" | "warning" | "error" | "neutral" }
> = {
  active: { label: "Active", tone: "success" },
  draft: { label: "Draft", tone: "neutral" },
  inactive: { label: "Inactive", tone: "warning" },
  archived: { label: "Archived", tone: "error" },
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
