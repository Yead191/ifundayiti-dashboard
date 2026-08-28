import type { ReactNode } from "react";
import { useState } from "react";
import { Avatar, Button, Modal, Tooltip } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  CloseOutlined,
  CopyOutlined,
  CheckOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import type { ApiBooking, BookingStatus } from "@/redux/features/bookings/bookings.types";
import {
  bookingStatusLabelMap,
  bookingStatusToneMap,
  paymentStatusLabelMap,
  paymentStatusToneMap,
} from "../bookingStatusMaps";
import { BookingStatusSelect } from "./BookingStatusSelect";

export function BookingDetailModal({
  booking,
  open,
  updating,
  onClose,
  onStatusChange,
}: {
  booking: ApiBooking | null;
  open: boolean;
  updating?: boolean;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const phone = booking.phone?.trim() || null;
  const paymentIntentId = booking.paymentIntentId?.trim() || null;

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
          <div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-info/10 blur-[70px]" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone={bookingStatusToneMap[booking.status]}>
                {bookingStatusLabelMap[booking.status]}
              </StatusTag>
              <StatusTag tone={paymentStatusToneMap[booking.paymentStatus]}>
                {paymentStatusLabelMap[booking.paymentStatus] ?? booking.paymentStatus}
              </StatusTag>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-cloud-100">
              {booking.service?.title ?? "Service booking"}
            </h2>
            <p className="mt-1 text-sm text-mist-400">
              {booking?.user?.name}
              {booking.createdAt ? ` · Booked ${formatDate(booking.createdAt)}` : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-600/25 bg-violet-600/10 px-4 py-3 text-right">
            <div className="text-[11px] uppercase tracking-wide text-mist-500">Booking price</div>
            <div className="font-display text-2xl font-semibold text-violet-glow">
              {formatCurrency(booking.price)}
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-navy-700/60 bg-navy-800/40 p-3.5">
          <Avatar
            src={getImageUrl(booking?.user?.image ?? "")}
            icon={<UserOutlined />}
            size={48}
            className="bg-violet-600/25! text-violet-glow!"
          />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{booking?.user?.name || "Deleted user"}</div>
            <div className="truncate text-xs text-mist-400">{booking?.user?.email || "—"}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetaCard
            icon={<CalendarOutlined />}
            label="Preferred date"
            value={formatDate(booking.preferredDate)}
          />
          <MetaCard
            icon={<ClockCircleOutlined />}
            label="Preferred time"
            value={booking.preferredTime || "—"}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-navy-700/60 bg-navy-800/40 p-3.5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-mist-600">
            <BookOutlined className="text-violet-glow/80" />
            Contact details
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ContactRow
              icon={<MailOutlined />}
              label="Email"
              tone="info"
              value={
                <a
                  href={`mailto:${booking?.user?.email}`}
                  className="text-sm font-medium text-cloud-100 transition hover:text-violet-glow"
                >
                  {booking?.user?.email}
                </a>
              }
            />
            <ContactRow
              icon={<PhoneOutlined />}
              label="Contact number"
              tone="success"
              value={
                phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="text-sm font-medium text-cloud-100 transition hover:text-violet-glow"
                  >
                    {phone}
                  </a>
                ) : (
                  <span className="text-sm text-mist-500">Not provided</span>
                )
              }
            />
          </div>
        </div>

        {booking.note && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-mist-600">
              Customer note
            </div>
            <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-4 text-sm leading-relaxed text-mist-300">
              <FileTextOutlined className="mr-2 text-mist-600" />
              {booking.note}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-navy-700/60 bg-navy-800/40 p-3.5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-mist-600">
            <CreditCardOutlined className="text-violet-glow/80" />
            Payment
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetaCard
              icon={<DollarOutlined />}
              label="Payment status"
              value={paymentStatusLabelMap[booking.paymentStatus] ?? booking.paymentStatus}
            />
            <MetaCard
              icon={<CalendarOutlined />}
              label="Booked on"
              value={formatDateTime(booking.createdAt)}
            />
          </div>
          <div className="mt-3">
            <div className="text-[11px] text-mist-600">Payment intent ID</div>
            {paymentIntentId ? (
              <div className="mt-1 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-navy-700/70 bg-navy-900/60 px-2.5 py-1.5 font-mono text-xs text-cloud-100">
                  {paymentIntentId}
                </code>
                <Tooltip title={copied ? "Copied" : "Copy ID"}>
                  <Button
                    type="text"
                    size="small"
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={copyPaymentIntent}
                  />
                </Tooltip>
              </div>
            ) : (
              <p className="mt-1 text-sm text-mist-500">Not available</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-mist-600">
            Booking status
          </div>
          <BookingStatusSelect
            size="middle"
            value={booking.status}
            disabled={updating}
            onChange={onStatusChange}
          />
        </div>
        <Button onClick={onClose} className="sm:shrink-0">
          Close
        </Button>
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
      <div className="mt-1.5 truncate font-display text-sm font-semibold text-cloud-100">{value}</div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  tone: "info" | "success";
  value: ReactNode;
}) {
  const toneClass =
    tone === "info"
      ? "bg-info/12 text-info"
      : "bg-success/12 text-success";

  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-mist-600">{label}</div>
        <div className="mt-0.5">{value}</div>
      </div>
    </div>
  );
}
