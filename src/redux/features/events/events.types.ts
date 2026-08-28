export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const EVENT_TYPE = {
  NETWORKING: "NETWORKING",
  CONFERENCE: "CONFERENCE",
  WORKSHOP: "WORKSHOP",
  SEMINAR: "SEMINAR",
  MEETUP: "MEETUP",
  SOCIAL: "SOCIAL",
  OTHER: "OTHER",
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export const EVENT_STATUS_OPTIONS = Object.values(EVENT_STATUS);
export const EVENT_TYPE_OPTIONS = Object.values(EVENT_TYPE);

export interface EventOrganization {
  name: string;
  designation: string;
  email: string;
}

export interface ApiEvent {
  _id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  endDate: string;
  location: string;
  coverImage: string;
  images: string[];
  type: EventType | string;
  status: EventStatus | string;
  organization: EventOrganization;
  tags: string[];
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: EventStatus;
  type?: EventType;
  isFeatured?: boolean;
}

export interface EventsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiEvent[];
}

export interface EventDetailResponse {
  success: boolean;
  message: string;
  data: ApiEvent;
}

export interface EventMutationResponse {
  success: boolean;
  message: string;
  data?: ApiEvent;
}

/** Values collected by the form before building multipart FormData. */
export interface EventFormPayload {
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  location: string;
  type: EventType;
  status: EventStatus;
  organization: EventOrganization;
  tags: string[];
  isFeatured: boolean;
  coverImageFile?: File | null;
  imageFiles?: File[];
}
