import dayjs from "dayjs";
import type {
  GalleryCategory,
  GalleryStatus,
} from "@/redux/features/gallery/gallery.types";

export const GALLERY_CATEGORY_CONFIG: Record<
  GalleryCategory,
  { label: string; color: string; bg: string; text: string; border: string }
> = {
  "Community Outreach": {
    label: "Community Outreach",
    color: "blue",
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/20",
  },
  "Grant Programs": {
    label: "Grant Programs",
    color: "gold",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/20",
  },
  Education: {
    label: "Education",
    color: "geekblue",
    bg: "bg-indigo-500/10",
    text: "text-indigo-700",
    border: "border-indigo-500/20",
  },
  "Food & Agriculture": {
    label: "Food & Agriculture",
    color: "green",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/20",
  },
  Healthcare: {
    label: "Healthcare",
    color: "magenta",
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/20",
  },
  "Community Development": {
    label: "Community Development",
    color: "purple",
    bg: "bg-purple-500/10",
    text: "text-purple-700",
    border: "border-purple-500/20",
  },
  Entrepreneurship: {
    label: "Entrepreneurship",
    color: "cyan",
    bg: "bg-cyan-500/10",
    text: "text-cyan-700",
    border: "border-cyan-500/20",
  },
  Environment: {
    label: "Environment",
    color: "green",
    bg: "bg-teal-500/10",
    text: "text-teal-700",
    border: "border-teal-500/20",
  },
  Events: {
    label: "Events",
    color: "volcano",
    bg: "bg-orange-500/10",
    text: "text-orange-700",
    border: "border-orange-500/20",
  },
  Volunteering: {
    label: "Volunteering",
    color: "lime",
    bg: "bg-lime-500/10",
    text: "text-lime-700",
    border: "border-lime-500/20",
  },
  "Success Stories": {
    label: "Success Stories",
    color: "pink",
    bg: "bg-pink-500/10",
    text: "text-pink-700",
    border: "border-pink-500/20",
  },
  Other: {
    label: "Other",
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/20",
  },
};

export const GALLERY_STATUS_CONFIG: Record<
  GalleryStatus,
  {
    label: string;
    color: "success" | "warning" | "default";
    bg: string;
    text: string;
    border: string;
  }
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
    text: "text-slate-600",
    border: "border-slate-500/30",
  },
};

export function formatGalleryDate(dateStr?: string | Date): string {
  if (!dateStr) return "—";
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format("MMM D, YYYY") : "—";
}
