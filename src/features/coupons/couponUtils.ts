import type { ApiCoupon, CouponStatus, CouponType } from "@/redux/features/coupons/coupons.types";
import { formatCurrency } from "@/lib/utils";

export function normalizeCouponType(type: string): CouponType {
  const value = type.trim().toLowerCase();
  return value === "fixed" ? "fixed" : "percentage";
}

function statusFromDates(coupon: Pick<ApiCoupon, "start_date" | "end_date">): CouponStatus {
  const now = Date.now();
  const start = new Date(coupon.start_date).getTime();
  const end = new Date(coupon.end_date).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return "expired";
  if (now < start) return "inactive";
  if (now > end) return "expired";
  return "active";
}

export function normalizeCouponStatus(status: string): CouponStatus {
  const value = status.trim().toLowerCase();
  if (value === "active" || value === "inactive" || value === "expired") {
    return value;
  }
  return "inactive";
}

export function getCouponStatus(
  coupon: Pick<ApiCoupon, "status" | "start_date" | "end_date">
): CouponStatus {
  const fromApi = coupon.status?.trim().toLowerCase();
  if (fromApi === "active" || fromApi === "inactive" || fromApi === "expired") {
    return fromApi;
  }
  return statusFromDates(coupon);
}

export function formatCouponStatus(status: CouponStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatCouponDiscount(coupon: Pick<ApiCoupon, "type" | "amount">) {
  const type = normalizeCouponType(coupon.type);
  if (type === "fixed") return formatCurrency(coupon.amount);
  return `${coupon.amount}%`;
}

export function getCouponUsage(coupon: Pick<ApiCoupon, "total_uses" | "max_use">) {
  const used = coupon.total_uses ?? 0;
  return { used, max: coupon.max_use, remaining: Math.max(coupon.max_use - used, 0) };
}
