import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Image, Skeleton } from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  StopOutlined,
  RollbackOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useGetRefundQuery,
  useReviewRefundMutation,
} from "@/redux/features/refunds/refundsApi";
import type { ReviewRefundPayload } from "@/redux/features/refunds/refunds.types";
import {
  normalizeRefundStatus,
  normalizeRefundType,
  refundStatusLabelMap,
  refundStatusToneMap,
  refundTypeLabelMap,
} from "./statusMaps";
import { RefundReviewModal } from "./components/RefundReviewModal";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function RefundDetailPage() {
  const { refundId = "" } = useParams<{ refundId: string }>();
  const { data, isLoading, isError } = useGetRefundQuery(refundId, { skip: !refundId });
  const [reviewRefund, { isLoading: isReviewing }] = useReviewRefundMutation();
  const [action, setAction] = useState<"refunded" | "rejected" | null>(null);

  const refund = data?.data;
  const status = normalizeRefundStatus(refund?.status);
  const refundType = normalizeRefundType(refund?.refundType);
  const isPending = status === "pending";
  const breakdown = refund?.order?.price_breakdown;
  const orderTotal = breakdown?.total_price ?? 0;

  const handleReview = async (payload: ReviewRefundPayload) => {
    if (!refund) return;
    try {
      await reviewRefund({ id: refund._id, body: payload }).unwrap();
      toast.success(payload.status === "refunded" ? "Refund approved" : "Refund rejected", {
        description:
          payload.status === "refunded"
            ? `${formatCurrency(payload.refundAmount)} will be returned for ${refund.order?.order_id}.`
            : "The customer request has been declined.",
      });
      setAction(null);
    } catch (error) {
      toast.error("Couldn't update refund", { description: getErrorMessage(error) });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 1 }} className="mb-6 max-w-xs" />
        <GlassCard flat>
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </GlassCard>
      </div>
    );
  }

  if (isError || !refund) {
    return (
      <div>
        <Link
          to="/store/refunds"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
        >
          <ArrowLeftOutlined />
          Back to refunds
        </Link>
        <GlassCard flat>
          <EmptyState
            icon={<RollbackOutlined />}
            title="Refund not found"
            description="This request may have been removed, or the link is invalid."
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/store/refunds"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
      >
        <ArrowLeftOutlined />
        Back to refunds
      </Link>

      <div className="aurora-field glass-panel mb-6 overflow-hidden p-6 md:p-7">
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full bg-warning/15 blur-[60px]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
              <RollbackOutlined className="text-lg text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-cloud-100">
                  {refund.order?.order_id ?? "Refund request"}
                </h2>
                <StatusTag tone={refundStatusToneMap[status]}>{refundStatusLabelMap[status]}</StatusTag>
                <StatusTag tone="violet">{refundTypeLabelMap[refundType]}</StatusTag>
              </div>
              <p className="mt-1 text-sm text-mist-400">
                Submitted {formatDateTime(refund.createdAt)}
                {refund.order?.total_items ? ` · ${refund.order.total_items} items` : ""}
              </p>
            </div>
          </div>

          {isPending && (
            <div className="relative flex gap-2">
              <Button danger icon={<StopOutlined />} onClick={() => setAction("rejected")}>
                Reject
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                className="btn-gradient border-0!"
                onClick={() => setAction("refunded")}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <GlassCard flat>
            <SectionTitle icon={<FileTextOutlined />} title="Customer reason" />
            <p className="mt-3 text-sm leading-relaxed text-mist-300">{refund.reason || "No reason provided."}</p>

            {refund.images?.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-mist-600">
                  Evidence
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Image.PreviewGroup>
                    {refund.images.map((src) => (
                      <Image
                        key={src}
                        src={getImageUrl(src)}
                        alt="Refund evidence"
                        width={96}
                        height={96}
                        className="rounded-xl object-cover"
                      />
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard flat>
            <SectionTitle icon={<ShoppingOutlined />} title="Order summary" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="Order ID" value={refund.order?.order_id || "—"} />
              <Metric label="Payment" value={refund.order?.payment_status || "—"} />
              <Metric label="Order status" value={refund.order?.status || "—"} />
              <Metric label="Contact" value={refund.order?.contact_number || "—"} />
            </div>

            {breakdown && (
              <div className="mt-5 space-y-2 rounded-xl border border-navy-700/60 bg-navy-800/35 p-4 text-sm">
                <BreakdownRow label="Products" value={formatCurrency(breakdown.products_price)} />
                <BreakdownRow label="Service fee" value={formatCurrency(breakdown.serviceFee)} />
                <BreakdownRow label="Delivery" value={formatCurrency(breakdown.delivery_charge)} />
                <BreakdownRow label="Tax" value={formatCurrency(breakdown.tax)} />
                {breakdown.discount_amount > 0 && (
                  <BreakdownRow
                    label="Discount"
                    value={`−${formatCurrency(breakdown.discount_amount)}`}
                  />
                )}
                <div className="flex justify-between border-t border-navy-700/60 pt-2 font-display text-base font-semibold text-cloud-100">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard flat>
            <div className="flex items-center gap-3">
              <Avatar
                src={getImageUrl(refund.user?.image)}
                icon={<UserOutlined />}
                size={52}
                className="bg-violet-600/25! text-violet-glow!"
              />
              <div className="min-w-0">
                <div className="font-display font-semibold text-cloud-100">
                  {refund.user?.name || "Deleted user"}
                </div>
                <div className="truncate text-xs text-mist-400">{refund.user?.email || "—"}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard flat>
            <SectionTitle icon={<DollarOutlined />} title="Refund decision" />
            <div className="mt-4 space-y-3">
              <Metric label="Requested type" value={refundTypeLabelMap[refundType]} />
              <Metric
                label="Refund amount"
                value={
                  refund.refundAmount
                    ? formatCurrency(refund.refundAmount)
                    : isPending
                      ? "Not issued yet"
                      : formatCurrency(0)
                }
              />
              {refund.adminNote && <Metric label="Admin note" value={refund.adminNote} />}
              {refund.stripeRefundId && (
                <Metric label="Stripe refund ID" value={refund.stripeRefundId} mono />
              )}
              {refund.failureReason && (
                <div className="rounded-xl border border-danger/25 bg-danger/10 p-3.5 text-sm text-danger">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide opacity-80">
                    Failure reason
                  </div>
                  {refund.failureReason}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <RefundReviewModal
        refund={refund}
        action={action}
        open={!!action}
        loading={isReviewing}
        onCancel={() => setAction(null)}
        onSubmit={handleReview}
      />
    </div>
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

function Metric({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
      <div className="text-[11px] text-mist-600">{label}</div>
      <div
        className={
          mono
            ? "mt-1 truncate font-mono text-xs text-cloud-100"
            : "mt-1 font-display text-sm font-semibold text-cloud-100"
        }
      >
        {value}
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-mist-300">
      <span>{label}</span>
      <span className="text-cloud-100">{value}</span>
    </div>
  );
}
