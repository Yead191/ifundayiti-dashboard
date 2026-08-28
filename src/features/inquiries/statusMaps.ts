import type { StatusTone } from "@/types/common";
import type { InquiryStatus, ProjectBudget } from "@/redux/features/inquiries/inquiries.types";

export const inquiryStatusLabelMap: Record<InquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  MEETING_SCHEDULED: "Meeting scheduled",
  PROPOSAL_SENT: "Proposal sent",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

export const inquiryStatusToneMap: Record<InquiryStatus, StatusTone> = {
  NEW: "info",
  CONTACTED: "violet",
  MEETING_SCHEDULED: "warning",
  PROPOSAL_SENT: "gold",
  COMPLETED: "success",
  CLOSED: "neutral",
};

export const inquiryStatusDotClassMap: Record<InquiryStatus, string> = {
  NEW: "bg-info",
  CONTACTED: "bg-violet-glow",
  MEETING_SCHEDULED: "bg-warning",
  PROPOSAL_SENT: "bg-[#f5b544]",
  COMPLETED: "bg-success",
  CLOSED: "bg-mist-600",
};

export const inquiryStatusSelectClassMap: Record<InquiryStatus, string> = {
  NEW: "!border-info/45 !bg-info/12 [&_.ant-select-selection-item]:!text-info",
  CONTACTED: "!border-violet-600/45 !bg-violet-600/12 [&_.ant-select-selection-item]:!text-violet-glow",
  MEETING_SCHEDULED: "!border-warning/45 !bg-warning/12 [&_.ant-select-selection-item]:!text-warning",
  PROPOSAL_SENT: "!border-warning/45 !bg-warning/10 [&_.ant-select-selection-item]:!text-[#f5b544]",
  COMPLETED: "!border-success/45 !bg-success/12 [&_.ant-select-selection-item]:!text-success",
  CLOSED: "!border-white/15 !bg-white/[0.06] [&_.ant-select-selection-item]:!text-mist-400",
};

export const budgetLabelMap: Record<ProjectBudget, string> = {
  UNDER_100: "Under $100",
  "100_300": "$100 – $300",
  "300_500": "$300 – $500",
  "600_1000": "$600 – $1,000",
  ABOVE_1000: "Above $1,000",
};
