import { baseApi } from "../../api/baseApi";
import type {
  GetPostsParams,
  PostDetailResponse,
  PostMutationResponse,
  PostReviewStatus,
  PostsListResponse,
  ReportsListResponse,
} from "./forum.types";

export const forumApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostsListResponse, GetPostsParams | void>({
      query: (params) => ({
        url: "/posts",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Forum" as const, id: _id })),
              { type: "Forum", id: "LIST" },
            ]
          : [{ type: "Forum", id: "LIST" }],
    }),

    getPost: builder.query<PostDetailResponse, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Forum", id }],
    }),

    getPostReports: builder.query<ReportsListResponse, string>({
      query: (id) => ({
        url: `/report/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Forum", id: `REPORTS-${id}` }],
    }),

    reviewPost: builder.mutation<
      PostMutationResponse,
      { id: string; status: PostReviewStatus }
    >({
      query: ({ id, status }) => ({
        url: `/posts/review/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Forum", id: arg.id },
        { type: "Forum", id: `REPORTS-${arg.id}` },
        { type: "Forum", id: "LIST" },
        "Dashboard",
      ],
    }),

    deletePost: builder.mutation<PostMutationResponse, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Forum", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useGetPostReportsQuery,
  useReviewPostMutation,
  useDeletePostMutation,
} = forumApi;
