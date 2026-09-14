import { baseApi } from "../../api/baseApi";
import type {
  DeleteMultipleTransactionsResponse,
  DeleteTransactionResponse,
  GetTransactionsParams,
  SingleTransactionResponse,
  TransactionStatsResponse,
  TransactionsListResponse,
} from "./transactions.types";

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<TransactionsListResponse, GetTransactionsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          page: 1,
          limit: 10,
          sort: "-createdAt",
        };

        if (params) {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.sort !== undefined) queryParams.sort = params.sort;
          if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
          if (params.category) queryParams.category = params.category;
          if (params.status) queryParams.status = params.status;
          if (params.type) queryParams.type = params.type;
          if (params.user) queryParams.user = params.user;
        }

        return {
          url: "/transaction",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Transactions" as const, id: _id })),
              { type: "Transactions", id: "LIST" },
            ]
          : [{ type: "Transactions", id: "LIST" }],
    }),

    getTransactionStats: builder.query<TransactionStatsResponse, void>({
      query: () => ({
        url: "/transaction/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Transactions", id: "STATS" }],
    }),

    getTransactionById: builder.query<SingleTransactionResponse, string>({
      query: (id) => ({
        url: `/transaction/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Transactions", id }],
    }),

    deleteTransaction: builder.mutation<DeleteTransactionResponse, string>({
      query: (id) => ({
        url: `/transaction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Transactions", id: "LIST" },
        { type: "Transactions", id: "STATS" },
        "Dashboard",
      ],
    }),

    deleteMultipleTransactions: builder.mutation<
      DeleteMultipleTransactionsResponse,
      { ids: string[] }
    >({
      query: (body) => ({
        url: "/transaction/delete-multiple",
        method: "DELETE",
        body,
      }),
      invalidatesTags: [
        { type: "Transactions", id: "LIST" },
        { type: "Transactions", id: "STATS" },
        "Dashboard",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTransactionsQuery,
  useGetTransactionStatsQuery,
  useGetTransactionByIdQuery,
  useDeleteTransactionMutation,
  useDeleteMultipleTransactionsMutation,
} = transactionsApi;
