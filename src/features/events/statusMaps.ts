import type { StatusTone } from "@/types/common";
import {
  EVENT_STATUS,
  EVENT_TYPE,
  type EventStatus,
  type EventType,
} from "@/redux/features/events/events.types";

export const eventStatusToneMap: Record<EventStatus, StatusTone> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  COMPLETED: "info",
  CANCELLED: "danger",
};

export const eventStatusLabelMap: Record<EventStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const eventStatusDotClassMap: Record<EventStatus, string> = {
  DRAFT: "bg-mist-500",
  PUBLISHED: "bg-success",
  COMPLETED: "bg-info",
  CANCELLED: "bg-danger",
};

export const eventTypeLabelMap: Record<EventType, string> = {
  NETWORKING: "Networking",
  CONFERENCE: "Conference",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  MEETUP: "Meetup",
  SOCIAL: "Social",
  OTHER: "Other",
};

export const eventTypeToneMap: Record<EventType, StatusTone> = {
  NETWORKING: "violet",
  CONFERENCE: "info",
  WORKSHOP: "gold",
  SEMINAR: "success",
  MEETUP: "warning",
  SOCIAL: "violet",
  OTHER: "neutral",
};

export function normalizeEventStatus(status?: string): EventStatus {
  const value = status?.trim().toUpperCase();
  if (value && value in EVENT_STATUS) return value as EventStatus;
  return EVENT_STATUS.DRAFT;
}

export function normalizeEventType(type?: string): EventType {
  const value = type?.trim().toUpperCase();
  if (value && value in EVENT_TYPE) return value as EventType;
  return EVENT_TYPE.OTHER;
}
