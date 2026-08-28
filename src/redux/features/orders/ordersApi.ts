import { baseApi } from "../../api/baseApi";
import type {
  GetOrdersParams,
  OrderMutationResponse,
  OrderStatus,
  OrdersListResponse,
} from "./orders.types";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersListResponse, GetOrdersParams | void>({
      query: (params) => ({
        url: "/order",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.payment_status ? { payment_status: params.payment_status } : {}),
          ...(params?.startDate ? { startDate: params.startDate } : {}),
          ...(params?.endDate ? { endDate: params.endDate } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Orders" as const, id: _id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    updateOrderStatus: builder.mutation<
      OrderMutationResponse,
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/order/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Orders", id: arg.id },
        { type: "Orders", id: "LIST" },
        "Dashboard",
      ],
    }),

    deleteOrder: builder.mutation<OrderMutationResponse, string>({
      query: (id) => ({
        url: `/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi;
