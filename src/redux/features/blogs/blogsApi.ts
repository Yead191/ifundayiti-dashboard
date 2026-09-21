import { baseApi } from "../../api/baseApi";
import type {
  BlogListParams,
  BlogListResponse,
  SingleBlogResponse,
  BlogStatsResponse,
  BlogCategoryListParams,
  BlogCategoryListResponse,
  SingleBlogCategoryResponse,
  BLOG_STATUS,
  BlogCommentsResponse,
  BlogLikesResponse,
  ToggleLikeResponse,
  SingleBlogCommentResponse,
} from "./blogs.types";

export const blogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Blog Stats
    getBlogStats: builder.query<BlogStatsResponse, void>({
      query: () => ({
        url: "/blog/stats",
        method: "GET",
      }),
      providesTags: [{ type: "BlogStats" as const, id: "STATS" }],
    }),

    // Get Blogs (with search, category, status, featured, pagination)
    getBlogs: builder.query<BlogListResponse, BlogListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.category && params.category !== "all" && params.category !== "ALL") {
            queryParams.append("category", params.category);
          }
          if (params.status && params.status !== "all" && params.status !== "ALL") {
            queryParams.append("status", params.status);
          }
          if (params.isFeatured !== undefined) {
            queryParams.append("isFeatured", String(params.isFeatured));
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/blog${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Blogs" as const,
                id: _id,
              })),
              { type: "Blogs", id: "LIST" },
            ]
          : [{ type: "Blogs", id: "LIST" }],
    }),

    // Get Single Blog by ID or Slug
    getBlogByIdOrSlug: builder.query<SingleBlogResponse, string>({
      query: (idOrSlug) => ({
        url: `/blog/${idOrSlug}`,
        method: "GET",
      }),
      providesTags: (_res, _err, idOrSlug) => [{ type: "Blogs", id: idOrSlug }],
    }),

    // Create Blog (multipart/form-data)
    createBlog: builder.mutation<SingleBlogResponse, FormData>({
      query: (body) => ({
        url: "/blog",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Blogs", id: "LIST" },
        { type: "BlogStats", id: "STATS" },
        { type: "BlogCategories", id: "LIST" },
      ],
    }),

    // Update Blog (multipart/form-data)
    updateBlog: builder.mutation<
      SingleBlogResponse,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/blog/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Blogs", id },
        { type: "Blogs", id: "LIST" },
        { type: "BlogStats", id: "STATS" },
        { type: "BlogCategories", id: "LIST" },
      ],
    }),

    // Quick Update Blog Status
    updateBlogStatus: builder.mutation<
      SingleBlogResponse,
      { id: string; status: BLOG_STATUS }
    >({
      query: ({ id, status }) => ({
        url: `/blog/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Blogs", id },
        { type: "Blogs", id: "LIST" },
        { type: "BlogStats", id: "STATS" },
      ],
    }),

    // Quick Toggle Blog Featured
    toggleBlogFeatured: builder.mutation<SingleBlogResponse, string>({
      query: (id) => ({
        url: `/blog/featured/${id}`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Blogs", id },
        { type: "Blogs", id: "LIST" },
        { type: "BlogStats", id: "STATS" },
      ],
    }),

    // Delete Blog
    deleteBlog: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Blogs", id: "LIST" },
        { type: "BlogStats", id: "STATS" },
        { type: "BlogCategories", id: "LIST" },
      ],
    }),

    // Blog Categories
    getBlogCategories: builder.query<
      BlogCategoryListResponse,
      BlogCategoryListParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/blog-category${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "BlogCategories" as const,
                id: _id,
              })),
              { type: "BlogCategories", id: "LIST" },
            ]
          : [{ type: "BlogCategories", id: "LIST" }],
    }),

    getBlogCategoryByIdOrSlug: builder.query<SingleBlogCategoryResponse, string>({
      query: (idOrSlug) => ({
        url: `/blog-category/${idOrSlug}`,
        method: "GET",
      }),
      providesTags: (_res, _err, idOrSlug) => [
        { type: "BlogCategories", id: idOrSlug },
      ],
    }),

    createBlogCategory: builder.mutation<
      SingleBlogCategoryResponse,
      { name: string }
    >({
      query: (body) => ({
        url: "/blog-category",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "BlogCategories", id: "LIST" }],
    }),

    updateBlogCategory: builder.mutation<
      SingleBlogCategoryResponse,
      { id: string; name: string }
    >({
      query: ({ id, name }) => ({
        url: `/blog-category/${id}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "BlogCategories", id },
        { type: "BlogCategories", id: "LIST" },
        { type: "Blogs", id: "LIST" },
      ],
    }),

    deleteBlogCategory: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/blog-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "BlogCategories", id: "LIST" }],
    }),

    // Blog Comments
    getBlogComments: builder.query<
      BlogCommentsResponse,
      { blogIdOrSlug: string; page?: number; limit?: number }
    >({
      query: ({ blogIdOrSlug, page, limit }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append("page", String(page));
        if (limit) queryParams.append("limit", String(limit));
        const qs = queryParams.toString();
        return {
          url: `/comment/${blogIdOrSlug}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (_res, _err, { blogIdOrSlug }) => [
        { type: "BlogComments" as const, id: blogIdOrSlug },
        { type: "BlogComments" as const, id: "LIST" },
      ],
    }),

    createBlogComment: builder.mutation<
      SingleBlogCommentResponse,
      { blogIdOrSlug: string; text: string }
    >({
      query: ({ blogIdOrSlug, text }) => ({
        url: `/comment/${blogIdOrSlug}`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (_res, _err, { blogIdOrSlug }) => [
        { type: "BlogComments" as const, id: blogIdOrSlug },
        { type: "BlogComments" as const, id: "LIST" },
        { type: "Blogs" as const, id: blogIdOrSlug },
        { type: "Blogs" as const, id: "LIST" },
      ],
    }),

    deleteBlogComment: builder.mutation<
      { success: boolean; message: string },
      { commentId: string; blogIdOrSlug?: string }
    >({
      query: ({ commentId }) => ({
        url: `/comment/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { blogIdOrSlug }) => [
        { type: "BlogComments" as const, id: "LIST" },
        ...(blogIdOrSlug
          ? [
              { type: "BlogComments" as const, id: blogIdOrSlug },
              { type: "Blogs" as const, id: blogIdOrSlug },
            ]
          : []),
        { type: "Blogs" as const, id: "LIST" },
      ],
    }),

    // Blog Likes
    getBlogLikes: builder.query<
      BlogLikesResponse,
      { blogIdOrSlug: string; page?: number; limit?: number }
    >({
      query: ({ blogIdOrSlug, page, limit }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append("page", String(page));
        if (limit) queryParams.append("limit", String(limit));
        const qs = queryParams.toString();
        return {
          url: `/like/${blogIdOrSlug}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (_res, _err, { blogIdOrSlug }) => [
        { type: "BlogLikes" as const, id: blogIdOrSlug },
        { type: "BlogLikes" as const, id: "LIST" },
      ],
    }),

    toggleBlogLike: builder.mutation<
      ToggleLikeResponse,
      { blogIdOrSlug: string }
    >({
      query: ({ blogIdOrSlug }) => ({
        url: `/like/${blogIdOrSlug}`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (_res, _err, { blogIdOrSlug }) => [
        { type: "BlogLikes" as const, id: blogIdOrSlug },
        { type: "BlogLikes" as const, id: "LIST" },
        { type: "Blogs" as const, id: blogIdOrSlug },
        { type: "Blogs" as const, id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBlogStatsQuery,
  useGetBlogsQuery,
  useGetBlogByIdOrSlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useUpdateBlogStatusMutation,
  useToggleBlogFeaturedMutation,
  useDeleteBlogMutation,
  useGetBlogCategoriesQuery,
  useGetBlogCategoryByIdOrSlugQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
  useGetBlogCommentsQuery,
  useCreateBlogCommentMutation,
  useDeleteBlogCommentMutation,
  useGetBlogLikesQuery,
  useToggleBlogLikeMutation,
} = blogsApi;
