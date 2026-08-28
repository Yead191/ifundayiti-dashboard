import { baseApi } from "../../api/baseApi";
import type {
  GetTransactionsParams,
  TransactionMutationResponse,
  TransactionsListResponse,
} from "./transactions.types";

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<TransactionsListResponse, GetTransactionsParams | void>({
      query: (params) => ({
        url: "/transaction",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Transactions" as const, id: _id })),
              { type: "Transactions", id: "LIST" },
            ]
          : [{ type: "Transactions", id: "LIST" }],
    }),

    deleteTransaction: builder.mutation<TransactionMutationResponse, string>({
      query: (id) => ({
        url: `/transaction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Transactions", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTransactionsQuery, useDeleteTransactionMutation } = transactionsApi;
