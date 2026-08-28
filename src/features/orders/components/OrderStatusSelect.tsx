import { Select } from "antd";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_OPTIONS,
  type OrderStatus,
} from "@/redux/features/orders/orders.types";
import { orderStatusColorMap, orderStatusLabelMap } from "../statusMaps";

function StatusOption({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", orderStatusColorMap[status].dot)} />
      <span>{orderStatusLabelMap[status]}</span>
    </span>
  );
}

export function OrderStatusSelect({
  value,
  onChange,
  disabled,
  size = "small",
  className,
}: {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
}) {
  return (
    <Select
      size={size}
      value={value}
      disabled={disabled}
      style={{ minWidth: 148 }}
      className={cn(orderStatusColorMap[value]?.select, className)}
      optionLabelProp="label"
      options={ORDER_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: <StatusOption status={status} />,
      }))}
      onChange={onChange}
    />
  );
}
