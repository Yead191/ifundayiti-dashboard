export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "refunded" | "pending";

export interface BookingServiceRef {
  _id: string;
  title: string;
}

export interface BookingUserRef {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface ApiBooking {
  _id: string;
  service: BookingServiceRef;
  user: BookingUserRef;
  preferredDate: string;
  preferredTime: string;
  note: string;
  phone?: string;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  serviceId?: string;
  status?: BookingStatus | "";
  startDate?: string;
  endDate?: string;
}

export interface BookingsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiBooking[];
}

export interface BookingMutationResponse {
  success: boolean;
  message: string;
  data?: ApiBooking;
}

export const BOOKING_STATUS_OPTIONS: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];
