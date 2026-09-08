import type { PartnerStatus } from "@/redux/features/partners/partners.types";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";

export interface StatusConfigItem {
  label: string;
  badgeTone: "violet" | "success" | "warning" | "info" | "danger" | "gold" | "neutral";
  colorHex: string;
  bgHex: string;
  borderHex: string;
  description: string;
}

export const PARTNER_STATUS_MAP: Record<string, StatusConfigItem> = {
  [PARTNER_STATUS.APPROVED]: {
    label: "Approved",
    badgeTone: "success",
    colorHex: "#0B3D2E",
    bgHex: "#EBF6F2",
    borderHex: "#A4D4C5",
    description: "Official partner visible publicly on storefront and home carousel.",
  },
  [PARTNER_STATUS.PENDING]: {
    label: "Pending Review",
    badgeTone: "warning",
    colorHex: "#B45309",
    bgHex: "#FFFBEB",
    borderHex: "#FDE68A",
    description: "Application awaiting admin review and decision.",
  },
  [PARTNER_STATUS.REJECTED]: {
    label: "Rejected",
    badgeTone: "danger",
    colorHex: "#DC2626",
    bgHex: "#FEF2F2",
    borderHex: "#FECACA",
    description: "Application declined with optional constructive feedback.",
  },
};

export function getPartnerStatusConfig(status?: string): StatusConfigItem {
  if (!status) return PARTNER_STATUS_MAP[PARTNER_STATUS.PENDING];
  const upper = status.toUpperCase();
  return PARTNER_STATUS_MAP[upper] ?? {
    label: status,
    badgeTone: "neutral",
    colorHex: "#4B5563",
    bgHex: "#F3F4F6",
    borderHex: "#E5E7EB",
    description: "Unknown status",
  };
}

export const SUGGESTED_OFFERS = [
  "Co-marketing",
  "Event Sponsorship",
  "Technology Grant",
  "Community Outreach",
  "Incubation & Mentorship",
  "Resource Sharing",
  "Media & Press",
  "Financial Contribution",
  "Logistics & Venue Support",
];

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      data?: { message?: string; errorMessages?: Array<{ message: string }> };
      message?: string;
    };
    if (err.data?.errorMessages?.[0]?.message) {
      return err.data.errorMessages[0].message;
    }
    return err.data?.message ?? err.message ?? "An unexpected error occurred.";
  }
  return "An unexpected error occurred.";
}
