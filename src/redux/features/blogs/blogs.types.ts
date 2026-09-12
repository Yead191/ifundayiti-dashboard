export const BLOG_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type BLOG_STATUS = (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS];

export interface IBlogCategory {
  _id: string;
  name: string;
  slug: string;
  blogCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogAuthor {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface IBlogCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  category: IBlogCategoryRef | string;
  author?: IBlogAuthor | string;
  tags?: string[];
  status: BLOG_STATUS;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: string;
  isFeatured?: boolean;
  sort?: string;
}

export interface BlogCategoryListParams {
  searchTerm?: string;
  sort?: string;
}

export interface BlogStatsResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: IBlogStats;
}

export interface BlogListResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: IBlog[];
}

export interface SingleBlogResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: IBlog;
}

export interface BlogCategoryListResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: IBlogCategory[];
}

export interface SingleBlogCategoryResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: IBlogCategory;
}
