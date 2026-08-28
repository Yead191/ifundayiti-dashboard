import { baseApi } from "../../api/baseApi";
import type {
  GetTestimonialsParams,
  TestimonialMutationResponse,
  TestimonialsListResponse,
} from "./testimonials.types";

export const testimonialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTestimonials: builder.query<TestimonialsListResponse, GetTestimonialsParams | void>({
      query: (params) => ({
        url: "/testimonial",
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
              ...result.data.map(({ _id }) => ({ type: "Testimonials" as const, id: _id })),
              { type: "Testimonials", id: "LIST" },
            ]
          : [{ type: "Testimonials", id: "LIST" }],
    }),

    createTestimonial: builder.mutation<TestimonialMutationResponse, FormData>({
      query: (body) => ({
        url: "/testimonial",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Testimonials", id: "LIST" }],
    }),

    updateTestimonial: builder.mutation<
      TestimonialMutationResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/testimonial/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Testimonials", id: arg.id },
        { type: "Testimonials", id: "LIST" },
      ],
    }),

    deleteTestimonial: builder.mutation<TestimonialMutationResponse, string>({
      query: (id) => ({
        url: `/testimonial/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Testimonials", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTestimonialsQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} = testimonialsApi;
