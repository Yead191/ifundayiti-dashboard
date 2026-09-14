export type UserAccountStatus = "active" | "blocked" | "pending" | "rejected";
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";
export type UserSubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export interface UserSubscription {
  _id: string;
  user?: string;
  name: string;
  plan?: string;
  recuring?: string;
  status?: UserSubscriptionStatus | string;
  start_date?: string;
  end_date?: string;
  price?: number;
  features?: string[];
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole | string;
  image?: string;
  status: UserAccountStatus | string;
  rejectionReason?: string;
  verified: boolean;
  authType?: string;
  company?: string;
  interest?: string;
  subscription?: UserSubscription | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  pendingUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  regularUsers: number;
  admins: number;
  newThisMonth: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  role?: string;
  status?: string;
  verified?: boolean;
  sort?: string;
}

export interface UsersListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiUser[];
}

export interface SingleUserResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface UserStatsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IUserStats;
}

export interface ChangeUserStatusPayload {
  status?: string;
  rejectionReason?: string;
}

export interface UserMutationResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: any;
}

export const USER_STATUS_OPTIONS: UserAccountStatus[] = [
  "active",
  "blocked",
  "pending",
  "rejected",
];

export const USER_ROLE_OPTIONS: UserRole[] = [
  "USER",
  "ADMIN",
];
