import type { StatusTone } from "@/types/common";
import type { PostStatus } from "@/redux/features/forum/forum.types";

export const postStatusToneMap: Record<PostStatus, StatusTone> = {
  reported: "warning",
  published: "success",
  removed: "danger",
};

export const postStatusLabelMap: Record<PostStatus, string> = {
  reported: "Reported",
  published: "Published",
  removed: "Removed",
};

export const postStatusDotClassMap: Record<PostStatus, string> = {
  reported: "bg-warning",
  published: "bg-success",
  removed: "bg-danger",
};

export const reportStatusToneMap: Record<string, StatusTone> = {
  pending: "warning",
  resolved: "success",
  dismissed: "neutral",
};
