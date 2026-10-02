import { useState } from "react";
import { Table, Tag, Tooltip, Button, Dropdown } from "antd";
import type { TableProps } from "antd";
import {
  CopyOutlined,
  CheckOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  ApartmentOutlined,
  CrownOutlined,
  CompassOutlined,
  FolderOpenOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type {
  IExpense,
  ExpenseCategory,
  ExpensePaymentStatus,
} from "@/redux/features/expenses/expenses.types";
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
} from "@/redux/features/expenses/expenses.types";
import { toast } from "sonner";
import dayjs from "dayjs";

interface ExpensesTableProps {
  expenses: IExpense[];
  loading?: boolean;
  selectedRowKeys: React.Key[];
  onSelectRowKeys: (keys: React.Key[]) => void;
  onViewExpense: (expense: IExpense) => void;
  onEditExpense: (expense: IExpense) => void;
  onDeleteExpense: (expense: IExpense) => void;
  onQuickUpdateStatus: (id: string, newStatus: ExpensePaymentStatus) => void;
}

export function ExpensesTable({
  expenses,
  loading = false,
  selectedRowKeys,
  onSelectRowKeys,
  onViewExpense,
  onEditExpense,
  onDeleteExpense,
  onQuickUpdateStatus,
}: ExpensesTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Voucher reference copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case "business":
        return (
          <Tag
            bordered={false}
            className="bg-cyan-50 text-cyan-800 border border-cyan-200/70 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 max-w-fit m-0"
          >
            <ApartmentOutlined className="text-cyan-600 text-[10px]" />
            <span>Business</span>
          </Tag>
        );
      case "event":
        return (
          <Tag
            bordered={false}
            className="bg-purple-50 text-purple-800 border border-purple-200/70 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 max-w-fit m-0"
          >
            <CrownOutlined className="text-purple-600 text-[10px]" />
            <span>Event</span>
          </Tag>
        );
      case "program":
        return (
          <Tag
            bordered={false}
            className="bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 max-w-fit m-0"
          >
            <CompassOutlined className="text-emerald-600 text-[10px]" />
            <span>Program</span>
          </Tag>
        );
      default:
        return (
          <Tag
            bordered={false}
            className="bg-slate-100 text-slate-700 border border-slate-200/70 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 max-w-fit m-0"
          >
            <FolderOpenOutlined className="text-slate-500 text-[10px]" />
            <span>Other</span>
          </Tag>
        );
    }
  };

  const columns: TableProps<IExpense>["columns"] = [
    {
      title: "Voucher / Ref #",
      key: "reference",

      render: (_, record) => {
        const refText =
          record.reference || `EXP-${record._id.slice(-6).toUpperCase()}`;
        const isCopied = copiedId === refText;
        return (
          <div
            onClick={(e) => handleCopy(refText, e)}
            className="group flex items-center gap-1.5 cursor-pointer max-w-fit"
            title="Click to copy voucher code"
          >
            <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-emerald-50 hover:text-[#0B3D2E] border border-gray-200/70 px-2 py-0.5 rounded-lg transition-colors">
              {refText}
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
      title: "Title ",
      key: "title",
      render: (_, record) => {
        return (
          <div className="min-w-0 py-0.5">
            <p className="font-bold text-xs text-gray-900 truncate max-w-xs xl:max-w-sm">
              {record.title}
            </p>
          </div>
        );
      },
    },
    {
      title: "Category",
      key: "category",

      render: (_, record) => getCategoryBadge(record.category),
    },
    {
      title: "Amount",
      key: "amount",

      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => {
        const isPaid = record.payment_status === "paid";
        const isCancelled = record.payment_status === "cancelled";
        return (
          <span
            className={`font-display text-sm font-bold ${
              isCancelled
                ? "text-gray-400 line-through"
                : isPaid
                  ? "text-rose-600"
                  : "text-amber-600"
            }`}
          >
            -{formatCurrency(record.amount)}
          </span>
        );
      },
    },
    {
      title: "Payment Status",
      key: "payment_status",

      render: (_, record) => {
        const status = record.payment_status;

        const statusMenu = {
          items: [
            {
              key: "paid",
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <CheckCircleOutlined className="text-emerald-600" />
                  <span>Mark as Paid (Deduct Fund)</span>
                </span>
              ),
              disabled: status === "paid",
              onClick: () => onQuickUpdateStatus(record._id, "paid"),
            },
            {
              key: "unpaid",
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <ClockCircleOutlined className="text-amber-600" />
                  <span>Mark as Unpaid (Pending)</span>
                </span>
              ),
              disabled: status === "unpaid",
              onClick: () => onQuickUpdateStatus(record._id, "unpaid"),
            },
            {
              key: "cancelled",
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <CloseCircleOutlined className="text-gray-400" />
                  <span>Mark as Cancelled</span>
                </span>
              ),
              disabled: status === "cancelled",
              onClick: () => onQuickUpdateStatus(record._id, "cancelled"),
            },
          ],
        };

        let badgeContent = null;
        if (status === "paid") {
          badgeContent = (
            <Tag
              bordered={false}
              className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition-colors m-0"
            >
              <CheckCircleOutlined className="text-emerald-600 text-[10px]" />
              <span>Paid</span>
            </Tag>
          );
        } else if (status === "unpaid") {
          badgeContent = (
            <Tag
              bordered={false}
              className="bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-amber-100 transition-colors m-0"
            >
              <ClockCircleOutlined className="text-amber-600 text-[10px]" />
              <span>Unpaid</span>
            </Tag>
          );
        } else {
          badgeContent = (
            <Tag
              bordered={false}
              className="bg-gray-100 text-gray-600 border border-gray-200/80 rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-gray-200 transition-colors m-0"
            >
              <CloseCircleOutlined className="text-gray-400 text-[10px]" />
              <span>Cancelled</span>
            </Tag>
          );
        }

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={statusMenu}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <div title="Click to change status">{badgeContent}</div>
            </Dropdown>
          </div>
        );
      },
    },
    {
      title: "Method",
      key: "payment_method",

      render: (_, record) => {
        const methodLabels: Record<string, string> = {
          cash: "💵 Cash",
          bank_transfer: "🏦 Bank Transfer",
          card: "💳 Card",
          direct: "⚡ Wire Transfer",
          other: "📋 Other",
        };
        return (
          <span className="text-xs text-gray-700 font-medium capitalize">
            {methodLabels[record.payment_method] || record.payment_method}
          </span>
        );
      },
    },
    {
      title: "Expense Date",
      key: "expenseDate",

      sorter: (a, b) =>
        new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime(),
      render: (_, record) => (
        <span className="text-xs text-gray-600 font-medium">
          {dayjs(record.expenseDate).format("MMM DD, YYYY")}
        </span>
      ),
    },

    {
      title: "Actions",
      key: "actions",

      align: "right",
      render: (_, record) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="View Expense Voucher Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewExpense(record)}
              className="h-8 w-8 rounded-lg text-gray-500 hover:text-emerald-800 hover:bg-emerald-50"
            />
          </Tooltip>

          <Tooltip title="Edit Expense">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditExpense(record)}
              className="h-8 w-8 rounded-lg text-gray-500 hover:text-cyan-800 hover:bg-cyan-50"
            />
          </Tooltip>

          <Tooltip title="Delete Expense">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteExpense(record)}
              className="h-8 w-8 rounded-lg hover:bg-rose-50"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <Table
        dataSource={expenses}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectRowKeys,
        }}
        onRow={(record) => ({
          onClick: () => onViewExpense(record),
          className: "cursor-pointer hover:bg-emerald-50/20 transition-colors",
        })}
        className="custom-admin-table"
      />
    </div>
  );
}
