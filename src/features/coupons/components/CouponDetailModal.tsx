import type { ReactNode } from "react";
import { Button, Modal } from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  NumberOutlined,
  TagOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatDateTime } from "@/lib/utils";
import type { ApiCoupon } from "@/redux/features/coupons/coupons.types";
import type { CouponStatus } from "@/redux/features/coupons/coupons.types";
import {
  formatCouponDiscount,
  formatCouponStatus,
  getCouponStatus,
  getCouponUsage,
  normalizeCouponType,
} from "../couponUtils";

const STATUS_TONE: Record<CouponStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  inactive: "warning",
  expired: "neutral",
};

export function CouponDetailModal({
  coupon,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  coupon: ApiCoupon | null;
  open: boolean;
  onClose: () => void;
  onEdit: (coupon: ApiCoupon) => void;
  onDelete: (coupon: ApiCoupon) => void;
}) {
  if (!coupon) return null;

  const status = getCouponStatus(coupon);
  const usage = getCouponUsage(coupon);
  const type = normalizeCouponType(coupon.type);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
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
      <div className="relative overflow-hidden px-6 pb-6 pt-8 md:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/4 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]" />
          <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-[#f5b544]/10 blur-[80px]" />
        </div>

        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusTag tone={STATUS_TONE[status]}>{formatCouponStatus(status)}</StatusTag>
            <StatusTag tone="violet">{type === "fixed" ? "Fixed discount" : "Percentage off"}</StatusTag>
          </div>

          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0]/40 to-[#4A1C8A]/50 text-lg text-violet-glow shadow-[0_8px_24px_-10px_rgba(129,49,240,0.7)]">
            <TagOutlined />
          </div>

          <p className="font-mono text-sm tracking-widest text-violet-glow">{coupon.coupon_code}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-cloud-100">
            {coupon.name}
          </h2>
          <p className="mt-3 font-display text-3xl font-bold text-cloud-100">
            {formatCouponDiscount(coupon)}
            <span className="ml-2 text-base font-medium text-mist-500">off</span>
          </p>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetaCard
            icon={<ThunderboltOutlined />}
            label="Usage"
            value={`${usage.used} / ${usage.max} used · ${usage.remaining} left`}
          />
          <MetaCard
            icon={<NumberOutlined />}
            label="Discount type"
            value={type === "fixed" ? "Flat amount" : "Percentage"}
          />
          {coupon.stripe_coupon_code && (
            <MetaCard
              icon={<TagOutlined />}
              label="Stripe coupon"
              value={coupon.stripe_coupon_code}
            />
          )}
          <MetaCard
            icon={<CalendarOutlined />}
            label="Starts"
            value={formatDateTime(coupon.start_date)}
          />
          <MetaCard
            icon={<CalendarOutlined />}
            label="Ends"
            value={formatDateTime(coupon.end_date)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Button onClick={onClose}>Close</Button>
        <div className="flex gap-2">
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(coupon)}>
            Delete
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="btn-gradient border-0!"
            onClick={() => onEdit(coupon)}
          >
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-mist-600">
        <span className="text-violet-glow/80">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 font-display text-sm font-semibold text-cloud-100">{value}</div>
    </div>
  );
}
