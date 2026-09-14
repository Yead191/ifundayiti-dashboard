import { baseApi } from "../../api/baseApi";
import type {
  DonationListParams,
  DonationListResponse,
  SingleDonationResponse,
  FundStatsResponse,
  DeleteMultipleDonationsResponse,
} from "./donations.types";

export const donationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFundStats: builder.query<FundStatsResponse, void>({
      query: () => ({
        url: "/donation/fund-stats",
        method: "GET",
      }),
      providesTags: [{ type: "Donations" as const, id: "STATS" }],
    }),

    getDonations: builder.query<DonationListResponse, DonationListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.type) {
            queryParams.append("type", params.type);
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/donation${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Donations" as const,
                id: _id,
              })),
              { type: "Donations", id: "LIST" },
            ]
          : [{ type: "Donations", id: "LIST" }],
    }),

    getDonationById: builder.query<SingleDonationResponse, string>({
      query: (id) => ({
        url: `/donation/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Donations", id }],
    }),

    deleteDonation: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/donation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Donations", id: "LIST" },
        { type: "Donations", id: "STATS" },
      ],
    }),

    deleteMultipleDonations: builder.mutation<
      DeleteMultipleDonationsResponse,
      { ids: string[] }
    >({
      query: (body) => ({
        url: "/donation/delete-multiple",
        method: "DELETE",
        body,
      }),
      invalidatesTags: [
        { type: "Donations", id: "LIST" },
        { type: "Donations", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFundStatsQuery,
  useGetDonationsQuery,
  useGetDonationByIdQuery,
  useDeleteDonationMutation,
  useDeleteMultipleDonationsMutation,
} = donationsApi;
