import { Tabs, Badge, Input, Select, Button, Tooltip } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { PaymentStatus } from "@/redux/features/orders/orders.types";

interface OrderFiltersBarProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  paymentStatus: PaymentStatus | "all" | "";
  onPaymentStatusChange: (status: PaymentStatus | "all" | "") => void;
  totalCount?: number;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export function OrderFiltersBar({
  activeStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  paymentStatus,
  onPaymentStatusChange,
  totalCount,
  onRefresh,
  isFetching = false,
}: OrderFiltersBarProps) {
  const tabItems = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2 py-1 px-1 font-semibold">
          <ShoppingOutlined />
          <span>All Orders</span>
          {activeStatus === "all" && totalCount !== undefined && (
            <Badge
              count={totalCount}
              showZero
              style={{
                backgroundColor: "#0b3d2e",
                color: "#fff",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "confirmed",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <CheckCircleOutlined className="text-emerald-500" />
          <span>Confirmed</span>
          {activeStatus === "confirmed" && totalCount !== undefined && (
            <Badge
              count={totalCount}
              showZero
              style={{
                backgroundColor: "#059669",
                color: "#fff",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "processing",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <SyncOutlined className="text-blue-500" />
          <span>Processing</span>
          {activeStatus === "processing" && totalCount !== undefined && (
            <Badge
              count={totalCount}
              showZero
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "shipped",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <CarOutlined className="text-indigo-500" />
          <span>Shipped</span>
          {activeStatus === "shipped" && totalCount !== undefined && (
            <Badge
              count={totalCount}
              showZero
              style={{
                backgroundColor: "#4f46e5",
                color: "#fff",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "delivered",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <CheckCircleOutlined className="text-teal-500" />
          <span>Delivered</span>
          {activeStatus === "delivered" && totalCount !== undefined && (
            <Badge
              count={totalCount}
              showZero
              style={{
                backgroundColor: "#0d9488",
                color: "#fff",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "cancelled",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <CloseCircleOutlined className="text-rose-500" />
          <span>Cancelled</span>
          {activeStatus === "cancelled" && totalCount !== undefined && (
            <Badge
              count={totalCount}
              showZero
              style={{
                backgroundColor: "#e11d48",
                color: "#fff",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "pending",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <ClockCircleOutlined className="text-amber-500" />
          <span>Pending Pay</span>
          {activeStatus === "pending" && totalCount !== undefined && (
            <Badge
              count={totalCount}
              showZero
              style={{
                backgroundColor: "#d97706",
                color: "#fff",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
  ];

  return (
    <GlassCard className="border border-navy-700/60 p-4 shadow-xs">
      {/* Top row: Status Tabs */}
      <div className="border-b border-navy-700/50 pb-2">
        <Tabs
          activeKey={activeStatus}
          onChange={onStatusChange}
          items={tabItems}
          className="[&_.ant-tabs-nav]:mb-0"
        />
      </div>

      {/* Bottom row: Search, Payment Status Dropdown, Refresh */}
      <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Input
              prefix={<SearchOutlined className="text-mist-400" />}
              placeholder="Search by Order ID, customer name, contact phone, or product title..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              allowClear
              className="h-10 w-full rounded-xl border-navy-700/70 bg-white/90 text-sm shadow-2xs hover:border-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Payment Status Dropdown */}
          <Select
            value={paymentStatus || "all"}
            onChange={(val) => onPaymentStatusChange(val as PaymentStatus | "all")}
            className="h-10 w-full sm:w-52"
            options={[
              { value: "all", label: "All Payment Statuses" },
              { value: "paid", label: "Paid via Stripe" },
              { value: "pending", label: "Payment Pending" },
              { value: "failed", label: "Payment Failed" },
              { value: "refunded", label: "Refunded" },
            ]}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5">
          {onRefresh && (
            <Tooltip title="Refresh orders">
              <Button
                icon={<ReloadOutlined spin={isFetching} />}
                onClick={onRefresh}
                className="h-10 w-10 rounded-xl border-navy-700/70 bg-white/80 p-0 text-mist-500 hover:border-emerald-600 hover:text-emerald-700"
              />
            </Tooltip>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
