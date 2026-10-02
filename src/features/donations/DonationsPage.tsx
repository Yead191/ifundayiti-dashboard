import { useState, useMemo } from "react";
import {
  Input,
  Table,
  Button,
  Segmented,
  Tooltip,
  Tag,
  Pagination,
} from "antd";
import type { TableProps } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  GiftOutlined,
  CopyOutlined,
  CheckOutlined,
  UserOutlined,
  ProjectOutlined,
  PlusOutlined,
  HeartOutlined,
  ShopOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  useGetDonationsQuery,
  useGetFundStatsQuery,
  useDeleteDonationMutation,
  useDeleteMultipleDonationsMutation,
} from "@/redux/features/donations/donationsApi";
import type { IDonation } from "@/redux/features/donations/donations.types";
import { DonationDetailModal } from "./components/DonationDetailModal";
import { DeleteDonationModal } from "./components/DeleteDonationModal";
import { RecordManualDonationModal } from "./components/RecordManualDonationModal";
import { DonationStatsCards } from "./components/DonationStatsCards";

export default function DonationsPage() {
  // Query & Filter state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "donation" | "fund_raising" | "grant"
  >("all");

  // Selection & Modal states
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [inspectingDonation, setInspectingDonation] =
    useState<IDonation | null>(null);
  const [deletingDonation, setDeletingDonation] = useState<IDonation | null>(
    null,
  );
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Queries & Mutations
  const { data: statsRes, isLoading: isLoadingStats } = useGetFundStatsQuery();

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      searchTerm: searchTerm.trim() || undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      sort: "-createdAt",
    }),
    [page, pageSize, searchTerm, typeFilter],
  );

  const {
    data: donationsRes,
    isLoading: isLoadingDonations,
    isFetching,
    refetch,
  } = useGetDonationsQuery(queryParams);

  const [deleteDonation, { isLoading: isDeletingSingle }] =
    useDeleteDonationMutation();
  const [deleteMultiple, { isLoading: isDeletingMultiple }] =
    useDeleteMultipleDonationsMutation();

  const stats = statsRes?.data || {
    totalBalance: 0,
    balance: 0,
    programFundBalance: 0,
    totalDonations: 0,
    totalFundRaised: 0,
    totalPaidExpenses: 0,
    totalGrants: 0,
    donationCount: 0,
    fundRaisedCount: 0,
    paidExpenseCount: 0,
    grantCount: 0,
    totalCount: 0,
  };

  const donations = donationsRes?.data || [];
  const pagination = donationsRes?.pagination;

  // Handlers
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Transaction reference copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deletingDonation) return;
    try {
      await deleteDonation(deletingDonation._id).unwrap();
      toast.success("Transaction record deleted successfully");
      setDeletingDonation(null);
      if (inspectingDonation?._id === deletingDonation._id) {
        setInspectingDonation(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete record");
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      const ids = selectedRowKeys.map(String);
      const res = await deleteMultiple({ ids }).unwrap();
      toast.success(
        `${res.data?.deletedCount || ids.length} records deleted successfully`,
      );
      setSelectedRowKeys([]);
      setBatchDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete selected records");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (donations.length === 0) {
      toast.warning("No transactions available to export");
      return;
    }

    const headers = [
      "Transaction ID",
      "Type",
      "Contributor / Recipient",
      "Email",
      "Amount ($)",
      "Payment Method",
      "Payment Status",
      "Reference",
      "Recorded By",
      "Project Title",
      "Created Date",
    ];

    const rows = donations.map((d) => [
      `"${d.transactionId || d.reference || d._id}"`,
      `"${d.type}"`,
      `"${d.name || ""}"`,
      `"${d.email || ""}"`,
      d.amount,
      `"${d.payment_method || "stripe"}"`,
      `"${d.payment_status || "paid"}"`,
      `"${d.reference || ""}"`,
      `"${d.recordedBy?.name || "Online System"}"`,
      `"${d.applicant?.projectTitle || ""}"`,
      `"${new Date(d.createdAt).toISOString()}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `IFundAyiti_Transactions_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Transaction report exported as CSV");
  };

  // Table Columns
  const columns: TableProps<IDonation>["columns"] = [
    {
      title: "Transaction Ref",
      key: "transactionId",
      width: 190,
      render: (_, record) => {
        const refId = record.transactionId || record.reference || record._id;
        const isCopied = copiedId === refId;
        return (
          <div
            onClick={(e) => handleCopyId(refId, e)}
            className="group flex items-center gap-1.5 cursor-pointer max-w-fit"
            title="Click to copy reference ID"
          >
            <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-emerald-50 hover:text-[#0B3D2E] border border-gray-200/80 px-2 py-0.5 rounded-lg transition-colors">
              {refId.length > 18
                ? `${refId.slice(0, 8)}...${refId.slice(-6)}`
                : refId}
            </span>
            <button
              type="button"
              className="text-gray-400 hover:text-emerald-700 transition-colors text-xs"
            >
              {isCopied ? (
                <CheckOutlined className="text-emerald-600" />
              ) : (
                <CopyOutlined className="opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      title: "Type",
      key: "type",
      width: 130,
      render: (_, record) => {
        if (record.type === "donation") {
          return (
            <Tag
              bordered={false}
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold m-0 flex items-center gap-1 max-w-fit bg-emerald-50 text-emerald-800 border border-emerald-200/80"
            >
              <HeartOutlined className="text-emerald-600 text-[10px]" />
              <span>Donation</span>
            </Tag>
          );
        }
        if (record.type === "fund_raising") {
          return (
            <Tag
              bordered={false}
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold m-0 flex items-center gap-1 max-w-fit bg-purple-50 text-purple-800 border border-purple-200/80"
            >
              <ShopOutlined className="text-purple-600 text-[10px]" />
              <span>Fund Raising</span>
            </Tag>
          );
        }
        return (
          <Tag
            bordered={false}
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold m-0 flex items-center gap-1 max-w-fit bg-amber-50 text-amber-800 border border-amber-200/80"
          >
            <GiftOutlined className="text-amber-600 text-[10px]" />
            <span>Grant</span>
          </Tag>
        );
      },
    },
    {
      title: "Payment",
      key: "payment",
      width: 130,
      render: (_, record) => {
        const method = record.payment_method || "stripe";
        const methodLabels: Record<string, string> = {
          cash: "Cash",
          bank_transfer: "Bank Transfer",
          direct: "Direct Wire",
          stripe: "Stripe",
          other: "Other",
        };
        const status = record.payment_status || "paid";

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-gray-700 capitalize">
              {methodLabels[method] || method}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                status === "paid"
                  ? "text-emerald-600"
                  : status === "pending"
                    ? "text-amber-600"
                    : "text-rose-600"
              }`}
            >
              ● {status}
            </span>
          </div>
        );
      },
    },
    {
      title: "Contributor / Recipient",
      key: "party",
      render: (_, record) => {
        const applicant = record.applicant;

        if (record.type === "fund_raising") {
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                <ShopOutlined />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-gray-900 truncate">
                  {record.name || "Merchandise / Offline Sale"}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {record.reference
                    ? `Ref: ${record.reference}`
                    : record.email || "Offline Fundraiser"}
                </p>
              </div>
            </div>
          );
        }

        if (record.type === "donation") {
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-800 font-bold text-xs">
                {record.name ? (
                  record.name.charAt(0).toUpperCase()
                ) : (
                  <UserOutlined />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-gray-900 truncate">
                  {record.name || "Anonymous Donor"}
                </p>
                {record.email && (
                  <p className="text-[11px] text-gray-400 truncate">
                    {record.email}
                  </p>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              <ProjectOutlined />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-gray-900 truncate max-w-xs">
                {applicant?.projectTitle || record.name || "Grant Beneficiary"}
              </p>
              {applicant?.personal && (
                <p className="text-[11px] text-gray-400 truncate">
                  {applicant.personal.firstName} {applicant.personal.lastName}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Recorded By",
      key: "recordedBy",
      width: 140,
      render: (_, record) => {
        if (record.recordedBy?.name) {
          return (
            <Tag
              bordered={false}
              className="bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium py-0.5 px-2"
            >
              {record.recordedBy.name}
            </Tag>
          );
        }
        return <span className="text-[11px] text-gray-400">Online System</span>;
      },
    },
    {
      title: "Amount",
      key: "amount",
      width: 130,
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => {
        const isGrant = record.type === "grant";
        const isFundRaising = record.type === "fund_raising";
        return (
          <span
            className={`font-display text-sm font-bold ${
              isGrant
                ? "text-amber-600"
                : isFundRaising
                  ? "text-purple-700"
                  : "text-emerald-700"
            }`}
          >
            {isGrant ? "-" : "+"}
            {formatCurrency(record.amount)}
          </span>
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
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="View Receipt Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setInspectingDonation(record)}
              className="h-8 w-8 rounded-lg text-gray-500 hover:text-emerald-800 hover:bg-emerald-50"
            />
          </Tooltip>

          <Tooltip title="Delete Transaction">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeletingDonation(record)}
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
            Fund & Received Donations
          </h1>
          <p className="text-xs sm:text-sm text-mist-600 mt-1">
            Monitor incoming donor contributions, merchandise fundraising sales,
            grant disbursements, and available liquidity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setManualModalOpen(true)}
            className="h-10 rounded-xl font-semibold bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! shadow-sm border-0"
          >
            Record Offline Entry
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="h-10 rounded-xl font-medium border-gray-200 hover:border-[#0B3D2E]"
          >
            Export CSV
          </Button>

          <Tooltip title="Refresh fund balances and records">
            <Button
              icon={
                <ReloadOutlined className={isFetching ? "animate-spin" : ""} />
              }
              onClick={() => refetch()}
              className="h-10 w-10 rounded-xl"
            />
          </Tooltip>
        </div>
      </div>

      {/* Top-Tier Fund Activity Metric Cards */}
      <DonationStatsCards stats={stats} loading={isLoadingStats} />

      {/* Filter & Action Toolbar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search donor, email, reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          {/* Type Segmented Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={typeFilter}
              onChange={(val) => {
                setTypeFilter(val as any);
                setPage(1);
              }}
              className="p-1 rounded-xl bg-gray-100 font-medium"
              options={[
                { value: "all", label: "All Transactions" },
                {
                  value: "donation",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <HeartOutlined className="text-emerald-600 text-xs" />
                      <span>Donations</span>
                    </span>
                  ),
                },
                {
                  value: "fund_raising",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <ShopOutlined className="text-purple-600 text-xs" />
                      <span>Fundraising Sales</span>
                    </span>
                  ),
                },
                {
                  value: "grant",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <GiftOutlined className="text-amber-600 text-xs" />
                      <span>Grants Outflow</span>
                    </span>
                  ),
                },
              ]}
            />

            {/* Batch Delete Action (appears when rows are selected) */}
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
      {donations.length === 0 && !isLoadingDonations ? (
        <GlassCard className="p-12 text-center">
          <EmptyState
            icon={<WalletOutlined className="text-4xl text-[#0B3D2E]" />}
            title={
              searchTerm || typeFilter !== "all"
                ? "No Matching Transactions"
                : "No Transactions Recorded"
            }
            description={
              searchTerm || typeFilter !== "all"
                ? "No donation, fundraising sale, or grant records match your search or filter criteria. Try resetting your query."
                : "Incoming public donations from Stripe, offline entries, and grant disbursements will appear here."
            }
            actionLabel={
              searchTerm || typeFilter !== "all" ? "Reset Filters" : undefined
            }
            onAction={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setPage(1);
            }}
          />
        </GlassCard>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
          <Table
            dataSource={donations}
            columns={columns}
            rowKey="_id"
            loading={isLoadingDonations || isFetching}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            onRow={(record) => ({
              onClick: () => setInspectingDonation(record),
              className:
                "cursor-pointer hover:bg-emerald-50/20 transition-colors",
            })}
            className="custom-admin-table"
          />
        </div>
      )}

      {/* Pagination Bar */}
      {pagination && pagination.total > pageSize && (
        <div className="flex items-center justify-center pt-2">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={pagination.total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) setPageSize(newPageSize);
            }}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      )}

      {/* Audit Receipt & Details Modal */}
      <DonationDetailModal
        open={Boolean(inspectingDonation)}
        donation={inspectingDonation}
        onClose={() => setInspectingDonation(null)}
        onDelete={(donation) => setDeletingDonation(donation)}
      />

      {/* Record Manual / Offline Donation or Sale Modal */}
      <RecordManualDonationModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Single Record Delete Confirmation Modal */}
      <DeleteDonationModal
        open={Boolean(deletingDonation)}
        donation={deletingDonation}
        loading={isDeletingSingle}
        onCancel={() => setDeletingDonation(null)}
        onConfirm={handleConfirmDeleteSingle}
      />

      {/* Batch Records Delete Confirmation Modal */}
      <DeleteDonationModal
        open={batchDeleteModalOpen}
        batchCount={selectedRowKeys.length}
        loading={isDeletingMultiple}
        onCancel={() => setBatchDeleteModalOpen(false)}
        onConfirm={handleConfirmBatchDelete}
      />
    </div>
  );
}
