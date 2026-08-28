import { baseApi } from "../../api/baseApi";
import type {
  ChangeProfileVisibilityPayload,
  ChangeVendorStatusPayload,
  GetVendorsParams,
  VendorMutationResponse,
  VendorsListResponse,
} from "./vendors.types";

export const vendorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<VendorsListResponse, GetVendorsParams | void>({
      query: (params) => ({
        url: "/vendor",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.availability ? { availability: params.availability } : {}),
          ...(params?.hourlyRateRange ? { hourlyRateRange: params.hourlyRateRange } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Vendors" as const, id: _id })),
              { type: "Vendors", id: "LIST" },
            ]
          : [{ type: "Vendors", id: "LIST" }],
    }),

    createVendor: builder.mutation<VendorMutationResponse, FormData>({
      query: (body) => ({
        url: "/vendor/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Vendors", id: "LIST" }, "Dashboard"],
    }),

    changeProfileVisibility: builder.mutation<
      VendorMutationResponse,
      { id: string; body: ChangeProfileVisibilityPayload }
    >({
      query: ({ id, body }) => ({
        url: `/vendor/change-profile-visibility/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Vendors", id: arg.id },
        { type: "Vendors", id: "LIST" },
      ],
    }),

    changeVendorStatus: builder.mutation<
      VendorMutationResponse,
      { id: string; body: ChangeVendorStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/vendor/change-status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Vendors", id: arg.id },
        { type: "Vendors", id: "LIST" },
        "Dashboard",
      ],
    }),

    deleteVendor: builder.mutation<VendorMutationResponse, string>({
      query: (id) => ({
        url: `/vendor/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Vendors", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useChangeProfileVisibilityMutation,
  useChangeVendorStatusMutation,
  useDeleteVendorMutation,
} = vendorsApi;
