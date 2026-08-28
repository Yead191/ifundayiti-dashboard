export type CouponType = "percentage" | "fixed";

export type CouponStatus = "active" | "inactive" | "expired";

export interface ApiCoupon {
  _id: string;
  coupon_code: string;
  stripe_coupon_code?: string;
  name: string;
  type: CouponType | string;
  amount: number;
  max_use: number;
  total_uses: number;
  status: CouponStatus | string;
  start_date: string;
  end_date: string;
}

export interface GetCouponsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface CouponsPagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface CouponsListResponse {
  success: boolean;
  message: string;
  pagination: CouponsPagination;
  data: ApiCoupon[];
}

export interface CouponPayload {
  coupon_code: string;
  name: string;
  type: CouponType;
  amount: number;
  max_use: number;
  start_date: string;
  end_date: string;
  status?: CouponStatus;
}

export interface CouponMutationResponse {
  success: boolean;
  message: string;
  data?: ApiCoupon;
}
