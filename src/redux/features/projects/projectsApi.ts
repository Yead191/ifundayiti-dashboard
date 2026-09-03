import { baseApi } from "../../api/baseApi";
import type {
  ProjectListParams,
  ProjectListResponse,
  ProjectSingleResponse,
  ChangeProjectStatusPayload,
} from "./project.types";

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectListResponse, ProjectListParams | void>({
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
          url: `/project${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result?.data?.map(({ _id }) => ({
                type: "Projects" as const,
                id: _id,
              })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
    }),

    getProjectStats: builder.query<
      { success: boolean; message: string; data: import("./project.types").ProjectStats },
      void
    >({
      query: () => ({
        url: "/project/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Projects" as const, id: "STATS" }],
    }),

    getProjectById: builder.query<ProjectSingleResponse, string>({
      query: (id) => ({
        url: `/project/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Projects", id }],
    }),

    createProject: builder.mutation<ProjectSingleResponse, FormData>({
      query: (body) => ({
        url: "/project",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Projects", id: "LIST" },
        { type: "Projects", id: "STATS" },
      ],
    }),

    updateProject: builder.mutation<
      ProjectSingleResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/project/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Projects", id },
        { type: "Projects", id: "LIST" },
        { type: "Projects", id: "STATS" },
      ],
    }),

    updateProjectStatus: builder.mutation<
      ProjectSingleResponse,
      { id: string; body: ChangeProjectStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/project/status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Projects", id },
        { type: "Projects", id: "LIST" },
        { type: "Projects", id: "STATS" },
      ],
    }),

    toggleProjectFeatured: builder.mutation<ProjectSingleResponse, string>({
      query: (id) => ({
        url: `/project/toggle-featured/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Projects", id },
        { type: "Projects", id: "LIST" },
        { type: "Projects", id: "STATS" },
      ],
    }),

    deleteProject: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/project/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Projects", id: "LIST" },
        { type: "Projects", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useGetProjectStatsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation,
  useToggleProjectFeaturedMutation,
  useDeleteProjectMutation,
} = projectsApi;
