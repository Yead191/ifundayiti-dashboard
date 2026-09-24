import { baseApi } from "../../api/baseApi";
import type {
  CheckInResponse,
  EventBookingsListResponse,
  GetEventBookingsParams,
  SingleEventBookingResponse,
  UpdateBookingStatusPayload,
} from "./eventBookings.types";

export const eventBookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventBookings: builder.query<EventBookingsListResponse, GetEventBookingsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          page: 1,
          limit: 10,
        };

        if (params) {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.event && params.event !== "all") queryParams.event = params.event;
          if (params.status && params.status !== "all") queryParams.status = params.status;
          if (params.paymentStatus && params.paymentStatus !== "all") {
            queryParams.paymentStatus = params.paymentStatus;
          }
          if (typeof params.checkedIn === "boolean") queryParams.checkedIn = params.checkedIn;
          if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
          if (params.sort) queryParams.sort = params.sort;
        }

        return {
          url: "/booking",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Bookings" as const, id: _id })),
              { type: "Bookings", id: "LIST" },
            ]
          : [{ type: "Bookings", id: "LIST" }],
    }),

    getEventBookingById: builder.query<SingleEventBookingResponse, string>({
      query: (id) => ({
        url: `/booking/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Bookings", id }],
    }),

    checkInTicket: builder.mutation<CheckInResponse, { ticketCode: string }>({
      query: ({ ticketCode }) => ({
        url: `/booking/check-in/${encodeURIComponent(ticketCode.trim())}`,
        method: "POST",
      }),
      invalidatesTags: () => [
        { type: "Bookings", id: "LIST" },
        { type: "Events", id: "STATS" },
      ],
    }),

    updateEventBookingStatus: builder.mutation<
      SingleEventBookingResponse,
      { id: string; body: UpdateBookingStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/booking/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Bookings", id: arg.id },
        { type: "Bookings", id: "LIST" },
        { type: "Events", id: "LIST" },
        { type: "Events", id: "STATS" },
      ],
    }),

    deleteEventBooking: builder.mutation<any, string>({
      query: (id) => ({
        url: `/booking/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Bookings", id: "LIST" },
        { type: "Events" },
        { type: "Events", id: "LIST" },
        { type: "Events", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEventBookingsQuery,
  useGetEventBookingByIdQuery,
  useCheckInTicketMutation,
  useUpdateEventBookingStatusMutation,
  useDeleteEventBookingMutation,
} = eventBookingsApi;
