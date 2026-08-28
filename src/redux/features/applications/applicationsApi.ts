import { baseApi } from "../../api/baseApi";

export interface APIApplicationPeriod {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface APIApplicationDocument {
  type: string;
  url: string;
  _id?: string;
}

export interface APIApplication {
  _id: string;
  applicationPeriod: APIApplicationPeriod;
  personal: {
    name: string;
    dob: string;
    nationality: string;
    location: string;
    image: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  identification?: {
    nationalId?: string;
    passport?: string;
  };
  grant: {
    projectName: string;
    projectDescription: string;
    requestedAmount: number;
    fundUsage: string;
    expectedImpact: string;
  };
  background?: {
    occupation: string;
    financialBackground: string;
  };
  projectGallery?: string[];
  documents: APIApplicationDocument[];
  status: string;
  awardedAmount?: number;
  createdAt: string;
  updatedAt: string;
  successStory?: string;
  quote?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    name: string;
    role: string;
    email: string;
  };
}

export interface ApplicationListResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: APIApplication[];
}

export interface ApplicationSingleResponse {
  success: boolean;
  message: string;
  data: APIApplication;
}

export interface ApplicationListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  applicationPeriod?: string;
}

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<ApplicationListResponse, ApplicationListParams>({
      query: ({ page = 1, limit = 10, searchTerm, status, applicationPeriod } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (searchTerm) params.set("searchTerm", searchTerm);
        if (status && status !== "all") params.set("status", status);
        if (applicationPeriod && applicationPeriod !== "all") {
          params.set("applicationPeriod", applicationPeriod);
        }
        return { url: `/application?${params.toString()}`, method: "GET" };
      },
      providesTags: ["Applications"],
    }),
    getApplicationById: builder.query<ApplicationSingleResponse, string>({
      query: (id) => ({ url: `/application/${id}`, method: "GET" }),
      providesTags: (_result, _err, id) => [{ type: "Applications", id }],
    }),
    updateApplicationStatus: builder.mutation<
      ApplicationSingleResponse,
      { id: string; body: { status: string; rejectionReason?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/application/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),
    selectWinner: builder.mutation<
      ApplicationSingleResponse,
      {
        id: string;
        body: {
          status: "winner";
          successStory: string;
          quote?: string;
          awardedAmount: number;
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/application/winner-selection/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),
    deleteApplication: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/application/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Applications"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationStatusMutation,
  useSelectWinnerMutation,
  useDeleteApplicationMutation,
} = applicationsApi;
