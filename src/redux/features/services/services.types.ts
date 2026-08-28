export interface ServicePrice {
  amount: number;
  frequency: string;
}

export interface ApiService {
  _id: string;
  title: string;
  tagline: string;
  price: ServicePrice;
  features: string[];
  featured: boolean;
  longDescription: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetServicesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  featured?: boolean | "";
}

export interface ServicesListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiService[];
}

export interface ServiceMutationResponse {
  success: boolean;
  message: string;
  data?: ApiService;
}

/** Form values used to build the multipart FormData payload. */
export interface ServiceFormPayload {
  title: string;
  tagline: string;
  amount: number;
  frequency: string;
  featured: boolean;
  longDescription: string;
  features: string[];
  imageFile?: File | null;
}
