import { Select } from "antd";
import { cn } from "@/lib/utils";
import {
  VENDOR_STATUS_OPTIONS,
  type VendorAccountStatus,
} from "@/redux/features/vendors/vendors.types";
import { statusDotClassMap, statusLabelMap, statusSelectClassMap } from "../statusMaps";

function StatusOption({ status }: { status: VendorAccountStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", statusDotClassMap[status])} />
      <span>{statusLabelMap[status]}</span>
    </span>
  );
}

export function VendorStatusSelect({
  value,
  onChange,
  disabled,
  size = "small",
  className,
}: {
  value: VendorAccountStatus;
  onChange: (status: VendorAccountStatus) => void;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
}) {
  return (
    <Select
      size={size}
      value={value}
      disabled={disabled}
      style={{ minWidth: 168 }}
      className={cn(statusSelectClassMap[value], className)}
      optionLabelProp="label"
      options={VENDOR_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: <StatusOption status={status} />,
      }))}
      onChange={onChange}
    />
  );
}
