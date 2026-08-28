import { baseApi } from "../../api/baseApi";
import type {
  EventDetailResponse,
  EventMutationResponse,
  EventsListResponse,
  GetEventsParams,
} from "./events.types";

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventsListResponse, GetEventsParams | void>({
      query: (params) => ({
        url: "/event",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.type ? { type: params.type } : {}),
          ...(typeof params?.isFeatured === "boolean"
            ? { isFeatured: params.isFeatured }
            : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Events" as const, id: _id })),
              { type: "Events", id: "LIST" },
            ]
          : [{ type: "Events", id: "LIST" }],
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

    createEvent: builder.mutation<EventMutationResponse, FormData>({
      query: (body) => ({
        url: "/event",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Events", id: "LIST" }, "Dashboard"],
    }),

    updateEvent: builder.mutation<EventMutationResponse, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/event/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Events", id: arg.id },
        { type: "Events", id: "LIST" },
        "Dashboard",
      ],
    }),

    deleteEvent: builder.mutation<EventMutationResponse, string>({
      query: (id) => ({
        url: `/event/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Events", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEventsQuery,
  useGetEventBySlugQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;
