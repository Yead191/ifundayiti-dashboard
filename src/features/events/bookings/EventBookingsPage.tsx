import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Table,
  Button,
  Select,
  Input,
  Tooltip,
  Popconfirm,
  Spin,
} from "antd";
import type { TableProps } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  StopOutlined,
  CalendarOutlined,
  PrinterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useGetEventsQuery } from "@/redux/features/events/eventsApi";
import {
  useGetEventBookingsQuery,
  useCheckInTicketMutation,
  useUpdateEventBookingStatusMutation,
  useDeleteEventBookingMutation,
} from "@/redux/features/eventBookings/eventBookingsApi";
import type { IEventBooking } from "@/redux/features/eventBookings/eventBookings.types";
import {
  getPaymentStatusBadge,
} from "../statusMaps";

export default function EventBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlEventId = searchParams.get("event") || "all";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEventId, setSelectedEventId] = useState<string>(urlEventId);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [checkInFilter, setCheckInFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Debounced search
  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: searchTerm,
  } = useDebouncedSearch({ delay: 350 });

  // Events list for dropdown filter
  const { data: eventsRes } = useGetEventsQuery({ limit: 100 });
  const eventOptions = (eventsRes?.data || []).map((ev) => ({
    value: ev._id,
    label: ev.title,
  }));

  // Query params for bookings
  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      searchTerm: searchTerm.trim() || undefined,
      event: selectedEventId !== "all" ? selectedEventId : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
      checkedIn:
        checkInFilter === "checkedIn"
          ? true
          : checkInFilter === "notCheckedIn"
          ? false
          : undefined,
      sort: "-createdAt",
    }),
    [page, pageSize, searchTerm, selectedEventId, statusFilter, paymentStatusFilter, checkInFilter],
  );

  const {
    data: bookingsRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetEventBookingsQuery(queryParams);

  const [checkInTicket] = useCheckInTicketMutation();
  const [updateBookingStatus] = useUpdateEventBookingStatusMutation();
  const [deleteBooking, { isLoading: isDeletingBooking }] = useDeleteEventBookingMutation();

  const bookings = bookingsRes?.data || [];
  const pagination = bookingsRes?.pagination || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPage: 1,
  };

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

  const handleCancelBooking = async (id: string) => {
    try {
      await updateBookingStatus({
        id,
        body: { status: "cancelled", note: "Cancelled by administrator" },
      }).unwrap();
      toast.success("Booking cancelled and seat capacity restored.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel booking");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id).unwrap();
      toast.success("Booking deleted successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete booking");
    }
  };

  const handleExportCsv = () => {
    if (bookings.length === 0) {
      toast.error("No attendee records to export");
      return;
    }

    const headers = [
      "Ticket Code",
      "Attendee Name",
      "Attendee Email",
      "Phone",
      "Event Title",
      "Quantity",
      "Price",
      "Status",
      "Payment Status",
      "Checked In",
      "Checked In At",
      "Booking Date",
    ];

    const rows = bookings.map((b) => {
      const eventTitle =
        typeof b.event === "object" && b.event !== null
          ? (b.event as any).title
          : "Event";

      return [
        `"${b.ticketCode || ""}"`,
        `"${b.customerName || ""}"`,
        `"${b.customerEmail || ""}"`,
        `"${b.customerPhone || ""}"`,
        `"${eventTitle}"`,
        b.quantity || 1,
        b.price || 0,
        b.status || "",
        b.paymentStatus || "",
        b.checkedIn ? "Yes" : "No",
        b.checkedInAt ? `"${b.checkedInAt}"` : "",
        `"${b.createdAt || ""}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `event_attendees_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendee list exported to CSV");
  };

  const columns: TableProps<IEventBooking>["columns"] = [
    {
      title: "Ticket ID",
      key: "ticketCode",
      width: 170,
      render: (_, record) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 w-fit">
          <span>{record.ticketCode}</span>
          <button
            type="button"
            onClick={() => handleCopy(record.ticketCode)}
            className="text-amber-600 hover:text-amber-950 transition cursor-pointer"
          >
            <CopyOutlined className={copiedCode === record.ticketCode ? "text-emerald-700 text-[11px]" : "text-[11px]"} />
          </button>
        </div>
      ),
    },
    {
      title: "Attendee Name & Contact",
      key: "customer",
      render: (_, record) => (
        <div>
          <span className="font-semibold text-xs text-slate-900 block">
            {record.customerName}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {record.customerEmail}
          </span>
          {record.customerPhone && (
            <span className="text-[11px] text-slate-400 block font-mono">
              {record.customerPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Event",
      key: "event",
      render: (_, record) => {
        const ev = typeof record.event === "object" && record.event !== null ? record.event : null;
        const eventTitle = ev?.title || "Event Gathering";
        const eventDate = ev?.startDate ? formatDateTime(ev.startDate) : "";

        return (
          <div className="min-w-0 max-w-xs">
            {ev?._id ? (
              <Link
                to={`/events/${ev._id}`}
                className="font-semibold text-xs text-slate-800 hover:text-[#0B3D2E] truncate block transition"
              >
                {eventTitle}
              </Link>
            ) : (
              <span className="font-semibold text-xs text-slate-800 truncate block">
                {eventTitle}
              </span>
            )}
            {eventDate && (
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {eventDate}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Admit",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (qty) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
          Admit {qty || 1}
        </span>
      ),
    },
    {
      title: "Payment",
      key: "paymentStatus",
      width: 130,
      render: (_, record) => {
        const badge = getPaymentStatusBadge(record.paymentStatus);
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${badge.bgClass}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      title: "Check-in Status",
      key: "checkIn",
      width: 190,
      render: (_, record) =>
        record.checkedIn ? (
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircleOutlined />
              <span>Checked In</span>
            </span>
            {record.checkedInAt && (
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {formatDateTime(record.checkedInAt)}
              </span>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ClockCircleOutlined className="text-slate-400" />
            <span>Awaiting Arrival</span>
          </span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          {/* Manual Check-in Button if not checked in */}
          {!record.checkedIn && record.status !== "cancelled" && (
            <Tooltip title="Check in attendee at door">
              <Button
                size="small"
                type="text"
                onClick={() => handleManualCheckIn(record.ticketCode)}
                className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Check In
              </Button>
            </Tooltip>
          )}

          {/* View Luxury Golden Ticket Pass */}
          <Tooltip title="View & Print Official Golden Ticket">
            <Link to={`/event-bookings/${record._id}`}>
              <Button
                type="text"
                size="small"
                icon={<PrinterOutlined className="text-amber-700" />}
                className="h-8 w-8 rounded-lg hover:bg-amber-50"
              />
            </Link>
          </Tooltip>

          {/* Cancel Booking */}
          {record.status !== "cancelled" && (
            <Tooltip title="Cancel booking & release capacity">
              <Popconfirm
                title="Cancel Booking"
                description="Are you sure you want to cancel this booking? The seat capacity will be restored."
                okText="Yes, Cancel"
                cancelText="Keep"
                onConfirm={() => handleCancelBooking(record._id)}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<StopOutlined className="text-rose-500" />}
                  className="h-8 w-8 rounded-lg hover:bg-rose-50"
                />
              </Popconfirm>
            </Tooltip>
          )}

          {/* Delete Booking Permanently */}
          <Tooltip title="Delete booking record">
            <Popconfirm
              title="Delete Booking"
              description="Are you sure you want to permanently delete this booking record? This action cannot be undone."
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteBooking(record._id)}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined className="text-rose-600" />}
                className="h-8 w-8 rounded-lg hover:bg-rose-50"
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Attendee Bookings & Tickets
          </h1>
          <p className="mt-1 text-sm text-mist-600">
            Monitor registered guests, audit Stripe ticket purchases, and issue official passes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCsv}
            className="h-10 rounded-xl font-medium border-slate-200"
          >
            Export CSV
          </Button>

          <Link to="/event-checkin">
            <Button
              type="primary"
              className="h-10 rounded-xl bg-[#0B3D2E] hover:bg-[#082b20] font-bold px-5 border-0 shadow-sm"
            >
              Open Live QR Scanner &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search by name, email, phone, ticket..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Event Dropdown */}
            <Select
              value={selectedEventId}
              onChange={(val) => {
                setSelectedEventId(val);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (val && val !== "all") {
                    next.set("event", val);
                  } else {
                    next.delete("event");
                  }
                  return next;
                });
                setPage(1);
              }}
              className="h-10 min-w-44 max-w-xs"
              options={[
                { value: "all", label: "All Events" },
                ...eventOptions,
              ]}
            />

            {/* Check-In Filter */}
            <Select
              value={checkInFilter}
              onChange={(val) => {
                setCheckInFilter(val);
                setPage(1);
              }}
              className="h-10 min-w-36"
              options={[
                { value: "all", label: "All Check-ins" },
                { value: "checkedIn", label: "Checked In" },
                { value: "notCheckedIn", label: "Awaiting Arrival" },
              ]}
            />

            {/* Payment Filter */}
            <Select
              value={paymentStatusFilter}
              onChange={(val) => {
                setPaymentStatusFilter(val);
                setPage(1);
              }}
              className="h-10 min-w-34"
              options={[
                { value: "all", label: "All Payments" },
                { value: "paid", label: "Paid via Stripe" },
                { value: "free", label: "Free RSVP" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
            />

            {/* Booking Status Filter */}
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              className="h-10 min-w-32"
              options={[
                { value: "all", label: "All Status" },
                { value: "confirmed", label: "Confirmed" },
                { value: "pending", label: "Pending" },
                { value: "attended", label: "Attended" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />

            <Tooltip title="Refresh attendee bookings">
              <Button
                icon={<ReloadOutlined className={isFetching ? "animate-spin" : ""} />}
                onClick={() => refetch()}
                className="h-10 w-10 rounded-xl"
              />
            </Tooltip>
          </div>
        </div>
      </GlassCard>

      {/* Bookings Table */}
      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Spin size="large" tip="Loading attendee registrations..." />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarOutlined className="text-5xl text-mist-400" />}
          title="No bookings found"
          description={
            searchInput || selectedEventId !== "all" || checkInFilter !== "all" || paymentStatusFilter !== "all"
              ? "No attendee bookings match your current filter parameters. Try clearing your filters."
              : "No attendee tickets have been reserved yet."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={bookings}
            loading={isFetching}
            pagination={{
              current: page,
              pageSize,
              total: pagination.total,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              className: "px-4 py-3",
            }}
            className="[&_.ant-table-thead_th]:bg-slate-50/80 [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:text-slate-500 [&_.ant-table-tbody_tr]:hover:bg-emerald-50/20"
          />
        </div>
      )}
    </div>
  );
}
