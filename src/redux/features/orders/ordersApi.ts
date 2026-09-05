import { baseApi } from "../../api/baseApi";
import type {
  GetOrdersParams,
  IOrder,
  OrdersListResponse,
  SingleOrderResponse,
  UpdateOrderStatusPayload,
} from "./orders.types";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersListResponse, GetOrdersParams | void>({
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
          if (params.payment_status && params.payment_status !== "all") {
            queryParams.append("payment_status", params.payment_status);
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/order${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Orders" as const,
                id: _id,
              })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getOrderById: builder.query<SingleOrderResponse, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Orders", id }],
    }),

    updateOrderStatus: builder.mutation<
      SingleOrderResponse,
      { id: string; body: UpdateOrderStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/order/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    markPreOrderReady: builder.mutation<
      SingleOrderResponse,
      { orderId: string; itemIndex: number }
    >({
      query: ({ orderId, itemIndex }) => ({
        url: `/order/pre-order-ready/${orderId}/items/${itemIndex}`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "LIST" },
        "Products", // Stock inventory changed atomically
      ],
    }),

    deleteOrder: builder.mutation<{ success: boolean; message: string; data?: IOrder }, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useMarkPreOrderReadyMutation,
  useDeleteOrderMutation,
} = ordersApi;
