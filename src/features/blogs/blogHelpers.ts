import dayjs from "dayjs";
import type {
  IBlog,
  IBlogCategoryRef,
  IBlogAuthor,
} from "@/redux/features/blogs/blogs.types";
import { BLOG_STATUS } from "@/redux/features/blogs/blogs.types";

export const BLOG_STATUS_CONFIG = {
  [BLOG_STATUS.PUBLISHED]: {
    label: "Published",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    color: "green",
  },
  [BLOG_STATUS.DRAFT]: {
    label: "Draft",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    color: "gold",
  },
  [BLOG_STATUS.ARCHIVED]: {
    label: "Archived",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    color: "default",
  },
} as const;

export function formatBlogDate(dateStr?: string | null): string {
  if (!dateStr) return "Not published";
  return dayjs(dateStr).format("MMM D, YYYY");
}

export function formatBlogDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return dayjs(dateStr).format("MMM D, YYYY · h:mm A");
}

export function estimateReadTime(htmlContent?: string): string {
  if (!htmlContent) return "1 min read";
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export function getCategoryName(category: IBlog["category"]): string {
  if (!category) return "Uncategorized";
  if (typeof category === "object" && category !== null) {
    return (category as IBlogCategoryRef).name || "Uncategorized";
  }
  return String(category);
}

export function getCategoryId(category: IBlog["category"]): string {
  if (!category) return "";
  if (typeof category === "object" && category !== null) {
    return (category as IBlogCategoryRef)._id || "";
  }
  return String(category);
}

export function getAuthorInfo(author?: IBlog["author"]): {
  name: string;
  email: string;
  image?: string;
} {
  if (typeof author === "object" && author !== null) {
    const authObj = author as IBlogAuthor;
    return {
      name: authObj.name || "Editorial Staff",
      email: authObj.email || "",
      image: authObj.image,
    };
  }
  return { name: "Admin", email: "" };
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
