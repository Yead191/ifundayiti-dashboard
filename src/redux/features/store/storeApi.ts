import { baseApi } from "../../api/baseApi";
import type {
  BookMutationResponse,
  BooksListResponse,
  GetBooksParams,
} from "./store.types";

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<BooksListResponse, GetBooksParams>({
      query: (params) => ({
        url: "/books",
        method: "GET",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          type: params.type,
          ...(params.searchTerm ? { searchTerm: params.searchTerm } : {}),
        },
      }),
      providesTags: (result, _err, arg) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Store" as const, id: _id })),
              { type: "Store", id: `LIST-${arg.type}` },
            ]
          : [{ type: "Store", id: `LIST-${arg.type}` }],
    }),

    createBook: builder.mutation<BookMutationResponse, FormData>({
      query: (body) => ({
        url: "/books",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Store", id: "LIST-digital" },
        { type: "Store", id: "LIST-office" },
        "Dashboard",
      ],
    }),

    updateBook: builder.mutation<BookMutationResponse, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/books/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Store", id: arg.id },
        { type: "Store", id: "LIST-digital" },
        { type: "Store", id: "LIST-office" },
        "Dashboard",
      ],
    }),

    deleteBook: builder.mutation<BookMutationResponse, string>({
      query: (id) => ({
        url: `/books/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Store", id: "LIST-digital" },
        { type: "Store", id: "LIST-office" },
        "Dashboard",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
} = storeApi;
