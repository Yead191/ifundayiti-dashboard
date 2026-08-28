import type { StatusTone } from "@/types/common";
import type { OrderPaymentStatus, OrderStatus } from "@/redux/features/orders/orders.types";

export const orderStatusToneMap: Record<OrderStatus, StatusTone> = {
  Pending: "warning",
  Processing: "info",
  Deliverd: "success",
  Cancelled: "danger",
};

export const orderStatusLabelMap: Record<OrderStatus, string> = {
  Pending: "Pending",
  Processing: "Processing",
  Deliverd: "Delivered",
  Cancelled: "Cancelled",
};

export const orderStatusColorMap: Record<OrderStatus, { dot: string; select: string }> = {
  Pending: {
    dot: "bg-warning",
    select: "!border-warning/45 !bg-warning/12 [&_.ant-select-selection-item]:!text-warning",
  },
  Processing: {
    dot: "bg-info",
    select: "!border-info/45 !bg-info/12 [&_.ant-select-selection-item]:!text-info",
  },
  Deliverd: {
    dot: "bg-success",
    select: "!border-success/45 !bg-success/12 [&_.ant-select-selection-item]:!text-success",
  },
  Cancelled: {
    dot: "bg-danger",
    select: "!border-danger/45 !bg-danger/12 [&_.ant-select-selection-item]:!text-danger",
  },
};

export const paymentStatusToneMap: Record<string, StatusTone> = {
  paid: "success",
  unpaid: "danger",
  pending: "warning",
  refunded: "neutral",
};

export const paymentStatusLabelMap: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  pending: "Pending",
  refunded: "Refunded",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return value === "Pending" || value === "Processing" || value === "Deliverd" || value === "Cancelled";
}

export function paymentLabel(status: OrderPaymentStatus) {
  return paymentStatusLabelMap[status] ?? String(status);
}
