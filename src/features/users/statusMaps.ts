import type { StatusTone } from "@/types/common";
import type { UserAccountStatus, UserRole } from "@/redux/features/users/users.types";

export const userStatusToneMap: Record<UserAccountStatus | string, StatusTone> = {
  active: "success",
  blocked: "danger",
  pending: "warning",
  rejected: "neutral",
};

export const userStatusLabelMap: Record<UserAccountStatus | string, string> = {
  active: "Active",
  blocked: "Blocked",
  pending: "Pending",
  rejected: "Rejected",
};

export const userStatusSelectClassMap: Record<UserAccountStatus | string, string> = {
  active: "!border-success/45 !bg-success/12 [&_.ant-select-selection-item]:!text-success",
  blocked: "!border-danger/45 !bg-danger/12 [&_.ant-select-selection-item]:!text-danger",
  pending: "!border-warning/45 !bg-warning/12 [&_.ant-select-selection-item]:!text-warning",
  rejected: "!border-slate-300 !bg-slate-100 [&_.ant-select-selection-item]:!text-slate-600",
};

export const userStatusDotClassMap: Record<UserAccountStatus | string, string> = {
  active: "bg-success",
  blocked: "bg-danger",
  pending: "bg-warning",
  rejected: "bg-slate-400",
};

export const userStatusBadgeClassMap: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blocked: "bg-rose-50 text-rose-700 border-rose-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-slate-100 text-slate-600 border-slate-200",
};

export const userRoleBadgeClassMap: Record<UserRole | string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 border-purple-200 font-semibold",
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
  USER: "bg-sky-50 text-sky-700 border-sky-200 font-medium",
};

export const subscriptionStatusToneMap: Record<string, StatusTone> = {
  active: "success",
  expired: "warning",
  cancelled: "danger",
  pending: "info",
};
