import type { StatusTone } from "@/types/common";
import type {
  OrderStatus,
  PaymentStatus,
} from "@/redux/features/orders/orders.types";

export const orderStatusToneMap: Record<OrderStatus, StatusTone> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "neutral",
  delivered: "success",
  cancelled: "danger",
};

export const orderStatusLabelMap: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const orderStatusColorMap: Record<
  OrderStatus,
  { dot: string; select: string }
> = {
  pending: {
    dot: "bg-warning",
    select:
      "!border-warning/45 !bg-warning/12 [&_.ant-select-selection-item]:!text-warning",
  },
  confirmed: {
    dot: "bg-info",
    select:
      "!border-info/45 !bg-info/12 [&_.ant-select-selection-item]:!text-info",
  },
  processing: {
    dot: "bg-info",
    select:
      "!border-info/45 !bg-info/12 [&_.ant-select-selection-item]:!text-info",
  },
  shipped: {
    dot: "bg-neutral",
    select:
      "!border-neutral/45 !bg-neutral/12 [&_.ant-select-selection-item]:!text-neutral",
  },
  delivered: {
    dot: "bg-success",
    select:
      "!border-success/45 !bg-success/12 [&_.ant-select-selection-item]:!text-success",
  },
  cancelled: {
    dot: "bg-danger",
    select:
      "!border-danger/45 !bg-danger/12 [&_.ant-select-selection-item]:!text-danger",
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
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "processing" ||
    value === "shipped" ||
    value === "delivered" ||
    value === "cancelled"
  );
}

export function paymentLabel(status: PaymentStatus) {
  return paymentStatusLabelMap[status] ?? String(status);
}
