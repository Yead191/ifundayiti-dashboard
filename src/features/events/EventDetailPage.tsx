import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Popconfirm, Progress, Spin, Avatar, Table } from "antd";
import type { TableProps } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  StarFilled,
  TeamOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toFileUrl } from "@/config";
import {
  useDeleteEventMutation,
  useGetEventByIdQuery,
} from "@/redux/features/events/eventsApi";
import {
  useGetEventBookingsQuery,
  useCheckInTicketMutation,
} from "@/redux/features/eventBookings/eventBookingsApi";
import type { IEventBooking } from "@/redux/features/eventBookings/eventBookings.types";
import {
  getCategoryBadge,
  getFormatBadge,
  getStatusBadge,
  getPaymentStatusBadge,
} from "./statusMaps";

export default function EventDetailPage() {
  const { eventSlug, id: routeId } = useParams<{
    eventSlug?: string;
    id?: string;
  }>();
  const eventId = routeId || eventSlug || "";
  const navigate = useNavigate();

  // Try fetching by ID or Slug
  const {
    data: eventRes,
    isLoading: isEventLoading,
    isError,
  } = useGetEventByIdQuery(eventId, { skip: !eventId });

  const event = eventRes?.data;

  // Bookings for this event
  const { data: bookingsRes, isLoading: isBookingsLoading } =
    useGetEventBookingsQuery(
      { event: event?._id || eventId, limit: 10 },
      { skip: !event?._id && !eventId },
    );

  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [checkInTicket] = useCheckInTicketMutation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const attendees = bookingsRes?.data || [];
  const attendeesCount = bookingsRes?.pagination?.total ?? attendees.length;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Ticket code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleManualCheckIn = async (ticketCode: string) => {
    try {
      const res = await checkInTicket({ ticketCode }).unwrap();
      if (res.data?.alreadyCheckedIn) {
        toast.warning(res.message);
      } else {
        toast.success(res.message || "Attendee checked in successfully!");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Check-in failed");
    }
  };

  const handleDelete = async () => {
    if (!event?._id) return;
    try {
      await deleteEvent(event._id).unwrap();
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete event");
    }
  };

  if (isEventLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" tip="Loading event details..." />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The event you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => navigate("/events")} className="mt-4 rounded-xl">
          Back to Events List
        </Button>
      </div>
    );
  }

  const cat = getCategoryBadge(event.category);
  const fmt = getFormatBadge(event.type);
  const st = getStatusBadge(event.status);

  const capacity = event.capacity || 1;
  const reserved = event.reservedCount || 0;
  const remaining = Math.max(0, event.remainingSeats ?? capacity - reserved);
  const percent = Math.min(100, Math.round((reserved / capacity) * 100));

  const formatIcon =
    event.type === "virtual" ? (
      <VideoCameraOutlined />
    ) : event.type === "hybrid" ? (
      <GlobalOutlined />
    ) : (
      <EnvironmentOutlined />
    );

  const attendeeColumns: TableProps<IEventBooking>["columns"] = [
    {
      title: "Ticket Code",
      key: "ticketCode",
      render: (_, record) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-700">
          <span>{record.ticketCode}</span>
          <button
            type="button"
            onClick={() => handleCopy(record.ticketCode)}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            <CopyOutlined
              className={
                copiedCode === record.ticketCode
                  ? "text-emerald-600 text-xs"
                  : "text-xs"
              }
            />
          </button>
        </div>
      ),
    },
    {
      title: "Attendee",
      key: "attendee",
      render: (_, record) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 block">
            {record.customerName}
          </span>
          <span className="text-[11px] text-slate-500">
            {record.customerEmail}
          </span>
        </div>
      ),
    },
    {
      title: "Admit",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => (
        <span className="text-xs font-semibold text-slate-700">
          Admit {qty || 1}
        </span>
      ),
    },
    {
      title: "Payment",
      key: "paymentStatus",
      render: (_, record) => {
        const badge = getPaymentStatusBadge(record.paymentStatus);
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bgClass}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      title: "Check-In Status",
      key: "checkedIn",
      render: (_, record) =>
        record.checkedIn ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <CheckCircleOutlined />
            <span>Checked In</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <ClockCircleOutlined />
            <span>Awaiting</span>
          </span>
        ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          {!record.checkedIn && (
            <Button
              size="small"
              type="text"
              onClick={() => handleManualCheckIn(record.ticketCode)}
              className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Check-In
            </Button>
          )}
          <Link to={`/event-bookings/${record._id}`}>
            <Button size="small" type="text" className="text-xs text-slate-600">
              View Ticket
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Link to="/events">
            <Button
              icon={<ArrowLeftOutlined />}
              className="h-10 w-10 rounded-xl border-slate-200"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-mist-500">
              <Link
                to="/events"
                className="hover:text-emerald-700 hover:underline"
              >
                Events
              </Link>
              <span>/</span>
              <span className="font-semibold text-slate-800">
                {event.title}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to={`/event-bookings?event=${event._id}`}>
            <Button
              icon={<TeamOutlined />}
              className="h-10 rounded-xl font-medium border-slate-200"
            >
              View All Attendees ({attendeesCount})
            </Button>
          </Link>

          <Link to={`/events/${event._id}/edit`}>
            <Button
              icon={<EditOutlined />}
              className="h-10 rounded-xl font-medium border-slate-200 hover:border-amber-500 hover:text-amber-700"
            >
              Edit Event
            </Button>
          </Link>

          <Popconfirm
            title="Delete Event"
            description="Are you sure you want to delete this event? This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={handleDelete}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              className="h-10 rounded-xl"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>

      {/* Hero Showcase Card */}
      <GlassCard className="relative overflow-hidden p-6 sm:p-8 bg-linear-to-br from-white via-white to-emerald-50/20 border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left / Top Details */}
          <div className="lg:col-span-8 space-y-4">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${cat.bgClass}`}
              >
                {cat.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${fmt.bgClass}`}
              >
                {formatIcon}
                <span>{fmt.label}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${st.bgClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${st.dotClass}`} />
                <span>{st.label}</span>
              </span>
              {event.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <StarFilled className="text-amber-500" />
                  <span>Featured Gathering</span>
                </span>
              )}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              {event.title}
            </h2>

            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
              {event.description}
            </p>

            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <CalendarOutlined className="text-lg text-emerald-700" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Schedule
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatDateTime(event.startDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <EnvironmentOutlined className="text-lg text-indigo-700" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Location
                  </span>
                  <span className="font-semibold text-slate-800">
                    {event.location}
                  </span>
                </div>
              </div>

              {event.venueAddress && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:col-span-2">
                  <EnvironmentOutlined className="text-lg text-slate-500" />
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Physical Address
                    </span>
                    <span className="font-semibold text-slate-800">
                      {event.venueAddress}
                    </span>
                  </div>
                </div>
              )}

              {event.virtualLink && (
                <div className="flex items-center gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 sm:col-span-2">
                  <LinkOutlined className="text-lg text-indigo-700" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-indigo-600 block font-medium">
                      Virtual Meeting Link
                    </span>
                    <a
                      href={event.virtualLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-indigo-900 hover:underline truncate block"
                    >
                      {event.virtualLink}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right / Cover Image & Key KPI Card */}
          <div className="lg:col-span-4 space-y-4">
            {event.image ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm aspect-video sm:aspect-4/3">
                <img
                  src={toFileUrl(event.image)}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-400">
                <span>No cover banner image uploaded</span>
              </div>
            )}

            {/* Capacity Progress Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Seat Occupancy
                </span>
                <span className="font-display text-lg font-extrabold text-[#0B3D2E]">
                  {reserved} / {capacity}
                </span>
              </div>
              <Progress
                percent={percent}
                status={remaining === 0 ? "exception" : "normal"}
                strokeColor={remaining === 0 ? "#e11d48" : "#059669"}
              />
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                <span>Seats Remaining:</span>
                <span className="font-bold text-slate-900">{remaining}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Admission Price:</span>
                <span className="font-bold text-slate-900">
                  {event.pricingType === "free" || !event.price
                    ? "FREE RSVP"
                    : formatCurrency(event.price)}
                </span>
              </div>
              {event.dressCode && (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Dress Code:</span>
                  <span className="font-medium text-slate-800">
                    {event.dressCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Distinguished Speakers Section */}
      {event.speakers && event.speakers.length > 0 && (
        <GlassCard className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <TeamOutlined className="text-purple-600" />
              <span>
                Distinguished Speakers & Panelists ({event.speakers.length})
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.speakers.map((sp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs hover:border-emerald-300 transition"
              >
                <Avatar
                  src={sp.avatar ? toFileUrl(sp.avatar) : undefined}
                  size={52}
                  className="shrink-0 ring-2 ring-amber-300/80 bg-slate-200 text-slate-600 font-bold"
                >
                  {sp.name?.[0]?.toUpperCase() || "S"}
                </Avatar>
                <div>
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    {sp.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {sp.role || "Keynote Speaker"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Recent Attendees / Bookings Roster */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <TeamOutlined className="text-emerald-700" />
              <span>Attendee Roster & Ticket Registrations</span>
            </h3>
            <p className="text-xs text-mist-500 mt-0.5">
              Showing recent attendee registrations for this event.
            </p>
          </div>

          <Link to={`/event-bookings?event=${event._id}`}>
            <Button
              size="small"
              type="link"
              className="font-semibold text-emerald-800 p-0"
            >
              Manage All Bookings &rarr;
            </Button>
          </Link>
        </div>

        <Table
          rowKey="_id"
          columns={attendeeColumns}
          dataSource={attendees}
          loading={isBookingsLoading}
          pagination={false}
          className="[&_.ant-table-thead_th]:bg-slate-50/80 [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:text-slate-500"
        />
      </GlassCard>
    </div>
  );
}
