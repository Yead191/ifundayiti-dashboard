import { baseApi } from "../../api/baseApi";
import type {
  GalleryListParams,
  GalleryListResponse,
  GallerySingleResponse,
  FolderListParams,
  FolderListResponse,
  FolderSingleResponse,
  FolderStatsResponse,
  ChangeFolderStatusPayload,
} from "./gallery.types";

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Folders (Albums)
    getFolders: builder.query<FolderListResponse, FolderListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.category && params.category !== "all" && params.category !== "ALL") {
            queryParams.append("category", params.category);
          }
          if (params.status && params.status !== "all" && params.status !== "ALL") {
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
          url: `/folder${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Folders" as const,
                id: _id,
              })),
              { type: "Folders", id: "LIST" },
            ]
          : [{ type: "Folders", id: "LIST" }],
    }),

    getFolderById: builder.query<FolderSingleResponse, string>({
      query: (id) => ({
        url: `/folder/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Folders", id }],
    }),

    getFolderStats: builder.query<FolderStatsResponse, void>({
      query: () => ({
        url: "/folder/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Folders" as const, id: "STATS" }],
    }),

    createFolder: builder.mutation<FolderSingleResponse, FormData>({
      query: (body) => ({
        url: "/folder",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
      ],
    }),

    updateFolder: builder.mutation<
      FolderSingleResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/folder/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Folders", id },
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
      ],
    }),

    updateFolderStatus: builder.mutation<
      FolderSingleResponse,
      { id: string; body: ChangeFolderStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/folder/status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Folders", id },
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
      ],
    }),

    toggleFolderFeatured: builder.mutation<FolderSingleResponse, string>({
      query: (id) => ({
        url: `/folder/featured/${id}`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Folders", id },
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
      ],
    }),

    deleteFolder: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/folder/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
        { type: "Galleries", id: "LIST" },
      ],
    }),

    // Galleries (Photos inside Albums)
    getGalleries: builder.query<GalleryListResponse, GalleryListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
          if (params.folder) {
            queryParams.append("folder", params.folder);
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

    getGalleryById: builder.query<GallerySingleResponse, string>({
      query: (id) => ({
        url: `/gallery/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Galleries", id }],
    }),

    createGallery: builder.mutation<
      { success: boolean; message: string; data: any },
      FormData
    >({
      query: (body) => ({
        url: "/gallery",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Galleries", id: "LIST" },
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
      ],
    }),

    updateGallery: builder.mutation<
      GallerySingleResponse,
      { id: string; body: FormData | { caption?: string; folder?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/gallery/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Galleries", id },
        { type: "Galleries", id: "LIST" },
        { type: "Folders", id: "LIST" },
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
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
      ],
    }),

    deleteMultipleGalleries: builder.mutation<
      { success: boolean; message: string },
      { ids: string[] }
    >({
      query: (body) => ({
        url: "/gallery/delete-multiple",
        method: "DELETE",
        body,
      }),
      invalidatesTags: [
        { type: "Galleries", id: "LIST" },
        { type: "Folders", id: "LIST" },
        { type: "Folders", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFoldersQuery,
  useGetFolderByIdQuery,
  useGetFolderStatsQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useUpdateFolderStatusMutation,
  useToggleFolderFeaturedMutation,
  useDeleteFolderMutation,
  useGetGalleriesQuery,
  useGetGalleryByIdQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
  useDeleteMultipleGalleriesMutation,
} = galleryApi;
