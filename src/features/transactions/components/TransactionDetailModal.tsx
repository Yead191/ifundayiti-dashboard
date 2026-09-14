import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button, Tag, Tooltip, Avatar, Divider } from "antd";
import {
  CloseOutlined,
  CopyOutlined,
  CheckOutlined,
  PrinterOutlined,
  DeleteOutlined,
  UserOutlined,
  ShoppingOutlined,
  CrownOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  AuditOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import type {
  ITransaction,
  TransactionOrderRef,
  TransactionUser,
} from "@/redux/features/transactions/transactions.types";
import { useGetTransactionByIdQuery } from "@/redux/features/transactions/transactionsApi";

interface TransactionDetailModalProps {
  open: boolean;
  transactionId?: string | null;
  transaction?: ITransaction | null;
  onClose: () => void;
  onDelete?: (transaction: ITransaction) => void;
}

export function TransactionDetailModal({
  open,
  transactionId,
  transaction: initialTransaction,
  onClose,
  onDelete,
}: TransactionDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch full details if ID is available
  const activeId = transactionId || initialTransaction?._id;
  const { data: detailRes } = useGetTransactionByIdQuery(activeId as string, {
    skip: !open || !activeId,
  });

  const tx: ITransaction | null = detailRes?.data || initialTransaction || null;

  if (!open || !tx) return null;

  const handleCopy = (value: string, key: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const user = typeof tx.user === "object" ? (tx.user as TransactionUser) : null;
  const order = typeof tx.order === "object" ? (tx.order as TransactionOrderRef) : null;
  const orderId = order?._id || (typeof tx.order === "string" ? tx.order : null);
  const orderNumber = order?.orderNumber || (orderId ? `ORD-${orderId.slice(-6).toUpperCase()}` : null);

  const isCredit = String(tx.type).toLowerCase() === "credit";
  const category = String(tx.category || "Shop");
  const status = String(tx.status || "Success");

  const categoryColor =
    category.toLowerCase() === "membership"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : category.toLowerCase() === "shop"
      ? "text-indigo-700 bg-indigo-50 border-indigo-200"
      : "text-teal-700 bg-teal-50 border-teal-200";

  const categoryIcon =
    category.toLowerCase() === "membership" ? (
      <CrownOutlined />
    ) : category.toLowerCase() === "shop" ? (
      <ShoppingOutlined />
    ) : (
      <AppstoreOutlined />
    );

  const statusColor =
    status.toLowerCase() === "success"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : status.toLowerCase() === "pending"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-rose-700 bg-rose-50 border-rose-200";

  const discountAmount = tx.discount_amount || 0;
  const discountPct = tx.discount_percentage || 0;
  const platformFee = tx.platform_fee || 0;
  const totalPrice = tx.total_price ?? tx.amount ?? 0;
  const netReceived = tx.payment_received ?? (totalPrice - discountAmount);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      centered
      destroyOnClose
      closeIcon={
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <CloseOutlined className="text-xs" />
        </span>
      }
      title={
        <div className="flex items-center gap-2.5 pb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B3D2E]">
            <AuditOutlined className="text-base" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 font-display m-0">
              Transaction Breakdown
            </h3>
            <Tag bordered={false} className={`rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 border ${categoryColor}`}>
              <span className="flex items-center gap-1">
                {categoryIcon}
                <span>{category}</span>
              </span>
            </Tag>
            <Tag bordered={false} className={`rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 border ${statusColor}`}>
              {status}
            </Tag>
          </div>
        </div>
      }
      className="rounded-3xl"
    >
      <div className="space-y-4 pt-3 pb-1">
        {/* Main Price Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-linear-to-b from-gray-50/70 to-white p-5 text-center shadow-2xs space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {isCredit ? "Gross Revenue Received" : "Debited Financial Event"}
          </p>

          <h2
            className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isCredit ? "text-[#0B3D2E]" : "text-gray-900"
            }`}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(totalPrice)}
          </h2>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <CalendarOutlined className="text-gray-400" />
            <span>{formatDateTime(tx.createdAt)}</span>
          </div>
        </div>

        {/* Financial Breakdown Grid */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
            <span>Ledger Audit Breakdown</span>
            <span>USD ($)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <span>Base / Gross Amount</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalPrice)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-amber-700 bg-amber-50/70 px-2.5 py-1.5 rounded-lg">
                <span>Discount Applied ({discountPct}%)</span>
                <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {platformFee > 0 && (
              <div className="flex items-center justify-between text-gray-600">
                <span>Platform Processing Fee</span>
                <span className="font-semibold text-gray-900">{formatCurrency(platformFee)}</span>
              </div>
            )}

            <Divider className="my-1 border-gray-100" />

            <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-0.5">
              <span>Net Payment Received</span>
              <span className="text-[#0B3D2E] font-display text-base font-extrabold">
                {formatCurrency(netReceived)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Customer / Account Profile
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={getImageUrl(user?.image || "")}
                icon={<UserOutlined />}
                size={44}
                className="bg-emerald-50 text-[#0B3D2E] border border-emerald-100"
              />
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm">
                  {user?.name || "Verified Customer"}
                </div>
                <div className="text-xs text-gray-500 truncate">{user?.email || "—"}</div>
              </div>
            </div>

            {user?.role && (
              <Tag className="rounded-lg text-xs capitalize bg-gray-100 text-gray-700 border-0 font-medium">
                {user.role}
              </Tag>
            )}
          </div>
        </div>

        {/* Linked Order Card (if exists) */}
        {order && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingOutlined className="text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Linked Merchandise Order
                </span>
              </div>

              {orderId && (
                <Link
                  to={`/shop/orders/${orderId}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <span>View Order</span>
                  <ArrowRightOutlined className="text-[10px]" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100/60">
                <div className="text-gray-400 text-[10px] uppercase font-medium">Order Reference</div>
                <div className="font-mono font-bold text-gray-800 mt-0.5">{orderNumber}</div>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100/60">
                <div className="text-gray-400 text-[10px] uppercase font-medium">Fulfillment Status</div>
                <div className="font-semibold text-indigo-900 capitalize mt-0.5">
                  {order.deliveryStatus || order.status || "Processing"}
                </div>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100/60 col-span-2 sm:col-span-1">
                <div className="text-gray-400 text-[10px] uppercase font-medium">Order Total</div>
                <div className="font-bold text-gray-900 mt-0.5">
                  {formatCurrency(order.totalAmount || totalPrice)}
                </div>
              </div>
            </div>

            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-indigo-100/70 text-xs">
                <div className="text-gray-500 font-medium mb-1.5 text-[11px]">Items Preview:</div>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item, idx) => {
                    const prod = typeof item.product === "object" ? item.product : null;
                    const prodName = prod?.name || "Store Item";
                    return (
                      <div key={idx} className="flex items-center justify-between text-gray-700">
                        <span className="truncate max-w-[220px]">
                          {prodName} <span className="text-gray-400">×{item.quantity || 1}</span>
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    );
                  })}
                  {order.items.length > 3 && (
                    <div className="text-[11px] text-indigo-600 font-medium">
                      +{order.items.length - 3} more items in order
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Credentials & Reference IDs */}
        <div className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <CreditCardOutlined className="text-gray-600" />
            <span>Payment Gateway Credentials</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-200/60">
              <div className="min-w-0 pr-2">
                <div className="text-[10px] text-gray-400 uppercase font-medium">Payment Method</div>
                <div className="font-medium text-gray-800 capitalize flex items-center gap-1.5 mt-0.5">
                  <SafetyCertificateOutlined className="text-emerald-600" />
                  <span>{tx.payment_method || "Stripe Checkout"}</span>
                </div>
              </div>
              <Tag className="m-0 bg-emerald-50 text-emerald-700 border-0 font-medium">
                Verified
              </Tag>
            </div>

            {tx.transaction_id && (
              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-200/60">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">
                    Stripe Transaction ID
                  </div>
                  <div className="font-mono text-xs text-gray-800 truncate mt-0.5">
                    {tx.transaction_id}
                  </div>
                </div>
                <Tooltip title={copiedKey === "txid" ? "Copied" : "Copy ID"}>
                  <Button
                    type="text"
                    size="small"
                    icon={copiedKey === "txid" ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                    onClick={() => handleCopy(tx.transaction_id!, "txid", "Transaction ID")}
                    className="text-gray-400 hover:text-[#0B3D2E]"
                  />
                </Tooltip>
              </div>
            )}

            {tx.payment_intent_id && tx.payment_intent_id !== tx.transaction_id && (
              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-200/60">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">Payment Intent ID</div>
                  <div className="font-mono text-xs text-gray-800 truncate mt-0.5">
                    {tx.payment_intent_id}
                  </div>
                </div>
                <Tooltip title={copiedKey === "pi" ? "Copied" : "Copy Payment Intent"}>
                  <Button
                    type="text"
                    size="small"
                    icon={copiedKey === "pi" ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                    onClick={() => handleCopy(tx.payment_intent_id!, "pi", "Payment Intent ID")}
                    className="text-gray-400 hover:text-[#0B3D2E]"
                  />
                </Tooltip>
              </div>
            )}

            {tx.prev_transaction_id && (
              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-gray-200/60">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">
                    Previous Transaction (Recurring Renewal)
                  </div>
                  <div className="font-mono text-xs text-gray-800 truncate mt-0.5">
                    {tx.prev_transaction_id}
                  </div>
                </div>
                <Tooltip title={copiedKey === "prev" ? "Copied" : "Copy Previous ID"}>
                  <Button
                    type="text"
                    size="small"
                    icon={copiedKey === "prev" ? <CheckOutlined className="text-emerald-600" /> : <CopyOutlined />}
                    onClick={() => handleCopy(tx.prev_transaction_id!, "prev", "Previous Transaction ID")}
                    className="text-gray-400 hover:text-[#0B3D2E]"
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2">
          {onDelete ? (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(tx)}
              className="h-10 rounded-xl font-medium text-rose-600 hover:bg-rose-50"
            >
              Delete Record
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center justify-end gap-2.5">
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="h-10 rounded-xl px-4 font-medium border-gray-200 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
            >
              Print Receipt
            </Button>
            <Button
              type="primary"
              onClick={onClose}
              className="h-10 rounded-xl px-5 font-semibold bg-[#0B3D2E]! hover:bg-[#082e23]! border-0 shadow-sm"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
