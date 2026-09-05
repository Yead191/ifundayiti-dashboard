import type {
  OrderStatus,
  PaymentStatus,
  PreOrderStatus,
  IOrderUser,
} from "@/redux/features/orders/orders.types";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: "default" | "processing" | "success" | "warning" | "error";
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "warning",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    color: "processing",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  processing: {
    label: "Processing",
    color: "processing",
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    color: "default",
    bg: "bg-indigo-500/10",
    text: "text-indigo-700",
    border: "border-indigo-500/30",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    color: "success",
    bg: "bg-teal-500/10",
    text: "text-teal-700",
    border: "border-teal-500/30",
    dot: "bg-teal-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "error",
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    color: "default" | "processing" | "success" | "warning" | "error";
    bg: string;
    text: string;
    border: string;
  }
> = {
  paid: {
    label: "Paid",
    color: "success",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/30",
  },
  pending: {
    label: "Pending",
    color: "warning",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/30",
  },
  failed: {
    label: "Failed",
    color: "error",
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/30",
  },
  refunded: {
    label: "Refunded",
    color: "default",
    bg: "bg-purple-500/10",
    text: "text-purple-700",
    border: "border-purple-500/30",
  },
};

export const PRE_ORDER_STATUS_CONFIG: Record<
  PreOrderStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  pending: {
    label: "Pre-Order: Payment Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/30",
  },
  confirmed: {
    label: "Pre-Order: Awaiting Batch Stock",
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/30",
  },
  ready: {
    label: "Pre-Order: Stock Allocated & Ready",
    bg: "bg-emerald-500/15",
    text: "text-emerald-800",
    border: "border-emerald-500/40",
  },
  completed: {
    label: "Pre-Order: Fulfilled",
    bg: "bg-teal-500/10",
    text: "text-teal-700",
    border: "border-teal-500/30",
  },
  cancelled: {
    label: "Pre-Order: Cancelled",
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/30",
  },
};

export function formatPrice(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatOrderDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getCustomerInfo(user: IOrderUser | string | undefined): {
  name: string;
  email: string;
  image?: string;
  contact?: string;
} {
  if (!user) {
    return { name: "Guest Customer", email: "No email provided" };
  }
  if (typeof user === "string") {
    return { name: "Customer", email: user };
  }
  return {
    name: user.name || "Customer",
    email: user.email || "No email",
    image: user.image,
    contact: user.contact_number,
  };
}

export function getTransactionIdString(transaction: unknown): string {
  if (!transaction) return "—";
  if (typeof transaction === "string") return transaction;
  if (typeof transaction === "object" && transaction !== null) {
    if ("_id" in transaction) return String((transaction as any)._id);
    if ("id" in transaction) return String((transaction as any).id);
  }
  return "—";
}

export function getPaymentIntentString(paymentIntent: unknown): string {
  if (!paymentIntent) return "—";
  if (typeof paymentIntent === "string") return paymentIntent;
  if (typeof paymentIntent === "object" && paymentIntent !== null) {
    if ("id" in paymentIntent) return String((paymentIntent as any).id);
    if ("_id" in paymentIntent) return String((paymentIntent as any)._id);
  }
  return "—";
}

