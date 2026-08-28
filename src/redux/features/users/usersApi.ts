import { baseApi } from "../../api/baseApi";
import type {
  ChangeUserStatusPayload,
  GetUsersParams,
  UserMutationResponse,
  UsersListResponse,
} from "./users.types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersListResponse, GetUsersParams | void>({
      query: (params) => ({
        url: "/user",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.hasSubscription ? { hasSubscription: true } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Users" as const, id: _id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    changeUserStatus: builder.mutation<
      UserMutationResponse,
      { id: string; body: ChangeUserStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/user/change-status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Users", id: arg.id },
        { type: "Users", id: "LIST" },
        "Dashboard",
      ],
    }),

    deleteUser: builder.mutation<UserMutationResponse, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;
