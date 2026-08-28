import { Select } from "antd";
import { cn } from "@/lib/utils";
import {
  INQUIRY_STATUS_OPTIONS,
  type InquiryStatus,
} from "@/redux/features/inquiries/inquiries.types";
import {
  inquiryStatusDotClassMap,
  inquiryStatusLabelMap,
  inquiryStatusSelectClassMap,
} from "../statusMaps";

function StatusOption({ status }: { status: InquiryStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", inquiryStatusDotClassMap[status])} />
      <span>{inquiryStatusLabelMap[status]}</span>
    </span>
  );
}

export function InquiryStatusSelect({
  value,
  onChange,
  disabled,
  size = "small",
  className,
}: {
  value?: InquiryStatus;
  onChange?: (status: InquiryStatus) => void;
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
      className={cn(value ? inquiryStatusSelectClassMap[value] : undefined, className)}
      optionLabelProp="label"
      options={INQUIRY_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: <StatusOption status={status} />,
      }))}
      onChange={onChange}
    />
  );
}
