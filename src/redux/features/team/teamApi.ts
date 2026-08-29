import { baseApi } from "../../api/baseApi";
import type {
  TeamListParams,
  TeamListResponse,
  TeamSingleResponse,
  TeamStatsResponse,
  ChangeTeamStatusPayload,
} from "./team.types";

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeamStats: builder.query<TeamStatsResponse, void>({
      query: () => ({
        url: "/team/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Team" as const, id: "STATS" }],
    }),

    getTeamMembers: builder.query<TeamListResponse, TeamListParams | void>({
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
        }
        const qs = queryParams.toString();
        return {
          url: `/team${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Team" as const, id: _id })),
              { type: "Team", id: "LIST" },
            ]
          : [{ type: "Team", id: "LIST" }],
    }),

    getTeamMemberById: builder.query<TeamSingleResponse, string>({
      query: (id) => ({
        url: `/team/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Team", id }],
    }),

    createTeamMember: builder.mutation<TeamSingleResponse, FormData>({
      query: (body) => ({
        url: "/team",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Team", id: "LIST" },
        { type: "Team", id: "STATS" },
      ],
    }),

    updateTeamMember: builder.mutation<
      TeamSingleResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/team/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Team", id },
        { type: "Team", id: "LIST" },
        { type: "Team", id: "STATS" },
      ],
    }),

    changeTeamStatus: builder.mutation<
      TeamSingleResponse,
      { id: string; body: ChangeTeamStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/team/change-status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Team", id },
        { type: "Team", id: "LIST" },
        { type: "Team", id: "STATS" },
      ],
    }),

    deleteTeamMember: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/team/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Team", id: "LIST" },
        { type: "Team", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTeamStatsQuery,
  useGetTeamMembersQuery,
  useGetTeamMemberByIdQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useChangeTeamStatusMutation,
  useDeleteTeamMemberMutation,
} = teamApi;
