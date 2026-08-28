import type { OrderPriceBreakdown } from "../orders/orders.types";

export type RefundStatus = "pending" | "refunded" | "rejected";
export type RefundType = "full" | "partial";

export interface RefundUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface RefundOrder {
  _id: string;
  status: string;
  payment_status: string;
  order_id: string;
  price_breakdown: OrderPriceBreakdown;
  total_items?: number;
  contact_number?: string | null;
  payment_intent_id?: string | null;
}

export interface ApiRefund {
  _id: string;
  order: RefundOrder;
  user: RefundUser;
  reason: string;
  images: string[];
  refundType: RefundType | string;
  status: RefundStatus | string;
  refundAmount: number;
  adminNote?: string;
  stripeRefundId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetRefundsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: RefundStatus | "";
}

export interface RefundsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiRefund[];
}

export interface RefundDetailResponse {
  success: boolean;
  message: string;
  data: ApiRefund;
}

export interface ReviewRefundPayload {
  status: "refunded" | "rejected";
  refundType: RefundType;
  refundAmount: number;
  adminNote: string;
}

export interface RefundMutationResponse {
  success: boolean;
  message: string;
  data?: ApiRefund;
}

export const REFUND_STATUS_OPTIONS: RefundStatus[] = ["pending", "refunded", "rejected"];
export const REFUND_TYPE_OPTIONS: RefundType[] = ["full", "partial"];
