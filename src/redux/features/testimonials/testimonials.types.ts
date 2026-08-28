export interface ApiTestimonial {
  _id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetTestimonialsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface TestimonialsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiTestimonial[];
}

export interface TestimonialMutationResponse {
  success: boolean;
  message: string;
  data?: ApiTestimonial;
}

/** Values collected by the form before building multipart FormData. */
export interface TestimonialFormPayload {
  quote: string;
  name: string;
  role: string;
  company: string;
  imageFile?: File | null;
}
