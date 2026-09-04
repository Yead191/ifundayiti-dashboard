import { baseApi } from "../../api/baseApi";
import type {
  Product,
  ProductStats,
  GetProductsParams,
  ProductStatus,
  SetVariantStockPayload,
  IncreaseStockPayload,
  VariantPreOrderPayload,
} from "./product.types";

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface ProductSingleResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface ProductStatsResponse {
  success: boolean;
  message: string;
  data: ProductStats;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, GetProductsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.category && params.category !== "all") {
            queryParams.append("category", params.category);
          }
          if (params.gender && params.gender !== "all") {
            queryParams.append("gender", params.gender);
          }
          if (params.status && params.status !== "all") {
            queryParams.append("status", params.status);
          }
          if (params.featured !== undefined) {
            queryParams.append("featured", String(params.featured));
          }
          if (params.minPrice !== undefined) {
            queryParams.append("minPrice", String(params.minPrice));
          }
          if (params.maxPrice !== undefined) {
            queryParams.append("maxPrice", String(params.maxPrice));
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/product${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Products" as const,
                id: _id,
              })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    getProductStats: builder.query<ProductStatsResponse, void>({
      query: () => ({
        url: "/product/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Products", id: "STATS" }],
    }),

    getProductById: builder.query<ProductSingleResponse, string>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),

    createProduct: builder.mutation<ProductSingleResponse, FormData>({
      query: (formData) => ({
        url: "/product",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        { type: "Products", id: "LIST" },
        { type: "Products", id: "STATS" },
      ],
    }),

    updateProduct: builder.mutation<
      ProductSingleResponse,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/product/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
        { type: "Products", id: "STATS" },
      ],
    }),

    updateProductStatus: builder.mutation<
      ProductSingleResponse,
      { id: string; status: ProductStatus }
    >({
      query: ({ id, status }) => ({
        url: `/product/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
        { type: "Products", id: "STATS" },
      ],
    }),

    toggleProductFeatured: builder.mutation<ProductSingleResponse, string>({
      query: (id) => ({
        url: `/product/featured/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
        { type: "Products", id: "STATS" },
      ],
    }),

    setVariantStock: builder.mutation<ProductSingleResponse, SetVariantStockPayload>({
      query: ({ productId, size, color, stock }) => ({
        url: `/product/variant-stock/${productId}`,
        method: "PATCH",
        body: { size, color, stock },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Products", id: productId },
        { type: "Products", id: "LIST" },
        { type: "Products", id: "STATS" },
      ],
    }),

    increaseStock: builder.mutation<ProductSingleResponse, IncreaseStockPayload>({
      query: ({ productId, size, color, quantity }) => ({
        url: `/product/increase-stock/${productId}`,
        method: "PATCH",
        body: { size, color, quantity },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Products", id: productId },
        { type: "Products", id: "LIST" },
        { type: "Products", id: "STATS" },
      ],
    }),

    setVariantPreOrder: builder.mutation<ProductSingleResponse, VariantPreOrderPayload>({
      query: ({ productId, size, color, isPreOrder, expectedAvailableDate }) => ({
        url: `/product/pre-order/${productId}`,
        method: "PATCH",
        body: { size, color, isPreOrder, expectedAvailableDate },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Products", id: productId },
        { type: "Products", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Products", id: "LIST" },
        { type: "Products", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductStatsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useToggleProductFeaturedMutation,
  useSetVariantStockMutation,
  useIncreaseStockMutation,
  useSetVariantPreOrderMutation,
  useDeleteProductMutation,
} = productsApi;
