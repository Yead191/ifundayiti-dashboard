import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Tag, Tooltip, Skeleton, Dropdown } from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  CheckOutlined,
  DollarOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  CrownOutlined,
  CompassOutlined,
  FolderOpenOutlined,
  UserOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  useGetExpenseByIdQuery,
  useDeleteExpenseMutation,
  useUpdateExpenseStatusMutation,
} from "@/redux/features/expenses/expensesApi";
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  type ExpenseCategory,
  type ExpensePaymentStatus,
} from "@/redux/features/expenses/expenses.types";
import { RecordExpenseModal } from "./components/RecordExpenseModal";
import { DeleteExpenseModal } from "./components/DeleteExpenseModal";

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    data: expenseRes,
    isLoading,
    isError,
    refetch,
  } = useGetExpenseByIdQuery(id || "", {
    skip: !id,
  });

  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();
  const [updateExpenseStatus, { isLoading: isUpdatingStatus }] =
    useUpdateExpenseStatusMutation();

  const expense = expenseRes?.data;

  const handleCopyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Voucher reference copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: ExpensePaymentStatus) => {
    if (!expense) return;
    try {
      await updateExpenseStatus({
        id: expense._id,
        body: { payment_status: newStatus },
      }).unwrap();
      toast.success(
        newStatus === "paid"
          ? "Expense marked as Paid — amount deducted from Program Fund"
          : newStatus === "unpaid"
            ? "Status changed to Unpaid"
            : "Expense marked as Cancelled",
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update expense status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!expense) return;
    try {
      await deleteExpense(expense._id).unwrap();
      toast.success("Expense voucher deleted & Program Fund balance restored");
      navigate("/expenses");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete expense");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Skeleton.Button active size="small" className="rounded-xl" />
          <Skeleton.Input active size="small" className="w-48 rounded-xl" />
        </div>
        <GlassCard className="p-8">
          <Skeleton active paragraph={{ rows: 8 }} />
        </GlassCard>
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="space-y-6 pb-12">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/expenses")}
          className="h-9 rounded-xl text-xs font-semibold"
        >
          Back to Expenses
        </Button>
        <GlassCard className="p-12 text-center">
          <EmptyState
            icon={<FileTextOutlined className="text-4xl text-rose-600" />}
            title="Expense Voucher Not Found"
            description="The requested expense record does not exist or may have been deleted."
            actionLabel="Return to All Expenses"
            onAction={() => navigate("/expenses")}
          />
        </GlassCard>
      </div>
    );
  }

  const voucherRef =
    expense.reference || `EXP-${expense._id.slice(-6).toUpperCase()}`;
  const isPaid = expense.payment_status === "paid";
  const isUnpaid = expense.payment_status === "unpaid";
  const isCancelled = expense.payment_status === "cancelled";

  const statusDropdownItems = {
    items: [
      {
        key: "paid",
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircleOutlined className="text-emerald-600" />
            <span>Mark as Paid (Deduct Fund)</span>
          </span>
        ),
        disabled: isPaid,
        onClick: () => handleStatusChange("paid"),
      },
      {
        key: "unpaid",
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <ClockCircleOutlined className="text-amber-600" />
            <span>Mark as Unpaid (Pending)</span>
          </span>
        ),
        disabled: isUnpaid,
        onClick: () => handleStatusChange("unpaid"),
      },
      {
        key: "cancelled",
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <CloseCircleOutlined className="text-gray-400" />
            <span>Mark as Cancelled</span>
          </span>
        ),
        disabled: isCancelled,
        onClick: () => handleStatusChange("cancelled"),
      },
    ],
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case "business":
        return <ApartmentOutlined className="text-cyan-600" />;
      case "event":
        return <CrownOutlined className="text-purple-600" />;
      case "program":
        return <CompassOutlined className="text-emerald-600" />;
      default:
        return <FolderOpenOutlined className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Top Navigation & Action Toolbar (Hidden in Print) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-2.5">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/expenses")}
            className="h-10 rounded-xl font-medium border-gray-200 hover:border-[#0B3D2E]"
          >
            All Expenses
          </Button>

          <div
            onClick={() => handleCopyRef(voucherRef)}
            className="flex items-center gap-1.5 cursor-pointer bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0B3D2E] px-2.5 py-1 rounded-xl transition-colors"
            title="Click to copy voucher reference"
          >
            <span className="font-mono text-xs font-bold">{voucherRef}</span>
            {copied ? (
              <CheckOutlined className="text-emerald-600 text-xs" />
            ) : (
              <CopyOutlined className="text-gray-400 text-xs" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick status change dropdown */}
          <Dropdown
            menu={statusDropdownItems}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button className="h-10 rounded-xl font-medium border-gray-200">
              <span className="flex items-center gap-1.5 text-xs">
                <span>Status:</span>
                <strong className="capitalize">{expense.payment_status}</strong>
                <span className="text-[10px] text-gray-400">▼</span>
              </span>
            </Button>
          </Dropdown>

          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="h-10 rounded-xl font-medium border-gray-200 hover:border-[#0B3D2E]"
          >
            Print Voucher
          </Button>

          <Button
            icon={<EditOutlined />}
            onClick={() => setEditModalOpen(true)}
            className="h-10 rounded-xl font-medium border-gray-200 hover:border-[#0B3D2E]"
          >
            Edit
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalOpen(true)}
            className="h-10 rounded-xl hover:bg-rose-50"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Summary Card */}
      <GlassCard className="p-6 relative overflow-hidden bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-mist-500">
                Official Expense Voucher
              </span>
              <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {voucherRef}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {expense.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Tag
                bordered={false}
                className="bg-cyan-50 text-cyan-800 border border-cyan-200/70 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1.5 m-0"
              >
                {getCategoryIcon(expense.category)}
                <span className="capitalize">
                  {CATEGORY_LABELS[expense.category]}
                </span>
              </Tag>

              <Tag
                bordered={false}
                className="bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 text-xs font-medium m-0"
              >
                {SUBCATEGORY_LABELS[expense.subcategory] || expense.subcategory}
              </Tag>

              <Tag
                bordered={false}
                className="bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5 text-xs font-medium m-0 capitalize"
              >
                Method: {expense.payment_method}
              </Tag>
            </div>
          </div>

          {/* Large Amount & Status Badge */}
          <div className="flex flex-col items-start md:items-end justify-center">
            <span
              className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isCancelled
                  ? "text-gray-400 line-through"
                  : isPaid
                    ? "text-rose-600"
                    : "text-amber-600"
              }`}
            >
              -{formatCurrency(expense.amount)}
            </span>

            <div className="mt-1">
              {isPaid ? (
                <Tag
                  bordered={false}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 m-0"
                >
                  <CheckCircleOutlined className="text-emerald-600" />
                  <span>Settled & Paid</span>
                </Tag>
              ) : isUnpaid ? (
                <Tag
                  bordered={false}
                  className="bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 m-0"
                >
                  <ClockCircleOutlined className="text-amber-600" />
                  <span>Pending Payment</span>
                </Tag>
              ) : (
                <Tag
                  bordered={false}
                  className="bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 m-0"
                >
                  <CloseCircleOutlined className="text-gray-400" />
                  <span>Cancelled Voucher</span>
                </Tag>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Fund Impact Banner */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          {isPaid ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-950 text-xs">
              <CheckCircleOutlined className="text-emerald-700 text-base shrink-0" />
              <div>
                <strong>Fund Liquidity Synchronized:</strong> This outflow of{" "}
                <span className="font-bold">
                  {formatCurrency(expense.amount)}
                </span>{" "}
                was automatically deducted from the Program Fund balance. If
                deleted or refunded, the amount will be restored into the
                available liquidity pool.
              </div>
            </div>
          ) : isUnpaid ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-950 text-xs">
              <ClockCircleOutlined className="text-amber-700 text-base shrink-0" />
              <div>
                <strong>Pending Fund Obligation:</strong> This expenditure of{" "}
                <span className="font-bold">
                  {formatCurrency(expense.amount)}
                </span>{" "}
                has not been disbursed yet. Once marked as Paid, it will
                immediately deduct from the Program Fund balance.
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs">
              <CloseCircleOutlined className="text-gray-500 text-base shrink-0" />
              <div>
                <strong>Cancelled Record:</strong> This voucher is marked as
                cancelled and does not impact the Program Fund balance.
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Two-Column Details Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Expenditure Overview & Narrative (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 space-y-5">
            <h3 className="font-display text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <FileTextOutlined className="text-[#0B3D2E]" />
              <span>Expenditure Information</span>
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Voucher Title & Purpose
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {expense.title}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Internal Audit Memo & Description
                </span>
                <div className="mt-1 p-3.5 rounded-xl bg-gray-50/80  text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {expense.notes ||
                    "No internal notes or description provided for this expense voucher."}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Category Classification
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(expense.category)}
                    <span className="text-xs font-semibold text-gray-900">
                      {CATEGORY_LABELS[expense.category]}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Subcategory
                  </span>
                  <p className="text-xs font-semibold text-gray-900 mt-1">
                    {SUBCATEGORY_LABELS[expense.subcategory] ||
                      expense.subcategory}
                  </p>
                </div>
              </div>

              {expense.transactionId && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Linked Financial Ledger Transaction
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xs text-[#0B3D2E] font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {expense.transactionId}
                    </span>
                    <Link
                      to="/transactions"
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-medium underline"
                    >
                      View in Ledger →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Administrative & Audit Details (1 Col) */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-5">
            <h3 className="font-display text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <CalendarOutlined className="text-[#0B3D2E]" />
              <span>Timing & Payment Details</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Expense Date</span>
                <span className="font-semibold text-gray-900">
                  {dayjs(expense.expenseDate).format("MMMM DD, YYYY")}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {expense.payment_method}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Payment Status</span>
                <span className="font-semibold capitalize text-gray-900">
                  {expense.payment_status}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Created At</span>
                <span className="text-gray-700">
                  {formatDateTime(expense.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-700">
                  {formatDateTime(expense.updatedAt)}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Recorded By Administrator */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <UserOutlined className="text-[#0B3D2E]" />
              <span>Administrative Audit</span>
            </h3>

            {expense.recordedBy ? (
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl  font-bold text-sm shadow-xs overflow-hidden">
                  <img
                    className="h-full w-full rounded-2xl object-cover"
                    src={expense.recordedBy.image}
                    alt={expense.recordedBy.name}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">
                    {expense.recordedBy.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {expense.recordedBy.email}
                  </p>
                  <Tag
                    bordered={false}
                    className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold mt-1"
                  >
                    {expense.recordedBy.role || "Administrator"}
                  </Tag>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Recorded via automated system integration.
              </p>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Modals */}
      <RecordExpenseModal
        open={editModalOpen}
        expenseToEdit={expense}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <DeleteExpenseModal
        open={deleteModalOpen}
        expense={expense}
        loading={isDeleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
