import type { StatusTone } from "@/types/common";
import type { RefundStatus, RefundType } from "@/redux/features/refunds/refunds.types";

export const refundStatusToneMap: Record<RefundStatus, StatusTone> = {
  pending: "warning",
  refunded: "success",
  rejected: "danger",
};

export const refundStatusLabelMap: Record<RefundStatus, string> = {
  pending: "Pending",
  refunded: "Refunded",
  rejected: "Rejected",
};

export const refundStatusDotClassMap: Record<RefundStatus, string> = {
  pending: "bg-warning",
  refunded: "bg-success",
  rejected: "bg-danger",
};

export const refundTypeLabelMap: Record<RefundType, string> = {
  full: "Full refund",
  partial: "Partial refund",
};

export function normalizeRefundStatus(status?: string): RefundStatus {
  const value = status?.trim().toLowerCase();
  if (value === "refunded" || value === "rejected" || value === "pending") return value;
  return "pending";
}

export function normalizeRefundType(type?: string): RefundType {
  return type?.trim().toLowerCase() === "partial" ? "partial" : "full";
}
