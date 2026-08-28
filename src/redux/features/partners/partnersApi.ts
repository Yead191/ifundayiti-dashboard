import { baseApi } from "../../api/baseApi";
import type {
  ChangePartnerStatusPayload,
  GetPartnersParams,
  PartnerDetailResponse,
  PartnerMutationResponse,
  PartnersListResponse,
} from "./partners.types";
import type { PartnerJsonBody } from "./buildPartnerFormData";

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<PartnersListResponse, GetPartnersParams | void>({
      query: (params) => ({
        url: "/partner",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(typeof params?.featured === "boolean" ? { featured: params.featured } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Partners" as const, id: _id })),
              { type: "Partners", id: "LIST" },
            ]
          : [{ type: "Partners", id: "LIST" }],
    }),

    getPartner: builder.query<PartnerDetailResponse, string>({
      query: (id) => ({
        url: `/partner/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Partners", id }],
    }),

    createPartner: builder.mutation<PartnerMutationResponse, PartnerJsonBody | FormData>({
      query: (body) => ({
        url: "/partner",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Partners", id: "LIST" }, "Dashboard"],
    }),

    updatePartner: builder.mutation<
      PartnerMutationResponse,
      { id: string; body: PartnerJsonBody | FormData }
    >({
      query: ({ id, body }) => ({
        url: `/partner/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Partners", id: arg.id },
        { type: "Partners", id: "LIST" },
        "Dashboard",
      ],
    }),

    changePartnerStatus: builder.mutation<PartnerMutationResponse, ChangePartnerStatusPayload>({
      query: (body) => ({
        url: "/partner/change-status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Partners", id: arg.id },
        { type: "Partners", id: "LIST" },
        "Dashboard",
      ],
    }),

    deletePartner: builder.mutation<PartnerMutationResponse, string>({
      query: (id) => ({
        url: `/partner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Partners", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPartnersQuery,
  useGetPartnerQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useChangePartnerStatusMutation,
  useDeletePartnerMutation,
} = partnersApi;
