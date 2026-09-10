import { baseApi } from "../../api/baseApi";
import type {
  FAQListResponse,
  SingleFAQResponse,
  CreateFAQPayload,
  UpdateFAQPayload,
  GetFAQsParams,
} from "./faq.types";

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<FAQListResponse, GetFAQsParams | void>({
      query: (params) => ({
        url: "/faq",
        method: "GET",
        params: {
          sort: "order createdAt",
          ...(params || {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Faq" as const, id: _id })),
              { type: "Faq", id: "LIST" },
            ]
          : [{ type: "Faq", id: "LIST" }],
    }),

    getFaqById: builder.query<SingleFAQResponse, string>({
      query: (id) => ({
        url: `/faq/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Faq", id }],
    }),

    createFaq: builder.mutation<SingleFAQResponse, CreateFAQPayload>({
      query: (body) => ({
        url: "/faq",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Faq", id: "LIST" }],
    }),

    updateFaq: builder.mutation<SingleFAQResponse, { id: string; body: UpdateFAQPayload }>({
      query: ({ id, body }) => ({
        url: `/faq/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Faq", id: arg.id },
        { type: "Faq", id: "LIST" },
      ],
    }),

    deleteFaq: builder.mutation<SingleFAQResponse, string>({
      query: (id) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Faq", id },
        { type: "Faq", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFaqsQuery,
  useGetFaqByIdQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
