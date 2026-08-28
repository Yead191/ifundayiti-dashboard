export type UserAccountStatus = "active" | "blocked";
export type UserSubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export interface UserSubscription {
  _id: string;
  user: string;
  name: string;
  plan: string;
  /** Backend field spelling — kept as-is to match the API payload. */
  recuring: string;
  status: UserSubscriptionStatus | string;
  start_date: string;
  end_date: string;
  price: number;
  features: string[];
}

export interface ApiUser {
  _id: string;
  name: string;
  role: string;
  email: string;
  image: string;
  status: UserAccountStatus;
  verified: boolean;
  interest: string;
  company: string;
  subscription?: UserSubscription | null;
  createdAt: string;
  updatedAt: string;
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
  status?: UserAccountStatus | "";
  /** When true, only users with an active/any subscription are returned. */
  hasSubscription?: boolean;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiUser[];
}

export interface ChangeUserStatusPayload {
  status: UserAccountStatus;
}

export interface UserMutationResponse {
  success: boolean;
  message: string;
  data?: ApiUser;
}

export const USER_STATUS_OPTIONS: UserAccountStatus[] = ["active", "blocked"];
