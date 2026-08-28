import type { StatusTone } from "@/types/common";
import {
  PARTNER_STATUS,
  type PartnerStatus,
} from "@/redux/features/partners/partners.types";

export const partnerStatusToneMap: Record<PartnerStatus, StatusTone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export const partnerStatusLabelMap: Record<PartnerStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const partnerStatusDotClassMap: Record<PartnerStatus, string> = {
  PENDING: "bg-warning",
  APPROVED: "bg-success",
  REJECTED: "bg-danger",
};

export function normalizePartnerStatus(status?: string): PartnerStatus {
  const value = status?.trim().toUpperCase();
  if (value && value in PARTNER_STATUS) return value as PartnerStatus;
  return PARTNER_STATUS.PENDING;
}
