// Status Enums matching backend specification exactly
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LIST: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LIST: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export const PRE_ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type PreOrderStatus = (typeof PRE_ORDER_STATUS)[keyof typeof PRE_ORDER_STATUS];

// Order User / Customer
export interface IOrderUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  contact_number?: string;
}

// Order Item
export interface IOrderItem {
  product:
    | {
        _id: string;
        name: string;
        images: string[];
        sold?: number;
        variants?: any[];
        category?: string;
      }
    | string;
  name: string;
  image?: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  total_price: number;
  isPreOrder: boolean;
  expectedAvailableDate?: string | Date;
  preOrderStatus?: PreOrderStatus;
}

// Price Breakdown
export interface IPriceBreakdown {
  subtotal: number;
  delivery_charge: number; // $11.99 or Free for >= $150
  tax: number; // 8.875% of subtotal
  discount_amount: number;
  total_price: number;
  products_price?: number;
  serviceFee?: number;
}

// Address Breakdown
export interface IAddressBreakdown {
  country: string;
  city: string;
  postal_code: string;
  street_address: string;
}

// Full Order Interface
export interface IOrder {
  _id: string;
  user: IOrderUser | string;
  items: IOrderItem[];
  price_breakdown: IPriceBreakdown;
  total_items: number;
  formatted_address: string;
  address_breakdown: IAddressBreakdown;
  contact_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  order_id: string; // e.g. "ORDER-12345678"
  payment_intent_id?: string;
  transaction_id?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

// Query Parameters
export interface GetOrdersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: OrderStatus | "all" | "";
  payment_status?: PaymentStatus | "all" | "";
  sort?: string;
}

// API Responses
export interface OrdersListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IOrder[];
  pagination?: OrderPagination;
}

export interface SingleOrderResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IOrder;
}

// Mutate Order Status Payload
export interface UpdateOrderStatusPayload {
  status: "processing" | "shipped" | "delivered" | "cancelled";
}

// Order Statistics for Header
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  inFulfillmentCount: number; // confirmed + processing
  deliveredCount: number;
}

// Backward compatibility aliases
export const ORDER_STATUS_OPTIONS = ORDER_STATUS_LIST;
export const ORDER_PAYMENT_STATUS_OPTIONS = PAYMENT_STATUS_LIST;
export type OrderPaymentStatus = PaymentStatus;
export type OrderPriceBreakdown = IPriceBreakdown;
export type ApiOrder = IOrder;
export type OrderItem = IOrderItem;
export type OrderUser = IOrderUser;

