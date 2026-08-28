import { baseApi } from "../../api/baseApi";
import type {
  DashboardOverviewResponse,
  FundStatsResponse,
  MonthlyCountResponse,
  MonthlyAmountResponse,
  StatusStatsResponse,
} from "./dashboard.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverviewResponse, void>({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    getFundStats: builder.query<FundStatsResponse, void>({
      query: () => ({
        url: "/donation/fund-stats",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    getMonthlyApplications: builder.query<MonthlyCountResponse, number | string>({
      query: (year) => ({
        url: `/application/monthly-chart?year=${year}`,
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    getDonationAmountChart: builder.query<MonthlyAmountResponse, number | string>({
      query: (year) => ({
        url: `/application/donation-amount?year=${year}`,
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    getApplicationStatusChart: builder.query<StatusStatsResponse, void>({
      query: () => ({
        url: "/application/status-chart",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardOverviewQuery,
  useGetFundStatsQuery,
  useGetMonthlyApplicationsQuery,
  useGetDonationAmountChartQuery,
  useGetApplicationStatusChartQuery,
} = dashboardApi;
