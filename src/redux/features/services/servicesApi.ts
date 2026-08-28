import { baseApi } from "../../api/baseApi";
import type {
  GetServicesParams,
  ServiceMutationResponse,
  ServicesListResponse,
} from "./services.types";

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ServicesListResponse, GetServicesParams | void>({      
      query: (params) => ({
        url: "/services",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          searchTerm: params?.searchTerm ?? "",
          ...(params?.featured === true || params?.featured === false
            ? { featured: params.featured }
            : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Services" as const, id: _id })),
              { type: "Services", id: "LIST" },
            ]
          : [{ type: "Services", id: "LIST" }],
    }),

    createService: builder.mutation<ServiceMutationResponse, FormData>({
      query: (body) => ({
        url: "/services",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Services", id: "LIST" }, "Dashboard"],
    }),

    updateService: builder.mutation<ServiceMutationResponse, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/services/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Services", id: arg.id },
        { type: "Services", id: "LIST" },
        "Dashboard",
      ],
    }),

    deleteService: builder.mutation<ServiceMutationResponse, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Services", id: "LIST" }, "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;