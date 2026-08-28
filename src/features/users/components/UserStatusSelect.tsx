import { Select } from "antd";
import { cn } from "@/lib/utils";
import {
  USER_STATUS_OPTIONS,
  type UserAccountStatus,
} from "@/redux/features/users/users.types";
import {
  userStatusDotClassMap,
  userStatusLabelMap,
  userStatusSelectClassMap,
} from "../statusMaps";

function StatusOption({ status }: { status: UserAccountStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", userStatusDotClassMap[status])} />
      <span>{userStatusLabelMap[status]}</span>
    </span>
  );
}

export function UserStatusSelect({
  value,
  onChange,
  disabled,
  size = "small",
  className,
}: {
  value: UserAccountStatus;
  onChange: (status: UserAccountStatus) => void;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
}) {
  return (
    <Select
      size={size}
      value={value}
      disabled={disabled}
      style={{ minWidth: 128 }}
      className={cn(userStatusSelectClassMap[value], className)}
      optionLabelProp="label"
      options={USER_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: <StatusOption status={status} />,
      }))}
      onChange={onChange}
    />
  );
}
