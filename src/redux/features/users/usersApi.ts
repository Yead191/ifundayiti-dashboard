import { baseApi } from "../../api/baseApi";
import type {
  ApiUser,
  GetUsersParams,
  SingleUserResponse,
  UserMutationResponse,
  UsersListResponse,
  UserStatsResponse,
} from "./users.types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserStats: builder.query<UserStatsResponse, void>({
      query: () => ({
        url: "/user/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Users", id: "STATS" }],
    }),

    getUsers: builder.query<UsersListResponse, GetUsersParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          page: 1,
          limit: 10,
        };

        if (params) {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.searchTerm = params.searchTerm.trim();
          }
          if (params.role && params.role !== "all") {
            queryParams.role = params.role;
          }
          if (params.status && params.status !== "all") {
            queryParams.status = params.status;
          }
          if (params.verified !== undefined) {
            queryParams.verified = params.verified;
          }
          if (params.sort) {
            queryParams.sort = params.sort;
          }
        }

        return {
          url: "/user",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Users" as const, id: _id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query<SingleUserResponse, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Users", id }],
    }),

    changeUserStatus: builder.mutation<
      SingleUserResponse,
      { id: string; status?: string; rejectionReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/user/change-status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Users", id: arg.id },
        { type: "Users", id: "LIST" },
        { type: "Users", id: "STATS" },
        "Dashboard",
      ],
    }),

    updateUser: builder.mutation<
      SingleUserResponse,
      { id: string; data: Partial<ApiUser> }
    >({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Users", id: arg.id },
        { type: "Users", id: "LIST" },
        { type: "Users", id: "STATS" },
        "Dashboard",
      ],
    }),

    deleteUser: builder.mutation<UserMutationResponse, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Users", id: "STATS" },
        "Dashboard",
      ],
    }),

    deleteMultipleUsers: builder.mutation<
      { success: boolean; data: { deletedCount: number } },
      string[]
    >({
      query: (ids) => ({
        url: "/user/delete-multiple",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Users", id: "STATS" },
        "Dashboard",
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUserStatsQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useChangeUserStatusMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useDeleteMultipleUsersMutation,
} = usersApi;
