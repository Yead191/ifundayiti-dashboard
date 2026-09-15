export const EVENT_CATEGORY = {
  FUNDRAISER: "fundraiser",
  PITCH_NIGHT: "pitch-night",
  WORKSHOP: "workshop",
  GALA: "gala",
} as const;

export type EventCategory = (typeof EVENT_CATEGORY)[keyof typeof EVENT_CATEGORY];

export const EVENT_FORMAT = {
  PHYSICAL: "physical",
  VIRTUAL: "virtual",
  HYBRID: "hybrid",
} as const;

export type EventFormat = (typeof EVENT_FORMAT)[keyof typeof EVENT_FORMAT];

export const EVENT_PRICING_TYPE = {
  FREE: "free",
  PAID: "paid",
} as const;

export type EventPricingType = (typeof EVENT_PRICING_TYPE)[keyof typeof EVENT_PRICING_TYPE];

export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export interface IEventSpeaker {
  name: string;
  role: string;
  avatar?: string;
}

export interface IEvent {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  category: EventCategory | string;
  type: EventFormat | string;
  pricingType: EventPricingType | string;
  price: number;
  capacity: number;
  reservedCount: number;
  remainingSeats: number;
  startDate: string;
  eventDate?: string;
  endDate: string;
  location: string;
  venueAddress?: string;
  dressCode?: string;
  virtualLink?: string;
  featured: boolean;
  image?: string;
  status: EventStatus | string;
  speakers?: IEventSpeaker[];
  organization?: {
    name: string;
    designation: string;
    email: string;
  };
  tags?: string[];
  isFeatured?: boolean;
  coverImage?: string;
  images?: string[];
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
  category?: string;
  type?: string;
  pricingType?: string;
  status?: string;
  featured?: boolean;
  sort?: string;
}

export interface EventsListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: IEvent[];
}

export interface EventDetailResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IEvent;
}

export interface EventMutationResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: IEvent;
}

export interface EventStatsOverview {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalReservedSeats: number;
  totalCapacity: number;
  totalEstimatedRevenue: number;
}

export interface EventStatsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: EventStatsOverview;
}

export interface EventFormValues {
  title: string;
  description: string;
  category: EventCategory | string;
  type: EventFormat | string;
  pricingType: EventPricingType | string;
  price: number;
  capacity: number;
  startDate: string;
  endDate: string;
  location: string;
  venueAddress?: string;
  dressCode?: string;
  virtualLink?: string;
  featured: boolean;
  status: EventStatus | string;
  image?: string;
  speakers?: IEventSpeaker[];
}

export type ApiEvent = IEvent;
export type EventType = EventFormat;
export const EVENT_TYPE = {
  ...EVENT_FORMAT,
  WORKSHOP: "workshop",
} as const;

export const EVENT_TYPE_OPTIONS = ["physical", "virtual", "hybrid"] as const;
export const EVENT_STATUS_OPTIONS = ["draft", "published", "cancelled", "completed"] as const;


export interface EventFormPayload {
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  location: string;
  type: string;
  status: string;
  isFeatured: boolean;
  organization: {
    name: string;
    designation: string;
    email: string;
  };
  tags: string[];
  coverImageFile?: File | null;
  imageFiles?: File[];
}

