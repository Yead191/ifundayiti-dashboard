import { baseApi } from "../../api/baseApi";
import type {
  CreateInquiryPayload,
  GetInquiriesParams,
  InquiryMutationResponse,
  InquiriesListResponse,
  UpdateInquiryPayload,
} from "./inquiries.types";

export const inquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInquiries: builder.query<InquiriesListResponse, GetInquiriesParams | void>({
      query: (params) => ({
        url: "/inquiry",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.budget ? { budget: params.budget } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Inquiries" as const, id: _id })),
              { type: "Inquiries", id: "LIST" },
            ]
          : [{ type: "Inquiries", id: "LIST" }],
    }),

    createInquiry: builder.mutation<InquiryMutationResponse, CreateInquiryPayload>({
      query: (body) => ({
        url: "/inquiry",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inquiries", id: "LIST" }],
    }),

    updateInquiry: builder.mutation<
      InquiryMutationResponse,
      { id: string; body: UpdateInquiryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/inquiry/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Inquiries", id: arg.id },
        { type: "Inquiries", id: "LIST" },
      ],
    }),

    deleteInquiry: builder.mutation<InquiryMutationResponse, string>({
      query: (id) => ({
        url: `/inquiry/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Inquiries", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInquiriesQuery,
  useCreateInquiryMutation,
  useUpdateInquiryMutation,
  useDeleteInquiryMutation,
} = inquiriesApi;
