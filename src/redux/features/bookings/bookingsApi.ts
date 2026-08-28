import { baseApi } from "../../api/baseApi";
import type {
  BookingMutationResponse,
  BookingStatus,
  BookingsListResponse,
  GetBookingsParams,
} from "./bookings.types";

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<BookingsListResponse, GetBookingsParams | void>({
      query: (params) => ({
        url: "/bookings",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.serviceId ? { service: params.serviceId } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.startDate ? { startDate: params.startDate } : {}),
          ...(params?.endDate ? { endDate: params.endDate } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Bookings" as const, id: _id })),
              { type: "Bookings", id: "LIST" },
            ]
          : [{ type: "Bookings", id: "LIST" }],
    }),

    updateBookingStatus: builder.mutation<
      BookingMutationResponse,
      { id: string; status: BookingStatus }
    >({
      query: ({ id, status }) => ({
        url: `/bookings/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Bookings", id: arg.id },
        { type: "Bookings", id: "LIST" },
      ],
    }),

    deleteBooking: builder.mutation<BookingMutationResponse, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Bookings", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
} = bookingsApi;
