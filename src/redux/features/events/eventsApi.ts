import { baseApi } from "../../api/baseApi";
import type {
  EventDetailResponse,
  EventMutationResponse,
  EventStatsResponse,
  EventsListResponse,
  GetEventsParams,
} from "./events.types";

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventsListResponse, GetEventsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          page: 1,
          limit: 10,
        };

        if (params) {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
          if (params.category && params.category !== "all")
            queryParams.category = params.category;
          if (params.type && params.type !== "all")
            queryParams.type = params.type;
          if (params.pricingType && params.pricingType !== "all")
            queryParams.pricingType = params.pricingType;
          if (params.status && params.status !== "all")
            queryParams.status = params.status;
          if (typeof params.featured === "boolean")
            queryParams.featured = params.featured;
          if (params.sort) queryParams.sort = params.sort;
        }

        return {
          url: "/event",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Events" as const,
                id: _id,
              })),
              { type: "Events", id: "LIST" },
            ]
          : [{ type: "Events", id: "LIST" }],
    }),

    getEventById: builder.query<EventDetailResponse, string>({
      query: (id) => ({
        url: `/event/${id}`,
        method: "GET",
      }),
      providesTags: (result, _err, id) =>
        result?.data?._id
          ? [{ type: "Events", id: result.data._id }]
          : [{ type: "Events", id }],
    }),

    getEventBySlug: builder.query<EventDetailResponse, string>({
      query: (slug) => ({
        url: `/event/${slug}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data?._id
          ? [{ type: "Events", id: result.data._id }]
          : [{ type: "Events", id: "LIST" }],
    }),

    getEventStatsOverview: builder.query<EventStatsResponse, void>({
      query: () => ({
        url: "/event/stats/overview",
        method: "GET",
      }),
      providesTags: [{ type: "Events", id: "STATS" }],
    }),

    createEvent: builder.mutation<
      EventMutationResponse,
      Record<string, any> | FormData
    >({
      query: (body) => ({
        url: "/event",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Events", id: "LIST" },
        { type: "Events", id: "STATS" },
        "Dashboard",
      ],
    }),

    updateEvent: builder.mutation<
      EventMutationResponse,
      { id: string; body: Record<string, any> | FormData }
    >({
      query: ({ id, body }) => ({
        url: `/event/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Events", id: arg.id },
        { type: "Events", id: "LIST" },
        { type: "Events", id: "STATS" },
        "Dashboard",
      ],
    }),

    deleteEvent: builder.mutation<EventMutationResponse, string>({
      query: (id) => ({
        url: `/event/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Events", id: "LIST" },
        { type: "Events", id: "STATS" },
        "Dashboard",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetEventBySlugQuery,
  useGetEventStatsOverviewQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;
