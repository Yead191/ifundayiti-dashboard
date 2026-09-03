export const GALLERY_CATEGORIES = [
  "Community Outreach",
  "Grant Programs",
  "Education",
  "Food & Agriculture",
  "Healthcare",
  "Community Development",
  "Entrepreneurship",
  "Environment",
  "Events",
  "Volunteering",
  "Success Stories",
  "Other",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_STATUSES = ["Draft", "Published", "Archived"] as const;

export type GalleryStatus = (typeof GALLERY_STATUSES)[number];

export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  image: string;
  category: GalleryCategory;
  location?: string;
  date?: string;
  status: GalleryStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface GalleryListResponse {
  success: boolean;
  message: string;
  data: GalleryItem[];
  pagination?: GalleryPagination;
}

export interface GallerySingleResponse {
  success: boolean;
  message: string;
  data: GalleryItem;
}

export interface GalleryStats {
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  archivedItems: number;
  featuredItems: number;
}

export interface GalleryStatsResponse {
  success: boolean;
  message: string;
  data: GalleryStats;
}

export interface GalleryListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  sort?: string;
}

export interface ChangeGalleryStatusPayload {
  status: GalleryStatus;
}
