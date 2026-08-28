import type { StatusTone } from "@/types/common";
import type {
  MembershipRecurring,
  MembershipType,
  SubscriberRecurring,
} from "@/redux/features/membership/membership.types";

export const membershipTypeLabelMap: Record<MembershipType, string> = {
  user: "User",
  vendor: "Vendor",
};

export const recurringLabelMap: Record<MembershipRecurring, string> = {
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
};

export const recurringShortLabelMap: Record<MembershipRecurring, string> = {
  week: "wk",
  month: "mo",
  year: "yr",
};

export const subscriberRecurringLabelMap: Record<SubscriberRecurring, string> = {
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
  free: "Free",
};

export function formatSubscriberRecurring(value?: string | null) {
  if (!value) return "—";
  const key = value.toLowerCase() as SubscriberRecurring;
  return subscriberRecurringLabelMap[key] ?? value;
}

export const subscriberStatusToneMap: Record<string, StatusTone> = {
  active: "success",
  expired: "warning",
  cancelled: "danger",
  pending: "info",
};
