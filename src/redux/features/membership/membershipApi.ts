import { baseApi } from "../../api/baseApi";
import type {
  GetMembershipsParams,
  GetSubscribersParams,
  MembershipFormPayload,
  MembershipMutationResponse,
  MembershipsListResponse,
  SubscribersListResponse,
} from "./membership.types";

export const membershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberships: builder.query<MembershipsListResponse, GetMembershipsParams>({
      query: (params) => ({
        url: "/membership",
        method: "GET",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          type: params.type,
          ...(params.recurring ? { recurring: params.recurring } : {}),
          ...(params.searchTerm ? { searchTerm: params.searchTerm } : {}),
        },
      }),
      providesTags: (result, _err, arg) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Membership" as const, id: _id })),
              { type: "Membership", id: `LIST-${arg.type}` },
            ]
          : [{ type: "Membership", id: `LIST-${arg.type}` }],
    }),

    createMembership: builder.mutation<MembershipMutationResponse, MembershipFormPayload>({
      query: (body) => ({
        url: "/Membership",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Membership", id: "LIST-user" },
        { type: "Membership", id: "LIST-vendor" },
        "Dashboard",
      ],
    }),

    updateMembership: builder.mutation<
      MembershipMutationResponse,
      { id: string; body: MembershipFormPayload }
    >({
      query: ({ id, body }) => ({
        url: `/membership/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Membership", id: arg.id },
        { type: "Membership", id: "LIST-user" },
        { type: "Membership", id: "LIST-vendor" },
        "Dashboard",
      ],
    }),

    deleteMembership: builder.mutation<MembershipMutationResponse, string>({
      query: (id) => ({
        url: `/membership/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Membership", id: "LIST-user" },
        { type: "Membership", id: "LIST-vendor" },
        "Dashboard",
      ],
    }),

    getSubscribers: builder.query<SubscribersListResponse, GetSubscribersParams>({
      query: ({ id, page, limit, searchTerm }) => ({
        url: `/subscription/subscribers/${id}`,
        method: "GET",
        params: {
          page: page ?? 1,
          limit: limit ?? 10,
          ...(searchTerm ? { searchTerm } : {}),
        },
      }),
      providesTags: (_res, _err, arg) => [{ type: "Membership", id: `SUBS-${arg.id}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMembershipsQuery,
  useCreateMembershipMutation,
  useUpdateMembershipMutation,
  useDeleteMembershipMutation,
  useGetSubscribersQuery,
} = membershipApi;
