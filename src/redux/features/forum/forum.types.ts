export type PostStatus = "reported" | "published" | "removed";
export type PostReviewStatus = "published" | "removed";

export interface PostAuthor {
  _id: string;
  name: string;
  role?: string;
  image?: string;
}

export interface ApiPost {
  _id: string;
  author: PostAuthor;
  category: string;
  content: string;
  totalLikes: number;
  totalComments: number;
  status: PostStatus;
  reportCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportReporter {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface ApiReport {
  _id: string;
  post: string;
  reporter: ReportReporter;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: PostStatus | "";
}

export interface PostsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiPost[];
}

export interface PostDetailResponse {
  success: boolean;
  message: string;
  data: ApiPost;
}

export interface ReportsListResponse {
  success: boolean;
  message: string;
  data: ApiReport[];
}

export interface PostMutationResponse {
  success: boolean;
  message: string;
  data?: ApiPost;
}

export const POST_STATUS_OPTIONS: PostStatus[] = ["reported", "published", "removed"];
