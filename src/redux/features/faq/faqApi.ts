import { baseApi } from "../../api/baseApi";
import type {
  FaqListResponse,
  FaqMutationResponse,
  FaqPayload,
  GetFaqsParams,
} from "./faq.types";

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<FaqListResponse, GetFaqsParams>({
      query: ({ audience }) => ({
        url: "/faq",
        method: "GET",
        params: { audience },
      }),
      providesTags: (result, _err, arg) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Faq" as const, id: _id })),
              { type: "Faq", id: `LIST-${arg.audience}` },
            ]
          : [{ type: "Faq", id: `LIST-${arg.audience}` }],
    }),

    createFaq: builder.mutation<FaqMutationResponse, FaqPayload>({
      query: (body) => ({
        url: "/faq",
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: "Faq", id: `LIST-${arg.audience}` }],
    }),

    updateFaq: builder.mutation<FaqMutationResponse, { id: string; body: FaqPayload }>({
      query: ({ id, body }) => ({
        url: `/faq/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Faq", id: arg.id },
        { type: "Faq", id: `LIST-${arg.body.audience}` },
      ],
    }),

    deleteFaq: builder.mutation<FaqMutationResponse, { id: string; audience: FaqPayload["audience"] }>({
      query: ({ id }) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Faq", id: arg.id },
        { type: "Faq", id: `LIST-${arg.audience}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
