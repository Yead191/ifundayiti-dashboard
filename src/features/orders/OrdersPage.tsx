import { useEffect, useState } from "react";
import { Avatar, Badge, Button, DatePicker, Select, Table, Tabs, Tooltip, type TableProps } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useDeleteOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/features/orders/ordersApi";
import {
  ORDER_PAYMENT_STATUS_OPTIONS,
  ORDER_STATUS_OPTIONS,
  type ApiOrder,
  type OrderPaymentStatus,
  type OrderStatus,
} from "@/redux/features/orders/orders.types";
import {
  orderStatusColorMap,
  orderStatusLabelMap,
  paymentLabel,
  paymentStatusLabelMap,
  paymentStatusToneMap,
} from "./statusMaps";
import { OrderDetailModal } from "./components/OrderDetailModal";
import { OrderStatusSelect } from "./components/OrderStatusSelect";

const { RangePicker } = DatePicker;

type StatusTab = OrderStatus | "all";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: OrderStatus) {
  const { data } = useGetOrdersQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

export default function OrdersPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | "">("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState<ApiOrder | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab, paymentStatus, dateRange]);

  const allCount = useStatusCount();
  const pendingCount = useStatusCount("Pending");
  const processingCount = useStatusCount("Processing");
  const deliveredCount = useStatusCount("Deliverd");
  const cancelledCount = useStatusCount("Cancelled");

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    Pending: pendingCount,
    Processing: processingCount,
    Deliverd: deliveredCount,
    Cancelled: cancelledCount,
  };

  const { data, isFetching } = useGetOrdersQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? undefined : statusTab,
    payment_status: paymentStatus || undefined,
    startDate: dateRange?.[0]?.startOf("day").toISOString(),
    endDate: dateRange?.[1]?.endOf("day").toISOString(),
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiOrder>(async (record) => {
    const promise = deleteOrder(record._id)
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: `Deleting ${record.order_id}…`,
      success: `${record.order_id} was deleted.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const applyStatusChange = (order: ApiOrder, status: OrderStatus) => {
    const promise = updateStatus({ id: order._id, status })
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev && prev._id === order._id ? { ...prev, status } : prev));
      });

    toast.promise(promise, {
      loading: `Updating ${order.order_id}…`,
      success: `${order.order_id} is now ${orderStatusLabelMap[status].toLowerCase()}.`,
      error: (err) => getErrorMessage(err),
    });
  };

  const columns: TableProps<ApiOrder>["columns"] = [
    {
      title: "Order",
      key: "order_id",
      render: (_, record) => (
        <button type="button" className="text-left" onClick={() => setViewing(record)}>
          <div className="font-display font-semibold text-cloud-100 transition hover:text-violet-glow">
            {record.order_id}
          </div>
          <div className="text-xs text-mist-500">
            {record.items.length} line{record.items.length === 1 ? "" : "s"}
            {record.createdAt ? ` · ${formatDate(record.createdAt)}` : ""}
          </div>
        </button>
      ),
    },
    {
      title: "Customer",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={getImageUrl(record.user.image)}
            icon={<UserOutlined />}
            size={38}
            className="bg-violet-600/25! text-violet-glow!"
          />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{record.user.name}</div>
            <div className="max-w-48 truncate text-xs text-mist-400">{record.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Items",
      key: "items",
      responsive: ["lg"],
      render: (_, record) => {
        const preview = record.items.slice(0, 3);
        const extra = record.items.length - preview.length;
        return (
          <div className="flex items-center gap-1.5">
            {preview.map((item, index) => (
              <Tooltip key={`${item.title}-${index}`} title={`${item.title} ×${item.quantity}`}>
                <div className="h-9 w-9 overflow-hidden rounded-lg border border-navy-700/70 bg-navy-900">
                  <img src={getImageUrl(item.image)} alt="" className="h-full w-full object-cover" />
                </div>
              </Tooltip>
            ))}
            {extra > 0 && (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-700/70 bg-navy-800/60 text-xs text-mist-400">
                +{extra}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) => (
        <span className="font-display font-semibold text-cloud-100">
          {formatCurrency(record.price_breakdown.total_price)}
        </span>
      ),
    },
    {
      title: "Payment",
      key: "payment_status",
      responsive: ["md"],
      render: (_, record) => (
        <StatusTag tone={paymentStatusToneMap[record.payment_status] ?? "neutral"}>
          {paymentLabel(record.payment_status)}
        </StatusTag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <OrderStatusSelect
          value={record.status}
          onChange={(status) => applyStatusChange(record, status)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 108,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="View order">
            <Button
              type="text"
              className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
              icon={<EyeOutlined />}
              onClick={() => setViewing(record)}
            />
          </Tooltip>
          <Tooltip title="Delete order">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteFlow.request(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: "all" as const, label: "All", count: tabCounts.all },
    ...ORDER_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: orderStatusLabelMap[status],
      count: tabCounts[status],
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 overflow-hidden p-6 md:flex-row md:items-center">
        <div className="relative flex items-start gap-4">
          <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-violet-600/20 blur-[60px]" />
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <ShoppingOutlined className="text-lg text-white" />
          </div>
          <div className="relative">
            <h2 className="font-display text-xl font-semibold text-cloud-100">Manage orders</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Track store purchases, review line items and pricing, and update fulfillment status.
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2">
          <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm">
            <div className="font-semibold text-warning">{pendingCount} pending</div>
            <div className="text-xs text-mist-400">Awaiting action</div>
          </div>
          <div className="rounded-2xl border border-info/25 bg-info/10 px-4 py-3 text-sm">
            <div className="font-semibold text-info">{processingCount} processing</div>
            <div className="text-xs text-mist-400">In progress</div>
          </div>
        </div>
      </div>

      <GlassCard flat className="mb-4" padded={false}>
        <div className="px-4 pt-2 md:px-5">
          <Tabs
            activeKey={statusTab}
            onChange={(key) => setStatusTab(key as StatusTab)}
            items={tabItems.map((tab) => ({
              key: tab.key,
              label: (
                <span className="flex items-center gap-2">
                  {tab.key !== "all" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        orderStatusColorMap[tab.key as OrderStatus].dot
                      )}
                    />
                  )}
                  {tab.label}
                  <Badge
                    count={tab.count}
                    showZero
                    overflowCount={999}
                    style={{
                      backgroundColor: statusTab === tab.key ? "#8131F0" : "#23274f",
                      color: statusTab === tab.key ? "#fff" : "#9ca3c9",
                      boxShadow: "none",
                    }}
                  />
                </span>
              ),
            }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 border-t border-navy-700/60 p-4 sm:grid-cols-2 xl:grid-cols-4 md:px-5">
          <SearchInput
            placeholder="Search order ID, customer…"
            value={search}
            onChange={setSearch}
          />
          <Select
            allowClear
            placeholder="Payment status"
            value={paymentStatus || undefined}
            options={ORDER_PAYMENT_STATUS_OPTIONS.map((s) => ({
              label: paymentStatusLabelMap[s] ?? s,
              value: s,
            }))}
            onChange={(value) => setPaymentStatus(value ?? "")}
            className="w-full!"
          />
          <RangePicker
            className="w-full! sm:col-span-2 xl:col-span-2"
            value={dateRange}
            onChange={(range) => setDateRange((range as [Dayjs, Dayjs] | null) ?? null)}
            placeholder={["From date", "To date"]}
          />
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingOutlined />}
            title="No orders in this view"
            description="Try another status tab, payment filter, or clear the date range."
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={orders}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} orders`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <OrderDetailModal
        order={viewing}
        open={!!viewing}
        updating={isUpdatingStatus}
        onClose={() => setViewing(null)}
        onStatusChange={(status) => {
          if (!viewing) return;
          applyStatusChange(viewing, status);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete ${deleteFlow.target?.order_id}?`}
        description="This permanently removes the order and its line items from Hubology. This can't be undone."
        confirmLabel="Delete order"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
