import type { ReactNode } from "react";
import {
  COMMUNITY_STATUS,
  type CommunityStatus,
  type IForumPostAuthor,
} from "@/redux/features/community/community.types";

export interface CommunityStatusConfig {
  label: string;
  tagColor: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

export const COMMUNITY_STATUS_CONFIG: Record<string, CommunityStatusConfig> = {
  [COMMUNITY_STATUS.PUBLISHED]: {
    label: "Published",
    tagColor: "success",
    badgeBg: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  [COMMUNITY_STATUS.DRAFT]: {
    label: "Draft",
    tagColor: "warning",
    badgeBg: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  [COMMUNITY_STATUS.ARCHIVED]: {
    label: "Archived",
    tagColor: "default",
    badgeBg: "bg-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
  },
};

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatPostDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function getAuthorInfo(author?: IForumPostAuthor | null) {
  if (!author) {
    return {
      id: "",
      name: "Administrator",
      email: "",
      image: "",
      role: "ADMIN",
    };
  }

  return {
    id: author._id || "",
    name: author.name || "Administrator",
    email: author.email || "",
    image: author.image || "",
    role: author.role || "ADMIN",
  };
}
