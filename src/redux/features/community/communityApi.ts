import { baseApi } from "../../api/baseApi";
import type {
  CommunityCommentsResponse,
  CommunityPostsResponse,
  CreateCommunityPostPayload,
  GetCommunityPostsParams,
  IToggleLikeResponse,
  SingleCommunityCommentResponse,
  SingleCommunityPostResponse,
  ToggleCommentLikeResponse,
  UpdateCommunityPostPayload,
} from "./community.types";

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunityPosts: builder.query<
      CommunityPostsResponse,
      GetCommunityPostsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, any> = {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        };

        if (params?.searchTerm) queryParams.searchTerm = params.searchTerm;
        if (params?.status && params.status !== "all")
          queryParams.status = params.status;
        if (typeof params?.isPinned === "boolean")
          queryParams.isPinned = params.isPinned;
        if (typeof params?.isLocked === "boolean")
          queryParams.isLocked = params.isLocked;
        if (params?.sortBy) queryParams.sortBy = params.sortBy;

        return {
          url: "/community",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Community" as const,
                id: _id,
              })),
              { type: "Community", id: "LIST" },
            ]
          : [{ type: "Community", id: "LIST" }],
    }),

    getCommunityPostById: builder.query<SingleCommunityPostResponse, string>({
      query: (id) => ({
        url: `/community/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Community", id }],
    }),

    createCommunityPost: builder.mutation<
      SingleCommunityPostResponse,
      FormData | CreateCommunityPostPayload
    >({
      query: (body) => ({
        url: "/community",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),

    updateCommunityPost: builder.mutation<
      SingleCommunityPostResponse,
      { id: string; data: FormData | UpdateCommunityPostPayload }
    >({
      query: ({ id, data }) => ({
        url: `/community/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Community", id },
        { type: "Community", id: "LIST" },
      ],
    }),

    deleteCommunityPost: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/community/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),

    toggleCommunityPostLike: builder.mutation<
      { success: boolean; message: string; data: IToggleLikeResponse },
      string
    >({
      query: (postId) => ({
        url: `/community-like/${postId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, postId) => [
        { type: "Community", id: postId },
        { type: "CommunityLikes", id: postId },
      ],
    }),

    getCommunityPostLikes: builder.query<
      { success: boolean; message: string; data: any[] },
      { postId: string; page?: number; limit?: number }
    >({
      query: ({ postId, page = 1, limit = 20 }) => ({
        url: `/community-like/${postId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_result, _error, { postId }) => [
        { type: "CommunityLikes", id: postId },
      ],
    }),

    getCommunityComments: builder.query<
      CommunityCommentsResponse,
      { postId: string; page?: number; limit?: number }
    >({
      query: ({ postId, page = 1, limit = 50 }) => ({
        url: `/community-comment/${postId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_result, _error, { postId }) => [
        { type: "CommunityComments", id: postId },
      ],
    }),

    createCommunityComment: builder.mutation<
      SingleCommunityCommentResponse,
      { postId: string; comment: string }
    >({
      query: ({ postId, comment }) => ({
        url: `/community-comment/${postId}`,
        method: "POST",
        body: { text: comment, comment },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "CommunityComments", id: postId },
        { type: "Community", id: postId },
        { type: "Community", id: "LIST" },
      ],
    }),

    replyCommunityComment: builder.mutation<
      SingleCommunityCommentResponse,
      { postId: string; parentCommentId: string; comment: string }
    >({
      query: ({ postId, parentCommentId, comment }) => ({
        url: `/community-comment/${parentCommentId}/reply`,
        method: "POST",
        body: { text: comment, comment },
      }),
      invalidatesTags: (_result, _error, { postId, parentCommentId }) => [
        { type: "CommunityComments", id: postId },
        { type: "CommunityComments", id: parentCommentId },
        { type: "Community", id: postId },
        { type: "Community", id: "LIST" },
      ],
    }),

    getCommunityCommentReplies: builder.query<
      CommunityCommentsResponse,
      { commentId: string; page?: number; limit?: number }
    >({
      query: ({ commentId, page = 1, limit = 30 }) => ({
        url: `/community-comment/${commentId}/replies`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_result, _error, { commentId }) => [
        { type: "CommunityComments", id: commentId },
      ],
    }),

    toggleCommunityCommentLike: builder.mutation<
      ToggleCommentLikeResponse,
      string
    >({
      query: (commentId) => ({
        url: `/community-comment/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, commentId) => [
        { type: "CommunityComments", id: commentId },
      ],
    }),

    updateCommunityComment: builder.mutation<
      SingleCommunityCommentResponse,
      { commentId: string; comment: string; postId?: string }
    >({
      query: ({ commentId, comment }) => ({
        url: `/community-comment/${commentId}`,
        method: "PATCH",
        body: { comment },
      }),
      invalidatesTags: (_result, _error, { commentId, postId }) => [
        { type: "CommunityComments", id: commentId },
        ...(postId ? [{ type: "CommunityComments" as const, id: postId }] : []),
      ],
    }),

    deleteCommunityComment: builder.mutation<
      { success: boolean; message: string },
      { commentId: string; postId?: string }
    >({
      query: ({ commentId }) => ({
        url: `/community-comment/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { commentId, postId }) => [
        { type: "CommunityComments", id: commentId },
        ...(postId
          ? [
              { type: "CommunityComments" as const, id: postId },
              { type: "Community" as const, id: postId },
              { type: "Community" as const, id: "LIST" },
            ]
          : []),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommunityPostsQuery,
  useGetCommunityPostByIdQuery,
  useCreateCommunityPostMutation,
  useUpdateCommunityPostMutation,
  useDeleteCommunityPostMutation,
  useToggleCommunityPostLikeMutation,
  useGetCommunityPostLikesQuery,
  useGetCommunityCommentsQuery,
  useCreateCommunityCommentMutation,
  useReplyCommunityCommentMutation,
  useGetCommunityCommentRepliesQuery,
  useToggleCommunityCommentLikeMutation,
  useUpdateCommunityCommentMutation,
  useDeleteCommunityCommentMutation,
} = communityApi;
