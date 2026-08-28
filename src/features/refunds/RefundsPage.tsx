import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Table, Tabs, Tooltip, type TableProps } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  RollbackOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
  useDeleteRefundMutation,
  useGetRefundsQuery,
} from "@/redux/features/refunds/refundsApi";
import {
  REFUND_STATUS_OPTIONS,
  type ApiRefund,
  type RefundStatus,
} from "@/redux/features/refunds/refunds.types";
import {
  normalizeRefundStatus,
  normalizeRefundType,
  refundStatusDotClassMap,
  refundStatusLabelMap,
  refundStatusToneMap,
  refundTypeLabelMap,
} from "./statusMaps";

type StatusTab = RefundStatus | "all";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: RefundStatus) {
  const { data } = useGetRefundsQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

export default function RefundsPage() {
  const navigate = useNavigate();
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab]);

  const allCount = useStatusCount();
  const pendingCount = useStatusCount("pending");
  const refundedCount = useStatusCount("refunded");
  const rejectedCount = useStatusCount("rejected");

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    pending: pendingCount,
    refunded: refundedCount,
    rejected: rejectedCount,
  };

  const { data, isFetching } = useGetRefundsQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? undefined : statusTab,
  });

  const [deleteRefund] = useDeleteRefundMutation();

  const refunds = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiRefund>(async (record) => {
    const promise = deleteRefund(record._id).unwrap();

    toast.promise(promise, {
      loading: "Deleting refund request…",
      success: `Refund for ${record.order?.order_id ?? "this order"} was deleted.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const columns: TableProps<ApiRefund>["columns"] = [
    {
      title: "Request",
      key: "order",
      render: (_, record) => (
        <button
          type="button"
          className="text-left"
          onClick={() => navigate(`/store/refunds/${record._id}`)}
        >
          <div className="font-display font-semibold text-cloud-100 transition hover:text-violet-glow">
            {record.order?.order_id ?? "—"}
          </div>
          <div className="text-xs text-mist-500">{formatDate(record.createdAt)}</div>
        </button>
      ),
    },
    {
      title: "Customer",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={getImageUrl(record.user?.image)}
            icon={<UserOutlined />}
            size={38}
            className="bg-violet-600/25! text-violet-glow!"
          />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{record.user?.name || "Deleted user"}</div>
            <div className="max-w-48 truncate text-xs text-mist-400">
              {record.user?.email || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Reason",
      key: "reason",
      responsive: ["md"],
      render: (_, record) => (
        <p className="max-w-64 truncate text-sm text-mist-300">{record.reason || "—"}</p>
      ),
    },
    {
      title: "Type",
      key: "refundType",
      responsive: ["lg"],
      render: (_, record) => (
        <StatusTag tone="violet">{refundTypeLabelMap[normalizeRefundType(record.refundType)]}</StatusTag>
      ),
    },
    {
      title: "Order total",
      key: "total",
      responsive: ["xl"],
      render: (_, record) => (
        <span className="font-display font-semibold text-cloud-100">
          {formatCurrency(record.order?.price_breakdown?.total_price ?? 0)}
        </span>
      ),
    },
    {
      title: "Refund",
      key: "refundAmount",
      render: (_, record) => (
        <span className="font-display font-semibold text-warning">
          {formatCurrency(record.refundAmount ?? 0)}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = normalizeRefundStatus(record.status);
        return <StatusTag tone={refundStatusToneMap[status]}>{refundStatusLabelMap[status]}</StatusTag>;
      },
    },
    {
      title: "",
      key: "actions",
      width: 108,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Review request">
            <Button
              type="text"
              className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/store/refunds/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete request">
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
    { key: "all", label: "All", count: tabCounts.all },
    ...REFUND_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: refundStatusLabelMap[status],
      count: tabCounts[status],
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <RollbackOutlined className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">Refund requests</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Review customer refund requests, inspect evidence, and approve a full or partial
              refund — or reject with a note.
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm">
            <div className="font-semibold text-warning">{pendingCount} pending</div>
            <div className="text-xs text-mist-400">Awaiting your review</div>
          </div>
        )}
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
                        refundStatusDotClassMap[tab.key as RefundStatus]
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

        <div className="flex flex-col gap-2.5 border-t border-navy-700/60 p-4 sm:flex-row sm:items-center md:px-5">
          <SearchInput
            placeholder="Search by order ID, name, or email…"
            value={search}
            onChange={setSearch}
            className="sm:w-80!"
          />
          <div className="sm:ml-auto text-xs text-mist-600">
            {pagination?.total ?? 0} request{(pagination?.total ?? 0) === 1 ? "" : "s"}
          </div>
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && refunds.length === 0 ? (
          <EmptyState
            icon={<RollbackOutlined />}
            title="No refund requests"
            description="Try another status tab, or clear the search to see every request."
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={refunds}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} requests`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title="Delete this refund request?"
        description={`This permanently removes the refund request${
          deleteFlow.target?.order?.order_id
            ? ` for ${deleteFlow.target.order.order_id}`
            : ""
        }. This can't be undone.`}
        confirmLabel="Delete request"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
