import { baseApi } from "../../api/baseApi";

export type TApplicationPeriodStatus =
  | "Upcoming"
  | "Open"
  | "Review"
  | "WinnerSelection"
  | "Closed";

export interface APIPeriod {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  maximumGrantAmount: number;
  totalApplicationsSubmitted: number;
  status: TApplicationPeriodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodListResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: APIPeriod[];
}

export interface PeriodSingleResponse {
  success: boolean;
  message: string;
  data: APIPeriod;
}

export interface PeriodListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: TApplicationPeriodStatus | "";
}

export interface CreatePeriodPayload {
  title: string;
  startDate: string;
  endDate: string;
  maximumGrantAmount: number;
}

export interface UpdatePeriodPayload extends Partial<CreatePeriodPayload> {
  status?: TApplicationPeriodStatus;
}

export const periodsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPeriods: builder.query<PeriodListResponse, PeriodListParams>({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (searchTerm) params.set("searchTerm", searchTerm);
        if (status) params.set("status", status);
        return { url: `/period?${params.toString()}`, method: "GET" };
      },
      providesTags: ["ApplicationPeriods"],
    }),
    getPeriodById: builder.query<PeriodSingleResponse, string>({
      query: (id) => ({ url: `/period/${id}`, method: "GET" }),
      providesTags: (_result, _err, id) => [{ type: "ApplicationPeriods", id }],
    }),
    createPeriod: builder.mutation<PeriodSingleResponse, CreatePeriodPayload>({
      query: (body) => ({ url: "/period", method: "POST", body }),
      invalidatesTags: ["ApplicationPeriods"],
    }),
    updatePeriod: builder.mutation<
      PeriodSingleResponse,
      { id: string; body: UpdatePeriodPayload }
    >({
      query: ({ id, body }) => ({
        url: `/period/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ApplicationPeriods"],
    }),
    deletePeriod: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/period/${id}`, method: "DELETE" }),
      invalidatesTags: ["ApplicationPeriods"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPeriodsQuery,
  useGetPeriodByIdQuery,
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useDeletePeriodMutation,
} = periodsApi;
