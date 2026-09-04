export type ProductGender = "men" | "women" | "unisex" | "kids";

export type ProductStatus = "draft" | "active" | "inactive" | "archived";

export type CategoryStatus = "active" | "inactive";

export interface ProductCategory {
  _id: string;
  name: string;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
  isPreOrder?: boolean;
  expectedAvailableDate?: string | null;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: ProductCategory | string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: ProductVariant[];
  gender: ProductGender;
  tags: string[];
  status: ProductStatus;
  featured: boolean;
  sold: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  archivedProducts: number;
  featuredProducts: number;
  totalSold: number;
  totalInventoryUnits: number;
  outOfStockVariants: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  gender?: string;
  status?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
}

export interface CreateCategoryPayload {
  name: string;
  status: CategoryStatus;
}

export interface UpdateCategoryPayload {
  name?: string;
  status?: CategoryStatus;
}

export interface SetVariantStockPayload {
  productId: string;
  size: string;
  color: string;
  stock: number;
}

export interface IncreaseStockPayload {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface VariantPreOrderPayload {
  productId: string;
  size: string;
  color: string;
  isPreOrder: boolean;
  expectedAvailableDate?: string | null;
}

export const GENDERS: { label: string; value: ProductGender }[] = [
  { label: "Unisex", value: "unisex" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
];

export const PRODUCT_STATUSES: { label: string; value: ProductStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

export const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export const DEFAULT_COLORS = [
  { name: "Caribbean Navy", hex: "#0033A0" },
  { name: "Haitian Crimson", hex: "#E4002B" },
  { name: "Oatmeal Heather", hex: "#D6C7B2" },
  { name: "Vintage Black", hex: "#1F2421" },
  { name: "Palm Green", hex: "#1B4D3E" },
  { name: "Pure White", hex: "#FFFFFF" },
];
