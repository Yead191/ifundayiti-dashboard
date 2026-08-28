import { useState } from "react";
import { Avatar, Button, Modal, Tooltip, message } from "antd";
import {
  UserOutlined,
  CloseOutlined,
  CopyOutlined,
  CheckOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CrownOutlined,
  AppstoreOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import type {
  ApiTransaction,
  TransactionOrderRef,
} from "@/redux/features/transactions/transactions.types";
import {
  formatTransactionLabel,
  isMembershipCategory,
  isServiceCategory,
  isShopCategory,
  transactionCategoryToneMap,
  transactionStatusToneMap,
  transactionTypeToneMap,
} from "../statusMaps";

function categoryIcon(category: string) {
  if (isMembershipCategory(category)) return <CrownOutlined />;
  if (isShopCategory(category)) return <ShoppingOutlined />;
  if (isServiceCategory(category)) return <AppstoreOutlined />;
  return <DollarOutlined />;
}

function getOrderId(order?: string | TransactionOrderRef | null) {
  if (!order) return null;
  if (typeof order === "string") return order;
  return order.order_id || order._id;
}

export function TransactionDetailModal({
  transaction,
  open,
  onClose,
}: {
  transaction: ApiTransaction | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!transaction) return null;

  const copyValue = async (value: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      message.success(`${label} copied`);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      message.error(`Couldn't copy ${label.toLowerCase()}`);
    }
  };

  const orderId = getOrderId(transaction.order);
  const hasDiscount =
    (transaction.discount_amount ?? 0) > 0 || (transaction.discount_percentage ?? 0) > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      destroyOnHidden
      closeIcon={<CloseOutlined className="text-mist-400" />}
      styles={{
        body: { padding: 0 },
        container: {
          overflow: "hidden",
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
        },
      }}
    >
      <div className="relative overflow-hidden px-6 pb-5 pt-7 md:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-violet-600/25 blur-[80px]" />
          <div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-warning/12 blur-[70px]" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag
                tone={transactionCategoryToneMap[transaction.category] ?? "neutral"}
                icon={categoryIcon(transaction.category)}
              >
                {formatTransactionLabel(transaction.category)}
              </StatusTag>
              <StatusTag tone={transactionStatusToneMap[transaction.status] ?? "neutral"}>
                {formatTransactionLabel(transaction.status)}
              </StatusTag>
              <StatusTag tone={transactionTypeToneMap[transaction.type] ?? "neutral"}>
                {formatTransactionLabel(transaction.type)}
              </StatusTag>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-cloud-100">
              Transaction details
            </h2>
            <p className="mt-1 text-sm text-mist-400">
              {transaction.createdAt
                ? `Recorded ${formatDate(transaction.createdAt)}`
                : "Payment ledger entry"}
            </p>
          </div>

          <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-right">
            <div className="text-[11px] uppercase tracking-wide text-mist-500">Amount</div>
            <div className="font-display text-2xl font-semibold text-warning">
              {formatCurrency(transaction.total_price ?? 0)}
            </div>
            <div className="mt-0.5 text-[11px] text-mist-500">
              Received {formatCurrency(transaction.payment_received ?? 0)}
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-navy-700/60 bg-navy-800/40 p-3.5">
          <Avatar
            src={getImageUrl(transaction.user?.image || "")}
            icon={<UserOutlined />}
            size={48}
            className="bg-violet-600/25! text-violet-glow!"
          />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{transaction.user?.name || "Deleted user"}</div>
            <div className="truncate text-xs text-mist-400">{transaction.user?.email || "—"}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-mist-600">
          <BankOutlined className="text-violet-glow/80" />
          Payment summary
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Total price" value={formatCurrency(transaction.total_price ?? 0)} accent />
          <Metric
            label="Payment received"
            value={formatCurrency(transaction.payment_received ?? 0)}
          />
          <Metric
            label="Platform fee"
            value={formatCurrency(transaction.platform_fee ?? 0)}
          />
          <Metric
            label="Discount"
            value={formatCurrency(transaction.discount_amount ?? 0)}
          />
          <Metric
            label="Discount %"
            value={`${transaction.discount_percentage ?? 0}%`}
          />
        </div>

        {hasDiscount && (
          <p className="mt-3 text-xs text-mist-500">
            A discount of {formatCurrency(transaction.discount_amount ?? 0)} (
            {transaction.discount_percentage ?? 0}%) was applied to this payment.
          </p>
        )}

        <div className="mt-4 space-y-2.5">
          {transaction.transaction_id && (
            <IdRow
              label="Payment transaction ID"
              value={transaction.transaction_id}
              copied={copiedKey === "ext"}
              onCopy={() =>
                copyValue(transaction.transaction_id!, "ext", "Transaction ID")
              }
            />
          )}
          <IdRow
            label="Record ID"
            value={transaction._id}
            copied={copiedKey === "tx"}
            onCopy={() => copyValue(transaction._id, "tx", "Record ID")}
          />
          {orderId && (
            <IdRow
              label="Linked order"
              value={orderId}
              copied={copiedKey === "order"}
              onCopy={() => copyValue(orderId, "order", "Order ID")}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 md:px-8">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
      <div className="text-[11px] text-mist-600">{label}</div>
      <div
        className={
          accent
            ? "mt-1 font-display text-base font-semibold text-warning"
            : "mt-1 font-display text-base font-semibold text-cloud-100"
        }
      >
        {value}
      </div>
    </div>
  );
}

function IdRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-navy-700/60 bg-navy-800/35 p-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-mist-600">{label}</div>
        <code className="mt-1 block truncate font-mono text-xs text-cloud-100">{value}</code>
      </div>
      <Tooltip title={copied ? "Copied" : "Copy"}>
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckOutlined className="text-success" /> : <CopyOutlined />}
          onClick={onCopy}
          className="text-mist-400! hover:text-violet-glow!"
        />
      </Tooltip>
    </div>
  );
}
