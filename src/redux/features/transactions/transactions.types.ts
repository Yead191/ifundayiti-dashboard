export const TRANSACTION_TYPE = {
  CREDIT: "Credit",
  DEBIT: "Debit",
} as const;
export type TRANSACTION_TYPE = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export const TRANSACTION_STATUS = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
} as const;
export type TRANSACTION_STATUS = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export const TRANSACTION_CATEGORY = {
  MEMBERSHIP: "Membership",
  SHOP: "Shop",
  SERVICE: "Service",
} as const;
export type TRANSACTION_CATEGORY = (typeof TRANSACTION_CATEGORY)[keyof typeof TRANSACTION_CATEGORY];

export type TransactionCategory = TRANSACTION_CATEGORY | "Membership" | "Shop" | "Service" | string;
export type TransactionStatus = TRANSACTION_STATUS | "Success" | "Failed" | "Pending" | string;
export type TransactionType = TRANSACTION_TYPE | "Credit" | "Debit" | string;

export interface TransactionUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export interface TransactionOrderItem {
  _id?: string;
  product?: {
    _id: string;
    name: string;
    images?: string[];
    price?: number;
  } | string;
  quantity?: number;
  price?: number;
}

export interface TransactionOrderRef {
  _id: string;
  orderNumber?: string;
  totalAmount?: number;
  status?: string;
  deliveryStatus?: string;
  paymentStatus?: string;
  createdAt?: string;
  items?: TransactionOrderItem[];
}

export interface ITransaction {
  _id: string;
  user?: TransactionUser | string | null;
  order?: TransactionOrderRef | string | null;
  amount?: number;
  total_price: number;
  payment_received: number;
  discount_percentage?: number;
  discount_amount?: number;
  platform_fee?: number;
  transaction_id?: string | null;
  payment_intent_id?: string | null;
  payment_method?: string | null;
  type: TransactionType;
  status: TransactionStatus;
  category: TransactionCategory;
  prev_transaction_id?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type ApiTransaction = ITransaction;

export interface ITransactionStats {
  totalRevenue: number;
  shopRevenue: number;
  membershipRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  creditTransactions: number;
  debitTransactions: number;
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
  category?: string;
  status?: string;
  type?: string;
  sort?: string;
  user?: string;
}

export interface TransactionsListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ITransaction[];
}

export interface SingleTransactionResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: ITransaction;
}

export interface TransactionStatsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: ITransactionStats;
}

export interface DeleteTransactionResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: any;
}

export interface DeleteMultipleTransactionsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
  };
}

export interface TransactionMutationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const TRANSACTION_CATEGORY_OPTIONS = ["Membership", "Shop", "Service"] as const;
