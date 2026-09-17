import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, QRCode, Spin, Popconfirm } from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  UserOutlined,
  DollarCircleOutlined,
  StopOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import {
  useGetEventBookingByIdQuery,
  useCheckInTicketMutation,
  useUpdateEventBookingStatusMutation,
} from "@/redux/features/eventBookings/eventBookingsApi";
import {
  getBookingStatusBadge,
  getPaymentStatusBadge,
  getCategoryBadge,
} from "../statusMaps";

export default function EventBookingDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: bookingRes,
    isLoading,
    isError,
    refetch,
  } = useGetEventBookingByIdQuery(id, { skip: !id });

  const [checkInTicket, { isLoading: isCheckingIn }] =
    useCheckInTicketMutation();
  const [updateBookingStatus, { isLoading: isCancelling }] =
    useUpdateEventBookingStatusMutation();

  const [copied, setCopied] = useState(false);

  const booking = bookingRes?.data;
  const event =
    typeof booking?.event === "object" && booking?.event !== null
      ? (booking.event as any)
      : null;

  const handleCopyCode = () => {
    if (!booking?.ticketCode) return;
    navigator.clipboard.writeText(booking.ticketCode);
    setCopied(true);
    toast.success("Ticket code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManualCheckIn = async () => {
    if (!booking?.ticketCode) return;
    try {
      const res = await checkInTicket({
        ticketCode: booking.ticketCode,
      }).unwrap();
      if (res.data?.alreadyCheckedIn) {
        toast.warning(res.message);
      } else {
        toast.success(res.message || "Attendee marked as Checked In!");
      }
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Check-in failed");
    }
  };

  const handleCancelBooking = async () => {
    if (!booking?._id) return;
    try {
      await updateBookingStatus({
        id: booking._id,
        body: { status: "cancelled", note: "Cancelled by admin" },
      }).unwrap();
      toast.success("Booking cancelled & seat released.");
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel booking");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" tip="Loading ticket details..." />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Ticket Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The requested ticket booking record could not be located.
        </p>
        <Button
          onClick={() => navigate("/event-bookings")}
          className="mt-4 rounded-xl"
        >
          Back to Bookings
        </Button>
      </div>
    );
  }

  const bookingBadge = getBookingStatusBadge(booking.status);
  const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
  const categoryBadge = getCategoryBadge(event?.category);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Header & Breadcrumb - Hidden in print */}
      <div className="print:hidden flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Link to="/event-bookings">
            <Button
              icon={<ArrowLeftOutlined />}
              className="h-10 w-10 rounded-xl border-slate-200"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-mist-500">
              <Link
                to="/event-bookings"
                className="hover:text-emerald-700 hover:underline"
              >
                Bookings
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-800 font-mono">
                {booking.ticketCode}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
              Ticket Pass & Reservation Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="h-10 rounded-xl bg-[#0B3D2E] hover:bg-[#082b20] font-bold px-5 border-0 shadow-sm"
          >
            Print / Save PDF
          </Button>

          {!booking.checkedIn && booking.status !== "cancelled" && (
            <Button
              onClick={handleManualCheckIn}
              loading={isCheckingIn}
              className="h-10 rounded-xl font-semibold border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              Check-In Attendee
            </Button>
          )}

          {booking.status !== "cancelled" && (
            <Popconfirm
              title="Cancel Booking"
              description="Are you sure you want to cancel this booking? This will decrement the event's reserved seats."
              okText="Cancel Booking"
              cancelText="Keep"
              onConfirm={handleCancelBooking}
            >
              <Button
                danger
                loading={isCancelling}
                icon={<StopOutlined />}
                className="h-10 rounded-xl"
              >
                Cancel Pass
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {/* 
        ========================================================================
        OFFICIAL LUXURY GOLDEN TICKET PASS
        Obsidian Black (#0E0E10) + Metallic Gold (#D4AF37) Perforated Pass
        ========================================================================
      */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37]/40 bg-[#0E0E10] text-white shadow-2xl transition hover:border-[#D4AF37]/70">
        <div className="flex flex-col lg:flex-row">
          {/* Main Pass Body (Left) */}
          <div className="relative flex-1 p-6 sm:p-8 space-y-5 overflow-hidden">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://res.cloudinary.com/dknmebeee/image/upload/v1789453331/logo-ifundayiti-nav_ea5qml.png"
                  alt="iFundAyiti Logo"
                  className="h-8 object-contain brightness-110"
                />
                <div className="h-6 w-px bg-white/20" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#D4AF37]">
                  Official Invitation Pass
                </span>
              </div>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                {categoryBadge.label}
              </span>
            </div>

            {/* Event Title */}
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase block">
                Admit to Gathering
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">
                {event?.title || "iFundAyiti Special Gathering"}
              </h2>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 block font-medium">
                  Date & Schedule
                </span>
                <span className="text-white font-semibold block text-sm mt-0.5">
                  {event?.startDate
                    ? formatDateTime(event.startDate)
                    : "See Invitation"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">
                  Venue Location
                </span>
                <span className="text-white font-semibold block text-sm mt-0.5">
                  {event?.location || "Private Venue"}
                </span>
                {event?.venueAddress && (
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    {event.venueAddress}
                  </span>
                )}
              </div>

              {event?.dressCode && (
                <div>
                  <span className="text-slate-400 block font-medium">
                    Dress Code
                  </span>
                  <span className="text-[#D4AF37] font-semibold block mt-0.5">
                    {event.dressCode}
                  </span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-medium">
                  Reserved Tier
                </span>
                <span className="text-white font-bold block mt-0.5">
                  {booking.paymentStatus === "free"
                    ? "Complimentary Guest"
                    : "VIP Ticket Holder"}
                </span>
              </div>
            </div>

            {/* Attendee Name & Admit Count Bar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Guest Name
                </span>
                <span className="font-display text-lg font-bold text-[#F7E7CE]">
                  {booking.customerName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Admissions
                  </span>
                  <span className="text-sm font-extrabold text-[#D4AF37]">
                    ADMIT {booking.quantity || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Botanical Motif Background Accent */}
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-[#D4AF37]/10 blur-2xl" />
          </div>

          {/* 
            Perforated Tear Notch & Divider (Desktop & Print)
          */}
          <div className="relative flex items-center justify-center lg:flex-col border-t lg:border-t-0 lg:border-l border-dashed border-[#D4AF37]/40 bg-[#0E0E10]">
            {/* Top semicircular notch (Desktop) */}
            <div className="hidden lg:block absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-100 border-b border-[#D4AF37]/40" />
            {/* Bottom semicircular notch (Desktop) */}
            <div className="hidden lg:block absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-100 border-t border-[#D4AF37]/40" />
          </div>

          {/* Right Ticket Stub */}
          <div className="w-full lg:w-72 bg-linear-to-b from-[#18181B] to-[#0E0E10] p-6 flex flex-col items-center justify-between text-center space-y-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase block">
                Entry Pass Stub
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 font-mono text-base font-extrabold text-white mt-1 tracking-wider hover:text-[#D4AF37] transition cursor-pointer"
                title="Click to copy ticket code"
              >
                <span>{booking.ticketCode}</span>
                <CopyOutlined
                  className={
                    copied
                      ? "text-emerald-400 text-sm"
                      : "text-slate-400 text-sm"
                  }
                />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="rounded-2xl border-2 border-[#D4AF37] bg-white p-3 shadow-lg">
              <QRCode
                value={booking.ticketCode}
                size={110}
                bordered={false}
                errorLevel="H"
              />
            </div>

            {/* Scan instructions */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">
                Scan at entrance for admission
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                Admit {booking.quantity || 1} •{" "}
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>

            {/* Stylized Barcode Graphic */}
            <div className="w-full pt-1">
              <div className="flex h-7 items-center justify-center gap-1 opacity-70">
                {[
                  3, 1, 4, 1, 2, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2,
                ].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-[#D4AF37] h-full"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details & Audit Information - Hidden in print */}
      <div className="print:hidden grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Attendee Profile Information */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <UserOutlined className="text-emerald-700" />
            <span>Attendee Information</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">
                Full Name:
              </span>
              <span className="font-bold text-sm text-slate-900 block mt-0.5">
                {booking.customerName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <MailOutlined className="text-slate-400" />
              <span>{booking.customerEmail}</span>
            </div>

            {booking.customerPhone && (
              <div className="flex items-center gap-2 text-slate-700">
                <PhoneOutlined className="text-slate-400" />
                <span className="font-mono">{booking.customerPhone}</span>
              </div>
            )}

            {booking.note && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mt-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Dietary / Special Requirements Note:
                </span>
                <p className="mt-0.5 text-slate-700">{booking.note}</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Payment & Admission Audit */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <DollarCircleOutlined className="text-amber-600" />
            <span>Reservation Status & Audit</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Ticket Code:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-amber-800">
                <span>{booking.ticketCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <CopyOutlined />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">
                Reservation Status:
              </span>
              <span
                className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${bookingBadge.bgClass}`}
              >
                {bookingBadge.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">
                Payment Status:
              </span>
              <span
                className={`inline-flex px-2 py-0.5 rounded-md font-semibold border ${paymentBadge.bgClass}`}
              >
                {paymentBadge.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Paid:</span>
              <span className="font-display font-extrabold text-slate-900 text-sm">
                {booking.paymentStatus === "free"
                  ? "Complimentary"
                  : formatCurrency(booking.price)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-500 font-medium">Door Check-In:</span>
              {booking.checkedIn ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircleOutlined />
                    <span>Checked In</span>
                  </span>
                  {booking.checkedInAt && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {formatDateTime(booking.checkedInAt)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <ClockCircleOutlined className="text-slate-400" />
                  <span>Awaiting Arrival</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Booked Date:</span>
              <span>{formatDateTime(booking.createdAt)}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
