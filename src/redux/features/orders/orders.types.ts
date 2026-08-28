/** Match backend enum spelling exactly (including "Deliverd"). */
export type OrderStatus = "Pending" | "Processing" | "Deliverd" | "Cancelled";

export type OrderPaymentStatus = "paid" | "unpaid" | "pending" | "refunded" | string;

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface OrderItem {
  title: string;
  image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderPriceBreakdown {
  products_price: number;
  serviceFee: number;
  delivery_charge: number;
  discount_amount: number;
  total_price: number;
  tax: number;
  subtotal: number;
}

export interface ApiOrder {
  _id: string;
  user: OrderUser;
  items: OrderItem[];
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  payment_intent_id?: string | null;
  contact_number?: string | null;
  formatted_address?: string | null;
  order_id: string;
  price_breakdown: OrderPriceBreakdown;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: OrderStatus | "";
  payment_status?: OrderPaymentStatus | "";
  startDate?: string;
  endDate?: string;
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiOrder[];
}

export interface OrderMutationResponse {
  success: boolean;
  message: string;
  data?: ApiOrder;
}

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "Pending",
  "Processing",
  "Deliverd",
  "Cancelled",
];

export const ORDER_PAYMENT_STATUS_OPTIONS = ["paid", "unpaid", "pending", "refunded"] as const;
