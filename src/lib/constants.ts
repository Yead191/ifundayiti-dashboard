/** Shared expert/service categories — used by both Services and Vendors modules. */
export const EXPERT_CATEGORIES = [
  "Business Consultant",
  "Corporation & Formation",
  "Tax Strategy",
  "Legal Counsel",
  "Brand Strategy",
  "Growth Marketing",
  "Fundraising",
  "Finance & Accounting",
  "Operations",
  "Sales",
  "Human Resources",
  "Data & Analytics",
] as const;

export type ExpertCategory = (typeof EXPERT_CATEGORIES)[number];

export const CURRENCY_OPTIONS = ["$", "€", "£"] as const;
