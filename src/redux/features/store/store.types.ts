export type BookType = "digital" | "office";
export type BookStockStatus = "in-stock" | "out-stock";

export interface DigitalBookDetails {
  publisher: string;
  firstPublish: string;
  edition: string;
  status: BookStockStatus | string;
  inStock: boolean;
}

export interface OfficeBookDetails {
  status: BookStockStatus | string;
  material: string;
  dimensions: string;
  weight: string;
  inStock: boolean;
}

export type BookDetails = DigitalBookDetails | OfficeBookDetails;

export interface ApiBook {
  _id: string;
  type: BookType;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  accent?: [string, string] | string[];
  file?: string;
  details: BookDetails;
  updatedAt: string;
  createdAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetBooksParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type: BookType;
}

export interface BooksListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiBook[];
}

export interface BookMutationResponse {
  success: boolean;
  message: string;
  data?: ApiBook;
}

/** Values collected by the form before building multipart FormData. */
export interface BookFormPayload {
  type: BookType;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  accent?: [string, string];
  details: BookDetails;
  imageFile?: File | null;
  fileUpload?: File | null;
}

export function isDigitalDetails(details: BookDetails): details is DigitalBookDetails {
  return "publisher" in details;
}

export function isInStock(details: BookDetails): boolean {
  if (typeof details.inStock === "boolean") return details.inStock;
  return details.status === "in-stock";
}
