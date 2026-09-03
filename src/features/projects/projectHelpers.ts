import type { ProjectCategory, ProjectStatus } from "@/redux/features/projects/project.types";

export const CATEGORY_CONFIG: Record<
  ProjectCategory,
  { label: string; color: string; bg: string; text: string; border: string }
> = {
  "Food & Agriculture": {
    label: "Food & Agriculture",
    color: "green",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/20",
  },
  "Clean Energy": {
    label: "Clean Energy",
    color: "gold",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/20",
  },
  "Water & Sanitation": {
    label: "Water & Sanitation",
    color: "cyan",
    bg: "bg-cyan-500/10",
    text: "text-cyan-700",
    border: "border-cyan-500/20",
  },
  Education: {
    label: "Education",
    color: "blue",
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/20",
  },
  Healthcare: {
    label: "Healthcare",
    color: "magenta",
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/20",
  },
  Livelihood: {
    label: "Livelihood",
    color: "lime",
    bg: "bg-lime-500/10",
    text: "text-lime-700",
    border: "border-lime-500/20",
  },
  "Small Business": {
    label: "Small Business",
    color: "purple",
    bg: "bg-purple-500/10",
    text: "text-purple-700",
    border: "border-purple-500/20",
  },
  "Community Development": {
    label: "Community Development",
    color: "geekblue",
    bg: "bg-indigo-500/10",
    text: "text-indigo-700",
    border: "border-indigo-500/20",
  },
  Environment: {
    label: "Environment",
    color: "green",
    bg: "bg-teal-500/10",
    text: "text-teal-700",
    border: "border-teal-500/20",
  },
  "Arts & Crafts": {
    label: "Arts & Crafts",
    color: "orange",
    bg: "bg-orange-500/10",
    text: "text-orange-700",
    border: "border-orange-500/20",
  },
  Other: {
    label: "Other",
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/20",
  },
};

export const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: "success" | "warning" | "default"; bg: string; text: string; border: string }
> = {
  Published: {
    label: "Published",
    color: "success",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/30",
  },
  Draft: {
    label: "Draft",
    color: "warning",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/30",
  },
  Archived: {
    label: "Archived",
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/30",
  },
};

export function formatGrantAmount(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
