export type TransactionCategory = "Membership" | "Shop" | "Service" | string;
export type TransactionStatus = "Success" | "Failed" | "Pending" | string;
export type TransactionType = "Credit" | "Debit" | string;

export interface TransactionUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface TransactionOrderRef {
  _id: string;
  order_id?: string;
  status?: string;
}

export interface ApiTransaction {
  _id: string;
  user?: TransactionUser | null;
  total_price: number;
  payment_received?: number;
  discount_percentage?: number;
  discount_amount?: number;
  order?: string | TransactionOrderRef | null;
  platform_fee?: number;
  transaction_id?: string | null;
  status: TransactionStatus;
  type: TransactionType;
  category: TransactionCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface TransactionsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiTransaction[];
}

export interface TransactionMutationResponse {
  success: boolean;
  message: string;
}

export const TRANSACTION_CATEGORY_OPTIONS = ["Membership", "Shop", "Service"] as const;
