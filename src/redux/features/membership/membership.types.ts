export type MembershipType = "user" | "vendor";
export type MembershipRecurring = "week" | "month" | "year";
export type SubscriberRecurring = "week" | "month" | "year" | "free";

export interface ApiMembership {
  _id: string;
  name: string;
  tagline: string;
  type: MembershipType;
  price: number;
  recurring: MembershipRecurring;
  interval: number;
  featured: boolean;
  highlight: string;
  features: string[];
  has_trial?: boolean;
  trial_period_days?: number;
  is_auto_renew?: boolean;
  productId?: string;
  priceId?: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetMembershipsParams {
  page?: number;
  limit?: number;
  type: MembershipType;
  recurring?: MembershipRecurring | "";
  searchTerm?: string;
}

export interface MembershipsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiMembership[];
}

export interface MembershipFormPayload {
  name: string;
  tagline: string;
  price: number;
  recurring: MembershipRecurring;
  interval_count: number;
  featured: boolean;
  highlight: string;
  type: MembershipType;
  features: string[];
  has_trial: boolean;
  trial_period_days: number;
  is_auto_renew: boolean;
}

export interface MembershipMutationResponse {
  success: boolean;
  message: string;
  data?: ApiMembership;
}

export interface SubscriberUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface SubscriberPlan {
  _id: string;
  name: string;
}

export interface ApiSubscriber {
  _id: string;
  user: SubscriberUser;
  name: string;
  plan: SubscriberPlan;
  /** Backend field spelling — kept as-is. */
  recuring?: SubscriberRecurring | string;
  auto_renew?: boolean;
  status: string;
  start_date: string;
  end_date: string;
  price: number;
  features: string[];
  is_trial?: boolean;
  trial_period_days?: number;
  trial_end_date?: string;
  payment_intent_id?: string;
  trxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetSubscribersParams {
  id: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface SubscribersListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiSubscriber[];
}
