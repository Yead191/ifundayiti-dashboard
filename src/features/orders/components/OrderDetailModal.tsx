import type { ReactNode } from "react";
import { Avatar, Button, Modal, Tooltip,  } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  CloseOutlined,
  CopyOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import type { ApiOrder, OrderStatus } from "@/redux/features/orders/orders.types";
import {
  orderStatusLabelMap,
  orderStatusToneMap,
  paymentLabel,
  paymentStatusToneMap,
} from "../statusMaps";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { toast } from "sonner";

export function OrderDetailModal({
  order,
  open,
  updating,
  onClose,
  onStatusChange,
}: {
  order: ApiOrder | null;
  open: boolean;
  updating?: boolean;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const breakdown = order.price_breakdown;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const paymentIntentId = order.payment_intent_id?.trim() || null;
  const contactNumber = order.contact_number?.trim() || null;
  const shippingAddress = order.formatted_address?.trim() || null;

  const copyPaymentIntent = async () => {
    if (!paymentIntentId) return;
    try {
      await navigator.clipboard.writeText(paymentIntentId);
      setCopied(true);
      toast.success("Payment intent ID copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy payment intent ID");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
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
          <div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-warning/10 blur-[70px]" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone={orderStatusToneMap[order.status]}>
                {orderStatusLabelMap[order.status]}
              </StatusTag>
              <StatusTag tone={paymentStatusToneMap[order.payment_status] ?? "neutral"}>
                {paymentLabel(order.payment_status)}
              </StatusTag>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-cloud-100">
              {order.order_id}
            </h2>
            <p className="mt-1 text-sm text-mist-400">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              {order.createdAt ? ` · Placed ${formatDate(order.createdAt)}` : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-right">
            <div className="text-[11px] uppercase tracking-wide text-mist-500">Order total</div>
            <div className="font-display text-2xl font-semibold text-warning">
              {formatCurrency(breakdown.total_price)}
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-navy-700/60 bg-navy-800/40 p-3.5">
          <Avatar
            src={getImageUrl(order.user.image)}
            icon={<UserOutlined />}
            size={48}
            className="bg-violet-600/25! text-violet-glow!"
          />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{order.user.name}</div>
            <div className="truncate text-xs text-mist-400">{order.user.email}</div>
          </div>
        </div>

        <div className="relative mt-3 rounded-2xl border border-navy-700/60 bg-navy-800/40 p-3.5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-mist-600">
            <EnvironmentOutlined className="text-violet-glow/80" />
            Shipping details
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
                <PhoneOutlined />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-mist-600">Contact number</div>
                {contactNumber ? (
                  <a
                    href={`tel:${contactNumber}`}
                    className="mt-0.5 block text-sm font-medium text-cloud-100 transition hover:text-violet-glow"
                  >
                    {contactNumber}
                  </a>
                ) : (
                  <p className="mt-0.5 text-sm text-mist-500">Not provided</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2.5 sm:col-span-1">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/15 text-violet-glow">
                <EnvironmentOutlined />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-mist-600">Delivery address</div>
                {shippingAddress ? (
                  <p className="mt-0.5 text-sm leading-relaxed font-medium text-cloud-100">
                    {shippingAddress}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-mist-500">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-3 flex items-start gap-3 rounded-2xl border border-navy-700/60 bg-navy-800/40 p-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info">
            <CreditCardOutlined />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium uppercase tracking-wide text-mist-600">
              Payment intent ID
            </div>
            {paymentIntentId ? (
              <div className="mt-1 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-navy-700/70 bg-navy-900/60 px-2.5 py-1.5 font-mono text-xs text-cloud-100">
                  {paymentIntentId}
                </code>
                <Tooltip title={copied ? "Copied" : "Copy"}>
                  <Button
                    type="text"
                    size="small"
                    icon={copied ? <CheckOutlined className="text-success" /> : <CopyOutlined />}
                    onClick={copyPaymentIntent}
                    className="text-mist-400! hover:text-violet-glow!"
                  />
                </Tooltip>
              </div>
            ) : (
              <p className="mt-1 text-sm text-mist-500">No payment intent recorded for this order.</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <SectionTitle icon={<ShoppingOutlined />} title="Line items" />
        <div className="mt-3 space-y-2.5">
          {order.items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-navy-700/60 bg-navy-800/35 p-3"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-cloud-100">{item.title}</div>
                <div className="mt-0.5 text-xs text-mist-400">
                  {formatCurrency(item.unit_price)} × {item.quantity}
                </div>
              </div>
              <div className="shrink-0 font-display text-sm font-semibold text-cloud-100">
                {formatCurrency(item.total_price)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <SectionTitle icon={<CreditCardOutlined />} title="Price breakdown" />
          <div className="mt-3 overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-800/30">
            <BreakdownRow label="Products" value={breakdown.products_price} />
            <BreakdownRow label="Service fee" value={breakdown.serviceFee} />
            <BreakdownRow label="Delivery" value={breakdown.delivery_charge} />
            <BreakdownRow label="Tax" value={breakdown.tax} />
            {breakdown.discount_amount > 0 && (
              <BreakdownRow label="Discount" value={-breakdown.discount_amount} accent="success" />
            )}
            <div className="flex items-center justify-between border-t border-navy-700/60 bg-navy-900/40 px-4 py-3.5">
              <span className="text-sm font-medium text-cloud-100">Total</span>
              <span className="font-display text-lg font-semibold text-warning">
                {formatCurrency(breakdown.total_price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-mist-600">
            Fulfillment status
          </div>
          <OrderStatusSelect
            size="middle"
            value={order.status}
            disabled={updating}
            onChange={onStatusChange}
          />
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-mist-600">
      <span className="text-violet-glow/80">{icon}</span>
      {title}
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "success";
}) {
  return (
    <div className="flex items-center justify-between border-b border-navy-700/40 px-4 py-2.5 text-sm last:border-b-0">
      <span className="text-mist-400">{label}</span>
      <span className={accent === "success" ? "font-medium text-success" : "font-medium text-cloud-100"}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
