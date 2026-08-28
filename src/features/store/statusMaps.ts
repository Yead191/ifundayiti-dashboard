import type { StatusTone } from "@/types/common";
import type { BookStockStatus } from "@/redux/features/store/store.types";

export const stockStatusToneMap: Record<string, StatusTone> = {
  "in-stock": "success",
  "out-stock": "danger",
};

export const stockStatusLabelMap: Record<string, string> = {
  "in-stock": "In stock",
  "out-stock": "Out of stock",
};

export function normalizeStockStatus(status?: string, inStock?: boolean): BookStockStatus {
  if (status === "in-stock" || status === "out-stock") return status;
  return inStock === false ? "out-stock" : "in-stock";
}
