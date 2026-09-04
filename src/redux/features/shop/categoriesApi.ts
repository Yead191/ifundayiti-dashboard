import { baseApi } from "../../api/baseApi";
import type {
  ProductCategory,
  GetCategoriesParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./product.types";

export interface CategoryListResponse {
  success: boolean;
  message: string;
  data: ProductCategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface CategorySingleResponse {
  success: boolean;
  message: string;
  data: ProductCategory;
}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryListResponse, GetCategoriesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.status && params.status !== "all") {
            queryParams.append("status", params.status);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/product-category${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "ProductCategories" as const,
                id: _id,
              })),
              { type: "ProductCategories", id: "LIST" },
            ]
          : [{ type: "ProductCategories", id: "LIST" }],
    }),

    getCategoryById: builder.query<CategorySingleResponse, string>({
      query: (id) => ({
        url: `/product-category/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "ProductCategories", id },
      ],
    }),

    createCategory: builder.mutation<CategorySingleResponse, CreateCategoryPayload>({
      query: (body) => ({
        url: "/product-category",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ProductCategories", id: "LIST" }],
    }),

    updateCategory: builder.mutation<
      CategorySingleResponse,
      { id: string; body: UpdateCategoryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/product-category/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ProductCategories", id },
        { type: "ProductCategories", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/product-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ProductCategories", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
