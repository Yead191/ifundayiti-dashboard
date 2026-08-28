import type { StatusTone } from "@/types/common";
import type { VendorAccountStatus } from "@/redux/features/vendors/vendors.types";

export const statusToneMap: Record<VendorAccountStatus, StatusTone> = {
  pending: "warning",
  active: "success",
  blocked: "danger",
  rejected: "neutral",
};

export const statusLabelMap: Record<VendorAccountStatus, string> = {
  pending: "Pending application",
  active: "Active",
  blocked: "Blocked",
  rejected: "Rejected",
};

export const statusSelectClassMap: Record<VendorAccountStatus, string> = {
  pending: "!border-warning/45 !bg-warning/12 [&_.ant-select-selection-item]:!text-warning",
  active: "!border-success/45 !bg-success/12 [&_.ant-select-selection-item]:!text-success",
  blocked: "!border-danger/45 !bg-danger/12 [&_.ant-select-selection-item]:!text-danger",
  rejected: "!border-white/15 !bg-white/[0.06] [&_.ant-select-selection-item]:!text-mist-400",
};

export const statusDotClassMap: Record<VendorAccountStatus, string> = {
  pending: "bg-warning",
  active: "bg-success",
  blocked: "bg-danger",
  rejected: "bg-mist-600",
};
