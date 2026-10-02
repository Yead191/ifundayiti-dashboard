import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "antd";
import { AccountBookOutlined } from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  useGetExpensesQuery,
  useGetExpenseStatsQuery,
  useDeleteExpenseMutation,
  useDeleteMultipleExpensesMutation,
  useUpdateExpenseStatusMutation,
} from "@/redux/features/expenses/expensesApi";
import type {
  ExpenseCategory,
  ExpensePaymentStatus,
  ExpenseSubcategory,
  IExpense,
} from "@/redux/features/expenses/expenses.types";
import { ExpenseStatsHeader } from "./components/ExpenseStatsHeader";
import { ExpenseFiltersBar } from "./components/ExpenseFiltersBar";
import { ExpensesTable } from "./components/ExpensesTable";
import { RecordExpenseModal } from "./components/RecordExpenseModal";
import { DeleteExpenseModal } from "./components/DeleteExpenseModal";

export default function ExpensesPage() {
  const navigate = useNavigate();

  // Pagination & filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpensePaymentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState<ExpenseSubcategory | "all">("all");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Selection & modal states
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<IExpense | null>(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  // Queries
  const { data: statsRes, isLoading: isLoadingStats, refetch: refetchStats } = useGetExpenseStatsQuery();

  const queryParams = useMemo(() => {
    return {
      page,
      limit: pageSize,
      searchTerm: searchTerm.trim() || undefined,
      payment_status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      subcategory: subcategoryFilter !== "all" ? subcategoryFilter : undefined,
      startDate: dateRange?.[0] ? dateRange[0].startOf("day").toISOString() : undefined,
      endDate: dateRange?.[1] ? dateRange[1].endOf("day").toISOString() : undefined,
      sort: "-expenseDate",
    };
  }, [page, pageSize, searchTerm, statusFilter, categoryFilter, subcategoryFilter, dateRange]);

  const {
    data: expensesRes,
    isLoading: isLoadingExpenses,
    isFetching: isFetchingExpenses,
    refetch: refetchExpenses,
  } = useGetExpensesQuery(queryParams);

  // Mutations
  const [deleteExpense, { isLoading: isDeletingSingle }] = useDeleteExpenseMutation();
  const [deleteMultiple, { isLoading: isDeletingMultiple }] = useDeleteMultipleExpensesMutation();
  const [updateExpenseStatus] = useUpdateExpenseStatusMutation();

  const stats = statsRes?.data;
  const expenses = expensesRes?.data || [];
  const pagination = expensesRes?.pagination;

  // Handlers
  const handleRefresh = () => {
    refetchExpenses();
    refetchStats();
  };

  const handleQuickUpdateStatus = async (id: string, newStatus: ExpensePaymentStatus) => {
    try {
      await updateExpenseStatus({ id, body: { payment_status: newStatus } }).unwrap();
      toast.success(
        newStatus === "paid"
          ? "Marked as Paid — amount deducted from Program Fund"
          : newStatus === "unpaid"
          ? "Status changed to Unpaid"
          : "Expense cancelled"
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update expense status");
    }
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deletingExpense) return;
    try {
      await deleteExpense(deletingExpense._id).unwrap();
      toast.success("Expense record deleted & fund balance synchronized");
      setDeletingExpense(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete expense record");
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      const ids = selectedRowKeys.map(String);
      const res = await deleteMultiple({ ids }).unwrap();
      toast.success(
        `${res.data?.deletedCount || ids.length} expenses deleted & fund balance synchronized`
      );
      setSelectedRowKeys([]);
      setBatchDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete selected expenses");
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.warning("No expense records available to export");
      return;
    }

    const headers = [
      "Voucher Ref",
      "Title",
      "Category",
      "Subcategory",
      "Amount ($)",
      "Payment Status",
      "Payment Method",
      "Expense Date",
      "Recorded By",
      "Notes",
    ];

    const rows = expenses.map((e) => [
      `"${e.reference || `EXP-${e._id.slice(-6).toUpperCase()}`}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.subcategory}"`,
      e.amount,
      `"${e.payment_status}"`,
      `"${e.payment_method}"`,
      `"${dayjs(e.expenseDate).format("YYYY-MM-DD")}"`,
      `"${e.recordedBy?.name || "Admin"}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `IFundAyiti_Expenses_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Expense report exported as CSV");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B3D2E]">
            Operational Expenses
          </h1>
          <p className="text-xs sm:text-sm text-mist-600 mt-1">
            Record, categorize, and audit platform operational expenditures and automated fund deductions.
          </p>
        </div>
      </div>

      {/* 5 Top-Tier Metric Widgets */}
      <ExpenseStatsHeader
        stats={stats}
        loading={isLoadingStats}
        activeStatusFilter={statusFilter}
        onSelectStatus={(status) => {
          setStatusFilter(status as any);
          setPage(1);
        }}
        onSelectCategory={(category) => {
          setCategoryFilter(category as any);
          setPage(1);
        }}
      />

      {/* Filter & Action Toolbar */}
      <ExpenseFiltersBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(cat) => {
          setCategoryFilter(cat);
          setPage(1);
        }}
        subcategoryFilter={subcategoryFilter}
        onSubcategoryChange={(subcat) => {
          setSubcategoryFilter(subcat);
          setPage(1);
        }}
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          setPage(1);
        }}
        selectedCount={selectedRowKeys.length}
        onBatchDelete={() => setBatchDeleteOpen(true)}
        onOpenRecordModal={() => {
          setEditingExpense(null);
          setRecordModalOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onRefresh={handleRefresh}
        isFetching={isFetchingExpenses}
      />

      {/* Expenses Table */}
      {expenses.length === 0 && !isLoadingExpenses ? (
        <GlassCard className="p-12 text-center">
          <EmptyState
            icon={<AccountBookOutlined className="text-4xl text-[#0B3D2E]" />}
            title={
              searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "No Matching Expenses"
                : "No Expenses Logged Yet"
            }
            description={
              searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "No operational expenses match your active filter parameters. Try clearing your filters."
                : "Record your business, event, or program expenditures here to keep platform finances synchronized."
            }
            actionLabel={
              searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Reset Filters"
                : "+ Record First Expense"
            }
            onAction={() => {
              if (searchTerm || statusFilter !== "all" || categoryFilter !== "all") {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setSubcategoryFilter("all");
                setDateRange(null);
                setPage(1);
              } else {
                setEditingExpense(null);
                setRecordModalOpen(true);
              }
            }}
          />
        </GlassCard>
      ) : (
        <ExpensesTable
          expenses={expenses}
          loading={isLoadingExpenses || isFetchingExpenses}
          selectedRowKeys={selectedRowKeys}
          onSelectRowKeys={setSelectedRowKeys}
          onViewExpense={(expense) => navigate(`/expenses/${expense._id}`)}
          onEditExpense={(expense) => {
            setEditingExpense(expense);
            setRecordModalOpen(true);
          }}
          onDeleteExpense={(expense) => setDeletingExpense(expense)}
          onQuickUpdateStatus={handleQuickUpdateStatus}
        />
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

      {/* Record / Edit Expense Modal */}
      <RecordExpenseModal
        open={recordModalOpen}
        expenseToEdit={editingExpense}
        onClose={() => {
          setRecordModalOpen(false);
          setEditingExpense(null);
        }}
        onSuccess={handleRefresh}
      />

      {/* Single Record Delete Modal */}
      <DeleteExpenseModal
        open={Boolean(deletingExpense)}
        expense={deletingExpense}
        loading={isDeletingSingle}
        onCancel={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDeleteSingle}
      />

      {/* Batch Delete Modal */}
      <DeleteExpenseModal
        open={batchDeleteOpen}
        batchCount={selectedRowKeys.length}
        loading={isDeletingMultiple}
        onCancel={() => setBatchDeleteOpen(false)}
        onConfirm={handleConfirmBatchDelete}
      />
    </div>
  );
}
