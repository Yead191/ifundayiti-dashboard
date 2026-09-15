export interface BadgeConfig {
  label: string;
  className: string;
  dotColor?: string;
}

export const EVENT_CATEGORY_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
  fundraiser: {
    label: "Fundraiser",
    color: "#059669",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "pitch-night": {
    label: "Pitch Night",
    color: "#7c3aed",
    bgClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  workshop: {
    label: "Workshop",
    color: "#0284c7",
    bgClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  gala: {
    label: "Gala & Banquet",
    color: "#d97706",
    bgClass: "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200/50",
  },
};

export const EVENT_FORMAT_CONFIG: Record<string, { label: string; iconName: string; bgClass: string }> = {
  physical: {
    label: "In-Person (Physical)",
    iconName: "EnvironmentOutlined",
    bgClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
  virtual: {
    label: "Virtual Stream",
    iconName: "VideoCameraOutlined",
    bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  hybrid: {
    label: "Hybrid Experience",
    iconName: "GlobalOutlined",
    bgClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

export const EVENT_STATUS_CONFIG: Record<string, { label: string; bgClass: string; dotClass: string }> = {
  published: {
    label: "Published",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  draft: {
    label: "Draft",
    bgClass: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
  },
  completed: {
    label: "Completed",
    bgClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  cancelled: {
    label: "Cancelled",
    bgClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
  },
};

export const BOOKING_STATUS_CONFIG: Record<string, { label: string; bgClass: string }> = {
  confirmed: {
    label: "Confirmed",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Pending",
    bgClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  attended: {
    label: "Attended / Checked-In",
    bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  cancelled: {
    label: "Cancelled",
    bgClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; bgClass: string }> = {
  paid: {
    label: "Paid via Stripe",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  free: {
    label: "Complimentary (Free)",
    bgClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  pending: {
    label: "Payment Pending",
    bgClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  failed: {
    label: "Payment Failed",
    bgClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function getCategoryBadge(category?: string) {
  const key = (category || "").toLowerCase();
  return (
    EVENT_CATEGORY_CONFIG[key] ?? {
      label: category || "Gathering",
      color: "#475569",
      bgClass: "bg-slate-100 text-slate-700 border-slate-200",
    }
  );
}

export function getFormatBadge(format?: string) {
  const key = (format || "").toLowerCase();
  return (
    EVENT_FORMAT_CONFIG[key] ?? {
      label: format || "Physical",
      iconName: "EnvironmentOutlined",
      bgClass: "bg-slate-100 text-slate-700 border-slate-200",
    }
  );
}

export function getStatusBadge(status?: string) {
  const key = (status || "").toLowerCase();
  return (
    EVENT_STATUS_CONFIG[key] ?? {
      label: status || "Draft",
      bgClass: "bg-slate-100 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
    }
  );
}

export function getBookingStatusBadge(status?: string) {
  const key = (status || "").toLowerCase();
  return (
    BOOKING_STATUS_CONFIG[key] ?? {
      label: status || "Pending",
      bgClass: "bg-slate-100 text-slate-600 border-slate-200",
    }
  );
}

export function getPaymentStatusBadge(status?: string) {
  const key = (status || "").toLowerCase();
  return (
    PAYMENT_STATUS_CONFIG[key] ?? {
      label: status || "Unpaid",
      bgClass: "bg-slate-100 text-slate-600 border-slate-200",
    }
  );
}

export const eventStatusLabelMap: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const eventTypeLabelMap: Record<string, string> = {
  physical: "Physical",
  virtual: "Virtual",
  hybrid: "Hybrid",
};

