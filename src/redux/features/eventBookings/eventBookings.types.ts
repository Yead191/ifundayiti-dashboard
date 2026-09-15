import type { IEvent } from "../events/events.types";

export type EventBookingStatus = "pending" | "confirmed" | "attended" | "cancelled";
export type EventBookingPaymentStatus = "pending" | "paid" | "free" | "failed";

export interface IEventRef {
  _id: string;
  title: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  venueAddress?: string;
  price?: number;
  image?: string;
  dressCode?: string;
  virtualLink?: string;
}

export interface IEventBooking {
  _id: string;
  event: IEventRef | IEvent | string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  quantity: number;
  price: number;
  ticketCode: string;
  status: EventBookingStatus | string;
  paymentStatus: EventBookingPaymentStatus | string;
  checkedIn: boolean;
  checkedInAt?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetEventBookingsParams {
  page?: number;
  limit?: number;
  event?: string;
  status?: string;
  paymentStatus?: string;
  checkedIn?: boolean;
  searchTerm?: string;
  sort?: string;
}

export interface EventBookingsListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: IEventBooking[];
}

export interface SingleEventBookingResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IEventBooking;
}

export interface CheckInResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: {
    alreadyCheckedIn: boolean;
    message: string;
    booking: IEventBooking;
  };
}

export interface UpdateBookingStatusPayload {
  status?: EventBookingStatus | string;
  note?: string;
}
