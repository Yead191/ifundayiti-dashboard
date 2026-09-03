import { baseApi } from "../../api/baseApi";
import type {
  GalleryListParams,
  GalleryListResponse,
  GallerySingleResponse,
  GalleryStatsResponse,
  ChangeGalleryStatusPayload,
} from "./gallery.types";

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGalleries: builder.query<GalleryListResponse, GalleryListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.category && params.category !== "all") {
            queryParams.append("category", params.category);
          }
          if (params.status && params.status !== "all") {
            queryParams.append("status", params.status);
          }
          if (params.featured !== undefined) {
            queryParams.append("featured", String(params.featured));
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/gallery${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Galleries" as const,
                id: _id,
              })),
              { type: "Galleries", id: "LIST" },
            ]
          : [{ type: "Galleries", id: "LIST" }],
    }),

    getGalleryStats: builder.query<GalleryStatsResponse, void>({
      query: () => ({
        url: "/gallery/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Galleries" as const, id: "STATS" }],
    }),

    getGalleryById: builder.query<GallerySingleResponse, string>({
      query: (id) => ({
        url: `/gallery/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Galleries", id }],
    }),

    createGallery: builder.mutation<GallerySingleResponse, FormData>({
      query: (body) => ({
        url: "/gallery",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Galleries", id: "LIST" },
        { type: "Galleries", id: "STATS" },
      ],
    }),

    updateGallery: builder.mutation<
      GallerySingleResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/gallery/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Galleries", id },
        { type: "Galleries", id: "LIST" },
        { type: "Galleries", id: "STATS" },
      ],
    }),

    updateGalleryStatus: builder.mutation<
      GallerySingleResponse,
      { id: string; body: ChangeGalleryStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/gallery/status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Galleries", id },
        { type: "Galleries", id: "LIST" },
        { type: "Galleries", id: "STATS" },
      ],
    }),

    toggleGalleryFeatured: builder.mutation<GallerySingleResponse, string>({
      query: (id) => ({
        url: `/gallery/featured/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Galleries", id },
        { type: "Galleries", id: "LIST" },
        { type: "Galleries", id: "STATS" },
      ],
    }),

    deleteGallery: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/gallery/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Galleries", id: "LIST" },
        { type: "Galleries", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGalleriesQuery,
  useGetGalleryStatsQuery,
  useGetGalleryByIdQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useUpdateGalleryStatusMutation,
  useToggleGalleryFeaturedMutation,
  useDeleteGalleryMutation,
} = galleryApi;
