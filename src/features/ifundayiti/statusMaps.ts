import type { StatusTone } from "@/types/common";
import type { ApplicationStatus, PeriodStatus } from "./types";

export const statusToneMap: Record<ApplicationStatus, StatusTone> = {
  submitted: "info",
  underReview: "warning",
  approved: "success",
  rejected: "danger",
  finalist: "violet",
  winner: "gold",
  archived: "neutral",
};

export const statusLabelMap: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  underReview: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  finalist: "Finalist",
  winner: "Winner",
  archived: "Archived",
};

/** Canonical order the statuses flow through — used for tab ordering. */
export const STATUS_ORDER: ApplicationStatus[] = [
  "submitted",
  "underReview",
  "approved",
  "rejected",
  "finalist",
  "winner",
  "archived",
];

/** Hex colors used for chart fills — aligned with the app palette. */
export const statusColorMap: Record<ApplicationStatus, string> = {
  submitted: "#5cc8f5",
  underReview: "#f5b544",
  approved: "#34d399",
  rejected: "#f2617a",
  finalist: "#9d5cf5",
  winner: "#ffd166",
  archived: "#6b7299",
};

export const periodStatusToneMap: Record<PeriodStatus, StatusTone> = {
  Upcoming: "info",
  Open: "success",
  Review: "warning",
  WinnerSelection: "violet",
  Closed: "neutral",
};

export const periodStatusLabelMap: Record<PeriodStatus, string> = {
  Upcoming: "Upcoming",
  Open: "Open",
  Review: "Review",
  WinnerSelection: "Winner Selection",
  Closed: "Closed",
};
