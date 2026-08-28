import { Select } from "antd";
import { cn } from "@/lib/utils";
import {
  BOOKING_STATUS_OPTIONS,
  type BookingStatus,
} from "@/redux/features/bookings/bookings.types";
import {
  bookingStatusColorMap,
  bookingStatusLabelMap,
} from "../bookingStatusMaps";

function StatusOption({ status }: { status: BookingStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", bookingStatusColorMap[status].dot)} />
      <span>{bookingStatusLabelMap[status]}</span>
    </span>
  );
}

/** Colored status dropdown — each status has a distinct tint for quick scanning. */
export function BookingStatusSelect({
  value,
  onChange,
  disabled,
  size = "small",
  className,
}: {
  value: BookingStatus;
  onChange: (status: BookingStatus) => void;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
}) {
  return (
    <Select
      size={size}
      value={value}
      disabled={disabled}
      style={{ minWidth: 138 }}
      className={cn(bookingStatusColorMap[value].select, className)}
      optionLabelProp="label"
      options={BOOKING_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: <StatusOption status={status} />,
      }))}
      onChange={onChange}
    />
  );
}
