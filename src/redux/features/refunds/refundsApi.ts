import { baseApi } from "../../api/baseApi";
import type {
  GetRefundsParams,
  RefundDetailResponse,
  RefundMutationResponse,
  RefundsListResponse,
  ReviewRefundPayload,
} from "./refunds.types";

export const refundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRefunds: builder.query<RefundsListResponse, GetRefundsParams | void>({
      query: (params) => ({
        url: "/refund",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Refunds" as const, id: _id })),
              { type: "Refunds", id: "LIST" },
            ]
          : [{ type: "Refunds", id: "LIST" }],
    }),

    getRefund: builder.query<RefundDetailResponse, string>({
      query: (id) => ({
        url: `/refund/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Refunds", id }],
    }),

    reviewRefund: builder.mutation<
      RefundMutationResponse,
      { id: string; body: ReviewRefundPayload }
    >({
      query: ({ id, body }) => ({
        url: `/refund/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Refunds", id: arg.id },
        { type: "Refunds", id: "LIST" },
        "Orders",
        "Dashboard",
      ],
    }),

    deleteRefund: builder.mutation<RefundMutationResponse, string>({
      query: (id) => ({
        url: `/refund/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Refunds", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRefundsQuery,
  useGetRefundQuery,
  useReviewRefundMutation,
  useDeleteRefundMutation,
} = refundsApi;
