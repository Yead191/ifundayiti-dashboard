import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Input,
  Table,
  Button,
  Segmented,
  Select,
  Tooltip,
  Tag,
  Avatar,
} from "antd";
import type { TableProps } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckOutlined,
  DollarCircleOutlined,
  ShoppingOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import {
  useGetTransactionsQuery,
  useGetTransactionStatsQuery,
  useDeleteTransactionMutation,
  useDeleteMultipleTransactionsMutation,
} from "@/redux/features/transactions/transactionsApi";
import type {
  ITransaction,
  TransactionOrderRef,
  TransactionUser,
} from "@/redux/features/transactions/transactions.types";
import { TransactionDetailModal } from "./components/TransactionDetailModal";
import { DeleteTransactionModal } from "./components/DeleteTransactionModal";

export default function TransactionsPage() {
  // Query & Filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: searchTerm,
  } = useDebouncedSearch();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Selection & Modal states
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [inspectingTx, setInspectingTx] = useState<ITransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<ITransaction | null>(null);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stats query
  const {
    data: statsRes,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useGetTransactionStatsQuery();

  // Transactions query
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      sort: "-createdAt",
    }),
    [page, limit, searchTerm, categoryFilter, statusFilter, typeFilter],
  );

  const {
    data: txRes,
    isLoading: isLoadingTx,
    isFetching,
    refetch: refetchTx,
  } = useGetTransactionsQuery(queryParams);

  const [deleteTransaction, { isLoading: isDeletingSingle }] =
    useDeleteTransactionMutation();
  const [deleteMultiple, { isLoading: isDeletingMultiple }] =
    useDeleteMultipleTransactionsMutation();

  const transactions = txRes?.data || [];
  const pagination = txRes?.pagination;

  const stats = statsRes?.data || {
    totalRevenue: 0,
    shopRevenue: 0,
    membershipRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    creditTransactions: 0,
    debitTransactions: 0,
  };

  const handleRefresh = () => {
    refetchStats();
    refetchTx();
  };

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Reference copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deletingTx) return;
    try {
      await deleteTransaction(deletingTx._id).unwrap();
      toast.success("Transaction record deleted successfully");
      setDeletingTx(null);
      if (inspectingTx?._id === deletingTx._id) {
        setInspectingTx(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete transaction");
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      const ids = selectedRowKeys.map(String);
      const res = await deleteMultiple({ ids }).unwrap();
      toast.success(
        `${res?.data?.deletedCount || ids.length} transaction(s) deleted successfully`,
      );
      setSelectedRowKeys([]);
      setBatchDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to delete selected transactions",
      );
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.warning("No transactions available to export");
      return;
    }

    const headers = [
      "Transaction ID",
      "Payment Intent ID",
      "Customer Name",
      "Customer Email",
      "Category",
      "Type",
      "Amount ($)",
      "Received ($)",
      "Discount ($)",
      "Status",
      "Payment Method",
      "Order Number",
      "Created At",
    ];

    const rows = transactions.map((t) => {
      const u = typeof t.user === "object" ? t.user : null;
      const o = typeof t.order === "object" ? t.order : null;
      return [
        `"${t.transaction_id || t._id}"`,
        `"${t.payment_intent_id || ""}"`,
        `"${u?.name || "Customer"}"`,
        `"${u?.email || ""}"`,
        `"${t.category || ""}"`,
        `"${t.type || ""}"`,
        t.total_price ?? t.amount ?? 0,
        t.payment_received ?? 0,
        t.discount_amount ?? 0,
        `"${t.status || ""}"`,
        `"${t.payment_method || "stripe"}"`,
        `"${o?.orderNumber || ""}"`,
        `"${t.createdAt}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ifundayiti-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully");
  };

  const columns: TableProps<ITransaction>["columns"] = [
    {
      title: "Transaction ID / Ref",
      key: "transaction_id",
      width: 220,
      render: (_, record) => {
        const displayRef =
          record.transaction_id || record.payment_intent_id || record._id;
        const shortRef =
          displayRef.length > 18
            ? `${displayRef.slice(0, 8)}…${displayRef.slice(-6)}`
            : displayRef;
        const isCopied = copiedId === displayRef;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100/90 px-2 py-0.5 rounded-md border border-gray-200/60">
                {shortRef}
              </span>
              <Tooltip title={isCopied ? "Copied" : "Copy reference"}>
                <button
                  type="button"
                  onClick={(e) => handleCopy(displayRef, e)}
                  className="text-gray-400 hover:text-[#0B3D2E] transition-colors p-0.5"
                >
                  {isCopied ? (
                    <CheckOutlined className="text-emerald-600 text-xs" />
                  ) : (
                    <CopyOutlined className="text-xs" />
                  )}
                </button>
              </Tooltip>
            </div>
            <div className="text-[11px] text-gray-400">
              {record.payment_method ? (
                <span className="capitalize">{record.payment_method}</span>
              ) : (
                "Stripe"
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Customer",
      key: "user",
      width: 220,
      render: (_, record) => {
        const user =
          typeof record.user === "object"
            ? (record.user as TransactionUser)
            : null;

        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={getImageUrl(user?.image || "")}
              icon={<UserOutlined />}
              size={36}
              className="bg-emerald-50 text-[#0B3D2E] border border-emerald-100/80 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-gray-900 truncate">
                {user?.name || "Verified Customer"}
              </div>
              <div className="text-[11px] text-gray-400 truncate">
                {user?.email || "—"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Category",
      key: "category",
      width: 140,
      render: (_, record) => {
        const cat = String(record.category || "Shop");
        const isShop = cat.toLowerCase() === "shop";
        const isMembership = cat.toLowerCase() === "membership";

        return (
          <Tag
            bordered={false}
            className={`rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 border ${
              isMembership
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : isShop
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-teal-50 text-teal-700 border-teal-200"
            }`}
          >
            <span className="flex items-center gap-1">
              {isMembership ? (
                <CrownOutlined />
              ) : isShop ? (
                <ShoppingOutlined />
              ) : (
                <AppstoreOutlined />
              )}
              <span>{cat}</span>
            </span>
          </Tag>
        );
      },
    },
    {
      title: "Amount",
      key: "amount",
      width: 150,
      render: (_, record) => {
        const isCredit = String(record.type).toLowerCase() === "credit";
        const price = record.total_price ?? record.amount ?? 0;
        const discount = record.discount_amount || 0;
        const fee = record.platform_fee || 0;

        return (
          <Tooltip
            title={
              <div className="text-xs space-y-1 py-0.5">
                <div>Base Price: {formatCurrency(price)}</div>
                {discount > 0 && (
                  <div>Discount: -{formatCurrency(discount)}</div>
                )}
                {fee > 0 && <div>Platform Fee: {formatCurrency(fee)}</div>}
                <div className="font-bold border-t border-white/20 pt-1">
                  Net:{" "}
                  {formatCurrency(record.payment_received ?? price - discount)}
                </div>
              </div>
            }
          >
            <div className="cursor-help">
              <span
                className={`font-display text-sm font-bold ${
                  isCredit ? "text-emerald-700" : "text-gray-900"
                }`}
              >
                {isCredit ? "+" : "-"}
                {formatCurrency(price)}
              </span>
              {discount > 0 && (
                <div className="text-[11px] text-amber-600 font-medium">
                  -{formatCurrency(discount)} off
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => {
        const st = String(record.status || "Success");
        const isSuccess = st.toLowerCase() === "success";
        const isPending = st.toLowerCase() === "pending";

        return (
          <Tag
            bordered={false}
            className={`rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 border ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isPending
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <span className="flex items-center gap-1">
              {isSuccess ? (
                <CheckCircleOutlined />
              ) : isPending ? (
                <ClockCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )}
              <span>{st}</span>
            </span>
          </Tag>
        );
      },
    },
    {
      title: "Linked Order",
      key: "order",
      width: 160,
      render: (_, record) => {
        const order =
          typeof record.order === "object"
            ? (record.order as TransactionOrderRef)
            : null;
        const orderId =
          order?._id ||
          (typeof record.order === "string" ? record.order : null);
        const orderNumber =
          order?.orderNumber ||
          (orderId ? `ORD-${orderId.slice(-6).toUpperCase()}` : null);

        if (!orderId) {
          return <span className="text-gray-400 text-xs">—</span>;
        }

        return (
          <Link
            to={`/shop/orders/${orderId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100/80 px-2 py-0.5 rounded-lg transition-colors border border-indigo-200/60"
          >
            <span>{orderNumber}</span>
            <ArrowRightOutlined className="text-[10px]" />
          </Link>
        );
      },
    },
    {
      title: "Date & Time",
      key: "createdAt",
      width: 170,
      render: (_, record) => (
        <span className="text-xs text-gray-500">
          {formatDateTime(record.createdAt)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "right",
      render: (_, record) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="View Transaction Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setInspectingTx(record)}
              className="h-8 w-8 rounded-lg text-gray-500 hover:text-[#0B3D2E] hover:bg-emerald-50"
            />
          </Tooltip>

          <Tooltip title="Delete Transaction">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeletingTx(record)}
              className="h-8 w-8 rounded-lg hover:bg-rose-50"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-cloud-100">
            Financial Transactions
          </h1>
          <p className="text-xs sm:text-sm text-mist-600 mt-1">
            Audit Stripe checkout payments, shop orders, membership renewals,
            and platform ledger events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="h-10 rounded-xl font-medium border-gray-200 hover:border-[#0B3D2E]"
          >
            Export CSV
          </Button>

          <Tooltip title="Refresh transaction statistics & data">
            <Button
              icon={
                <ReloadOutlined className={isFetching ? "animate-spin" : ""} />
              }
              onClick={handleRefresh}
              className="h-10 w-10 rounded-xl"
            />
          </Tooltip>
        </div>
      </div>

      {/* 4 Top-Tier Metric Widgets (GlassCards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Gross Revenue */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E]">
              Total Gross Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50">
              <DollarCircleOutlined className="text-lg" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B3D2E]">
              {isLoadingStats ? "…" : formatCurrency(stats.totalRevenue)}
            </h2>
            <p className="text-xs text-mist-500 mt-1">
              {stats.successfulTransactions} successful payments
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl" />
        </GlassCard>

        {/* Shop / Merchandise Revenue */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Shop / Store Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50">
              <ShoppingOutlined className="text-lg" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-indigo-950">
              {isLoadingStats ? "…" : formatCurrency(stats.shopRevenue)}
            </h2>
            <p className="text-xs text-mist-500 mt-1">
              Direct merchandise & store sales
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl" />
        </GlassCard>

        {/* Membership Subscriptions */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Membership Subscriptions
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/50">
              <CrownOutlined className="text-lg" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-amber-700">
              {isLoadingStats ? "…" : formatCurrency(stats.membershipRevenue)}
            </h2>
            <p className="text-xs text-mist-500 mt-1">
              Recurring membership contributions
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl" />
        </GlassCard>

        {/* Transaction Health & Volume */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Transaction Health & Volume
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-200/50">
              <SafetyCertificateOutlined className="text-lg" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-teal-950">
              {isLoadingStats ? "…" : `${stats.totalTransactions} events`}
            </h2>
            <p className="text-xs text-mist-500 mt-1">
              {stats.pendingTransactions} Pending • {stats.failedTransactions}{" "}
              Failed
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-teal-500/10 blur-xl" />
        </GlassCard>
      </div>

      {/* Filter & Action Toolbar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search ID, intent, or method..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          {/* Filter Controls & Batch Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Segmented */}
            <Segmented
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val as string);
                setPage(1);
              }}
              className="p-1 rounded-xl bg-gray-100 font-medium"
              options={[
                { value: "all", label: "All Categories" },
                {
                  value: "Shop",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <ShoppingOutlined className="text-indigo-600 text-xs" />
                      <span>Shop</span>
                    </span>
                  ),
                },
                {
                  value: "Membership",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <CrownOutlined className="text-amber-600 text-xs" />
                      <span>Membership</span>
                    </span>
                  ),
                },
                {
                  value: "Service",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <AppstoreOutlined className="text-teal-600 text-xs" />
                      <span>Service</span>
                    </span>
                  ),
                },
              ]}
            />

            {/* Status Dropdown */}
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              className="h-10 min-w-30"
              options={[
                { value: "all", label: "All Status" },
                { value: "Success", label: "Success" },
                { value: "Pending", label: "Pending" },
                { value: "Failed", label: "Failed" },
              ]}
            />

            {/* Type Dropdown */}
            <Select
              value={typeFilter}
              onChange={(val) => {
                setTypeFilter(val);
                setPage(1);
              }}
              className="h-10 min-w-27.5"
              options={[
                { value: "all", label: "All Types" },
                { value: "Credit", label: "Credit" },
                { value: "Debit", label: "Debit" },
              ]}
            />

            {/* Batch Delete Action */}
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => setBatchDeleteModalOpen(true)}
                className="h-10 rounded-xl bg-rose-600! hover:bg-rose-700! font-semibold px-4 shadow-sm border-0 animate-in fade-in"
              >
                Delete Selected ({selectedRowKeys.length})
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Main Transactions Table */}
      {transactions.length === 0 && !isLoadingTx ? (
        <GlassCard className="p-12 text-center">
          <EmptyState
            icon={<CreditCardOutlined className="text-4xl text-[#0B3D2E]" />}
            title={
              searchTerm ||
              categoryFilter !== "all" ||
              statusFilter !== "all" ||
              typeFilter !== "all"
                ? "No Matching Transactions"
                : "No Transactions Recorded"
            }
            description={
              searchTerm ||
              categoryFilter !== "all" ||
              statusFilter !== "all" ||
              typeFilter !== "all"
                ? "No transaction records match your search or filter parameters. Try clearing your filters."
                : "Platform Stripe payments, merchandise purchases, and membership contributions will appear here."
            }
            actionLabel={
              searchTerm ||
              categoryFilter !== "all" ||
              statusFilter !== "all" ||
              typeFilter !== "all"
                ? "Reset Filters"
                : undefined
            }
            onAction={() => {
              setSearchInput("");
              setCategoryFilter("all");
              setStatusFilter("all");
              setTypeFilter("all");
              setPage(1);
            }}
          />
        </GlassCard>
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <Table<ITransaction>
            rowKey="_id"
            columns={columns}
            dataSource={transactions}
            loading={isLoadingTx || isFetching}
            onRow={(record) => ({
              onClick: () => setInspectingTx(record),
              className:
                "cursor-pointer hover:bg-emerald-50/20 transition-colors",
            })}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} total transactions`,
              onChange: (nextPage, nextSize) => {
                setPage(nextPage);
                setLimit(nextSize);
              },
            }}
            scroll={{ x: 1100 }}
          />
        </GlassCard>
      )}

      {/* Slide-out Transaction Detail Modal */}
      <TransactionDetailModal
        open={!!inspectingTx}
        transaction={inspectingTx}
        onClose={() => setInspectingTx(null)}
        onDelete={(record) => setDeletingTx(record)}
      />

      {/* Delete Single Transaction Confirmation Modal */}
      <DeleteTransactionModal
        open={!!deletingTx}
        transaction={deletingTx}
        loading={isDeletingSingle}
        onCancel={() => setDeletingTx(null)}
        onConfirm={handleConfirmDeleteSingle}
      />

      {/* Batch Delete Confirmation Modal */}
      <DeleteTransactionModal
        open={batchDeleteModalOpen}
        batchCount={selectedRowKeys.length}
        loading={isDeletingMultiple}
        onCancel={() => setBatchDeleteModalOpen(false)}
        onConfirm={handleConfirmBatchDelete}
      />
    </div>
  );
}
