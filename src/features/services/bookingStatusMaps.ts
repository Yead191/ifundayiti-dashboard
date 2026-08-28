import type { StatusTone } from "@/types/common";
import type { BookingStatus, PaymentStatus } from "@/redux/features/bookings/bookings.types";

export const bookingStatusToneMap: Record<BookingStatus, StatusTone> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger",
};

export const bookingStatusLabelMap: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Dot + select surface colors for each booking status. */
export const bookingStatusColorMap: Record<
  BookingStatus,
  { dot: string; select: string }
> = {
  pending: {
    dot: "bg-warning",
    select: "!border-warning/45 !bg-warning/12 [&_.ant-select-selection-item]:!text-warning",
  },
  confirmed: {
    dot: "bg-info",
    select: "!border-info/45 !bg-info/12 [&_.ant-select-selection-item]:!text-info",
  },
  completed: {
    dot: "bg-success",
    select: "!border-success/45 !bg-success/12 [&_.ant-select-selection-item]:!text-success",
  },
  cancelled: {
    dot: "bg-danger",
    select: "!border-danger/45 !bg-danger/12 [&_.ant-select-selection-item]:!text-danger",
  },
};

export const paymentStatusToneMap: Record<PaymentStatus, StatusTone> = {
  paid: "success",
  unpaid: "danger",
  pending: "warning",
  refunded: "neutral",
};

export const paymentStatusLabelMap: Record<PaymentStatus, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  pending: "Pending",
  refunded: "Refunded",
};
