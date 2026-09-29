import {
  ShoppingOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  InboxOutlined,
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { IOrderStats, PaymentStatus } from "@/redux/features/orders/orders.types";
import { formatPrice } from "../orderHelpers";

interface OrderStatsHeaderProps {
  stats?: IOrderStats;
  loading?: boolean;
  activeStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
  activePaymentFilter?: string;
  onSelectPaymentStatus?: (paymentStatus: PaymentStatus | "all" | "") => void;
}

export function OrderStatsHeader({
  stats,
  loading = false,
  activeStatusFilter,
  onSelectStatus,
  activePaymentFilter,
  onSelectPaymentStatus,
}: OrderStatsHeaderProps) {
  const totalOrders = stats?.totalOrders ?? 0;
  const paidOrders = stats?.paidOrders ?? 0;
  const paidPercentage = totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 2xl:gap-4">
      {/* 1. GROSS REVENUE & FINANCIAL BREAKDOWN */}
      <GlassCard className="relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-emerald-800">
              Total Revenue
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50">
              <DollarOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-[#0B3D2E] tracking-tight">
              {loading ? "…" : formatPrice(stats?.totalRevenue ?? 0)}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] 2xl:text-xs text-mist-500">
              <CalendarOutlined className="text-[10px]" />
              <span>Month: {formatPrice(stats?.thisMonthRevenue ?? 0)}</span>
              <span>•</span>
              <span>Today: {formatPrice(stats?.todayRevenue ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Micro Financial Breakdown */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1 2xl:gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] 2xl:text-[11px] bg-gray-50 text-gray-600 font-medium">
            Subtotal: <strong className="ml-1 text-gray-900">{formatPrice(stats?.totalSubtotal ?? 0)}</strong>
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] 2xl:text-[11px] bg-gray-50 text-gray-600 font-medium">
            Ship: <strong className="ml-1 text-gray-900">{formatPrice(stats?.totalDeliveryCharges ?? 0)}</strong>
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] 2xl:text-[11px] bg-gray-50 text-gray-600 font-medium">
            Tax: <strong className="ml-1 text-gray-900">{formatPrice(stats?.totalTaxCollected ?? 0)}</strong>
          </span>
          {(stats?.totalDiscountAmount ?? 0) > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] 2xl:text-[11px] bg-rose-50 text-rose-700 font-medium">
              Disc: -{formatPrice(stats?.totalDiscountAmount)}
            </span>
          )}
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl" />
      </GlassCard>

      {/* 2. TOTAL ORDER VOLUME */}
      <GlassCard
        className={`relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all ${
          onSelectStatus ? "cursor-pointer" : ""
        } ${activeStatusFilter === "all" ? "ring-2 ring-indigo-500/40" : ""}`}
        onClick={() => onSelectStatus?.("all")}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-indigo-800">
              Order Volume
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/50">
              <ShoppingOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-indigo-950 tracking-tight">
              {loading ? "…" : `${totalOrders} Orders`}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] 2xl:text-xs text-mist-500">
              <CalendarOutlined className="text-[10px]" />
              <span>Month: {stats?.thisMonthOrders ?? 0}</span>
              <span>•</span>
              <span>Today: {stats?.todayOrders ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Volume Sub-stats */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1 2xl:gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] 2xl:text-[11px] bg-indigo-50/70 text-indigo-900 font-medium">
            Items Sold: <strong className="ml-1 text-indigo-950">{stats?.totalItemsSold ?? 0} pcs</strong>
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] 2xl:text-[11px] bg-gray-50 text-gray-600 font-medium">
            Avg: <strong className="ml-1 text-gray-900">{totalOrders > 0 ? formatPrice((stats?.totalRevenue ?? 0) / totalOrders) : "$0"}</strong>
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-indigo-500/10 blur-xl" />
      </GlassCard>

      {/* 3. FULFILLMENT PIPELINE */}
      <GlassCard className="relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-amber-800">
              Fulfillment Pipeline
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/50">
              <CarOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-amber-900 tracking-tight">
              {loading
                ? "…"
                : `${(stats?.shippedOrders ?? 0) + (stats?.deliveredOrders ?? 0)} Dispatched`}
            </h2>
            <p className="mt-0.5 text-[11px] 2xl:text-xs text-mist-500">
              {stats?.deliveredOrders ?? 0} delivered • {stats?.shippedOrders ?? 0} in transit
            </p>
          </div>
        </div>

        {/* Interactive Clickable Status Chips */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onSelectStatus?.("pending")}
            className={`px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] transition-colors cursor-pointer ${
              activeStatusFilter === "pending"
                ? "bg-amber-200 text-amber-950 font-bold ring-1 ring-amber-400"
                : "bg-gray-100/80 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending: <strong>{stats?.pendingOrders ?? 0}</strong>
          </button>

          <button
            type="button"
            onClick={() => onSelectStatus?.("confirmed")}
            className={`px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] transition-colors cursor-pointer ${
              activeStatusFilter === "confirmed"
                ? "bg-blue-200 text-blue-950 font-bold ring-1 ring-blue-400"
                : "bg-gray-100/80 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Confirmed: <strong>{stats?.confirmedOrders ?? 0}</strong>
          </button>

          <button
            type="button"
            onClick={() => onSelectStatus?.("processing")}
            className={`px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] transition-colors cursor-pointer ${
              activeStatusFilter === "processing"
                ? "bg-purple-200 text-purple-950 font-bold ring-1 ring-purple-400"
                : "bg-gray-100/80 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Processing: <strong>{stats?.processingOrders ?? 0}</strong>
          </button>

          <button
            type="button"
            onClick={() => onSelectStatus?.("delivered")}
            className={`px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] transition-colors cursor-pointer ${
              activeStatusFilter === "delivered"
                ? "bg-emerald-200 text-emerald-950 font-bold ring-1 ring-emerald-400"
                : "bg-gray-100/80 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Delivered: <strong>{stats?.deliveredOrders ?? 0}</strong>
          </button>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-amber-500/10 blur-xl" />
      </GlassCard>

      {/* 4. PAYMENT SETTLEMENTS */}
      <GlassCard className="relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-sky-800">
              Payment Settlements
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/50">
              <CreditCardOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-sky-950 tracking-tight">
              {loading ? "…" : `${paidOrders} Paid (${paidPercentage}%)`}
            </h2>
            <p className="mt-0.5 text-[11px] 2xl:text-xs text-mist-500">
              {stats?.pendingPaymentOrders ?? 0} pending settlement
            </p>
          </div>
        </div>

        {/* Payment Status Chips */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onSelectPaymentStatus?.("paid")}
            className={`px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] transition-colors cursor-pointer ${
              activePaymentFilter === "paid"
                ? "bg-emerald-200 text-emerald-950 font-bold ring-1 ring-emerald-400"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Paid: <strong>{paidOrders}</strong>
          </button>

          <button
            type="button"
            onClick={() => onSelectPaymentStatus?.("pending")}
            className={`px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] transition-colors cursor-pointer ${
              activePaymentFilter === "pending"
                ? "bg-amber-200 text-amber-950 font-bold ring-1 ring-amber-400"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Pending: <strong>{stats?.pendingPaymentOrders ?? 0}</strong>
          </button>

          {(stats?.failedOrders ?? 0) > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] bg-rose-50 text-rose-800">
              Failed: <strong>{stats?.failedOrders}</strong>
            </span>
          )}

          {(stats?.refundedOrders ?? 0) > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] bg-gray-100 text-gray-700">
              Refunded: <strong>{stats?.refundedOrders}</strong>
            </span>
          )}
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-sky-500/10 blur-xl" />
      </GlassCard>

      {/* 5. PRE-ORDER BATCHES */}
      <GlassCard className="relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-purple-800">
              Pre-Order Batches
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 ring-1 ring-purple-200/50">
              <InboxOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-purple-950 tracking-tight">
              {loading ? "…" : `${stats?.totalPreOrderItems ?? 0} Reserved`}
            </h2>
            <p className="mt-0.5 text-[11px] 2xl:text-xs text-mist-500">
              {stats?.readyPreOrders ?? 0} ready for customer dispatch
            </p>
          </div>
        </div>

        {/* Pre-order Status Breakdown */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1">
          <span className="px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] bg-purple-50 text-purple-900 font-medium">
            Confirmed: <strong>{stats?.confirmedPreOrders ?? 0}</strong>
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] bg-emerald-50 text-emerald-900 font-medium">
            Ready: <strong>{stats?.readyPreOrders ?? 0}</strong>
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] 2xl:text-[11px] bg-gray-50 text-gray-700 font-medium">
            Completed: <strong>{stats?.completedPreOrders ?? 0}</strong>
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-purple-500/10 blur-xl" />
      </GlassCard>
    </div>
  );
}

