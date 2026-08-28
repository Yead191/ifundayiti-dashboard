import type { StatusTone } from "@/types/common";
import type { TransactionCategory } from "@/redux/features/transactions/transactions.types";

export const transactionStatusToneMap: Record<string, StatusTone> = {
  Success: "success",
  SUCCESS: "success",
  success: "success",
  Failed: "danger",
  FAILED: "danger",
  failed: "danger",
  Pending: "warning",
  PENDING: "warning",
  pending: "warning",
};

export const transactionTypeToneMap: Record<string, StatusTone> = {
  Credit: "success",
  CREDIT: "success",
  credit: "success",
  Debit: "danger",
  DEBIT: "danger",
  debit: "danger",
};

export const transactionCategoryToneMap: Record<string, StatusTone> = {
  Membership: "gold",
  MEMBERSHIP: "gold",
  membership: "gold",
  Shop: "violet",
  SHOP: "violet",
  shop: "violet",
  Service: "info",
  SERVICE: "info",
  service: "info",
};

export const transactionCategoryLabelMap: Record<string, string> = {
  Membership: "Membership",
  MEMBERSHIP: "Membership",
  Shop: "Shop",
  SHOP: "Shop",
  Service: "Service",
  SERVICE: "Service",
};

export function formatTransactionLabel(value?: string | null) {
  if (!value) return "—";
  if (transactionCategoryLabelMap[value]) return transactionCategoryLabelMap[value];
  const spaced = value.replace(/_/g, " ").toLowerCase();
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isMembershipCategory(category: TransactionCategory | string) {
  return category.toLowerCase() === "membership";
}

export function isShopCategory(category: TransactionCategory | string) {
  return category.toLowerCase() === "shop";
}

export function isServiceCategory(category: TransactionCategory | string) {
  return category.toLowerCase() === "service";
}
