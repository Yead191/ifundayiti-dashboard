import { baseApi } from "../../api/baseApi";
import type {
  CouponMutationResponse,
  CouponPayload,
  CouponsListResponse,
  GetCouponsParams,
} from "./coupons.types";

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<CouponsListResponse, GetCouponsParams | void>({
      query: (params) => ({
        url: "/coupon",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Coupons" as const, id: _id })),
              { type: "Coupons", id: "LIST" },
            ]
          : [{ type: "Coupons", id: "LIST" }],
    }),

    createCoupon: builder.mutation<CouponMutationResponse, CouponPayload>({
      query: (body) => ({
        url: "/coupon",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Coupons", id: "LIST" }],
    }),

    updateCoupon: builder.mutation<CouponMutationResponse, { id: string; body: CouponPayload }>({
      query: ({ id, body }) => ({
        url: `/coupon/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Coupons", id: arg.id },
        { type: "Coupons", id: "LIST" },
      ],
    }),

    deleteCoupon: builder.mutation<CouponMutationResponse, string>({
      query: (id) => ({
        url: `/coupon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Coupons", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
