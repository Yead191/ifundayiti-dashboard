export const COMMUNITY_STATUS = {
  PUBLISHED: "published",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export type CommunityStatus =
  (typeof COMMUNITY_STATUS)[keyof typeof COMMUNITY_STATUS];

export interface IForumPostAuthor {
  _id: string;
  name: string;
  email?: string;
  image?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER" | string;
}

export interface ICommunityPost {
  _id: string;
  title?: string;
  content: string;
  images?: string[];
  author: IForumPostAuthor;
  isPinned: boolean;
  isLocked: boolean;
  status: CommunityStatus;
  totalLikes: number;
  totalComments: number;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICommunityCommentUser {
  _id: string;
  name: string;
  email?: string;
  image?: string;
  role?: string;
}

export type ICommunityCommentAuthor = ICommunityCommentUser;

export interface ICommunityComment {
  _id: string;
  post: string;
  author: ICommunityCommentAuthor;
  text?: string;
  comment?: string;
  parentComment?: string | null;
  totalLikes: number;
  totalReplies: number;
  isLiked?: boolean;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IToggleLikeResponse {
  liked: boolean;
  totalLikes: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface GetCommunityPostsParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  status?: string;
  sortBy?: string;
}

export interface CommunityPostsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  meta?: PaginationMeta;
  pagination?: PaginationMeta;
  data: ICommunityPost[];
}

export interface SingleCommunityPostResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: ICommunityPost;
}

export interface CommunityCommentsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  meta?: PaginationMeta;
  data: ICommunityComment[];
}

export interface SingleCommunityCommentResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: ICommunityComment;
}

export interface ToggleCommentLikeResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: {
    liked: boolean;
    totalLikes: number;
  };
}

export interface CreateCommunityPostPayload {
  title?: string;
  content: string;
  images?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
  status?: CommunityStatus;
}

export interface UpdateCommunityPostPayload {
  title?: string;
  content?: string;
  images?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
  status?: CommunityStatus;
}
