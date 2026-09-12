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

export const FOLDER_STATUS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
} as const;

export type FOLDER_STATUS = (typeof FOLDER_STATUS)[keyof typeof FOLDER_STATUS];

export interface IFolder {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  location?: string;
  date?: string;
  status: GalleryStatus;
  featured: boolean;
  galleryCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FolderPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface FolderListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  sort?: string;
}

export interface FolderListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IFolder[];
  pagination?: FolderPagination;
}

export interface FolderSingleResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IFolder;
}

export interface FolderStats {
  totalFolders: number;
  publishedFolders: number;
  draftFolders: number;
  archivedFolders: number;
  featuredFolders: number;
  totalImages: number;
}

export interface FolderStatsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: FolderStats;
}

export interface IGallery {
  _id: string;
  folder:
    | string
    | {
        _id: string;
        name: string;
        image?: string;
        category?: string;
        location?: string;
        date?: string;
        status?: GalleryStatus;
        featured?: boolean;
      };
  image: string;
  caption?: string;
  // Backward compatibility fields
  title?: string;
  description?: string;
  category?: GalleryCategory;
  location?: string;
  date?: string;
  status?: GalleryStatus;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type GalleryItem = IGallery;

export interface GalleryStats {
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  archivedItems: number;
  featuredItems: number;
}

export interface GalleryStatsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: GalleryStats;
}

export interface GalleryPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface GalleryListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IGallery[];
  pagination?: GalleryPagination;
}

export interface GallerySingleResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IGallery;
}

export interface GalleryListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  folder?: string;
  category?: string;
  status?: string;
  featured?: boolean;
}

export interface ChangeFolderStatusPayload {
  status: GalleryStatus;
}
