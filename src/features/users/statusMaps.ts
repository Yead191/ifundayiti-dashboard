import type { StatusTone } from "@/types/common";
import type { UserAccountStatus } from "@/redux/features/users/users.types";

export const userStatusToneMap: Record<UserAccountStatus, StatusTone> = {
  active: "success",
  blocked: "danger",
};

export const userStatusLabelMap: Record<UserAccountStatus, string> = {
  active: "Active",
  blocked: "Blocked",
};

export const userStatusSelectClassMap: Record<UserAccountStatus, string> = {
  active: "!border-success/45 !bg-success/12 [&_.ant-select-selection-item]:!text-success",
  blocked: "!border-danger/45 !bg-danger/12 [&_.ant-select-selection-item]:!text-danger",
};

export const userStatusDotClassMap: Record<UserAccountStatus, string> = {
  active: "bg-success",
  blocked: "bg-danger",
};

export const subscriptionStatusToneMap: Record<string, StatusTone> = {
  active: "success",
  expired: "warning",
  cancelled: "danger",
  pending: "info",
};
