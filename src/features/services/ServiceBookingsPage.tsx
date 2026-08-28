import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, DatePicker, Select, Table, Tooltip, type TableProps } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useGetServicesQuery } from "@/redux/features/services/servicesApi";
import {
  useDeleteBookingMutation,
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/redux/features/bookings/bookingsApi";
import {
  BOOKING_STATUS_OPTIONS,
  type ApiBooking,
  type BookingStatus,
} from "@/redux/features/bookings/bookings.types";
import {
  bookingStatusLabelMap,
  paymentStatusLabelMap,
  paymentStatusToneMap,
} from "./bookingStatusMaps";
import { BookingDetailModal } from "./components/BookingDetailModal";
import { BookingStatusSelect } from "./components/BookingStatusSelect";
import { getImageUrl } from "@/lib/getImageUrl";

const { RangePicker } = DatePicker;

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function ServiceBookingsPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [serviceId, setServiceId] = useState<string>("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState<ApiBooking | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data: servicesRes } = useGetServicesQuery({ page: 1, limit: 100 });
  const serviceOptions = useMemo(
    () =>
      (servicesRes?.data ?? []).map((s) => ({
        label: s.title,
        value: s._id,
      })),
    [servicesRes]
  );

  const { data, isFetching } = useGetBookingsQuery({
    page,
    limit,
    searchTerm,
    serviceId: serviceId || undefined,
    status: status || undefined,
    startDate: dateRange?.[0]?.startOf("day").toISOString(),
    endDate: dateRange?.[1]?.endOf("day").toISOString(),
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateBookingStatusMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  const bookings = data?.data ?? [];
  const pagination = data?.pagination;

  const statusCounts = useMemo(() => {
    const counts: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const b of bookings) counts[b.status] += 1;
    return counts;
  }, [bookings]);

  const deleteFlow = useConfirmDelete<ApiBooking>(async (record) => {
    const promise = deleteBooking(record._id)
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: "Deleting booking…",
      success: `Booking for ${record.user?.name || "customer"} was deleted.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const handleStatusChange = async (id: string, nextStatus: BookingStatus) => {
    try {
      await updateStatus({ id, status: nextStatus }).unwrap();
      toast.success("Booking updated", {
        description: `Status changed to ${bookingStatusLabelMap[nextStatus]}.`,
      });
      setViewing((prev) => (prev && prev._id === id ? { ...prev, status: nextStatus } : prev));
    } catch (error) {
      toast.error("Couldn't update status", { description: getErrorMessage(error) });
    }
  };

  const columns: TableProps<ApiBooking>["columns"] = [
    {
      title: "Customer",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={getImageUrl(record?.user?.image ?? "")} size={38} className="bg-violet-600/25! text-violet-glow!" />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{record?.user?.name || "Deleted user"}</div>
            <div className="max-w-50 truncate text-xs text-mist-400">{record?.user?.email || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Service",
      key: "service",
      render: (_, record) => (
        <span className="font-medium text-cloud-100">{record?.service?.title}</span>
      ),
    },
    {
      title: "Preferred",
      key: "schedule",
      responsive: ["md"],
      render: (_, record) => (
        <div>
          <div className="text-cloud-100">{formatDate(record.preferredDate)}</div>
          <div className="text-xs text-mist-400">{record.preferredTime}</div>
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <span className="font-semibold text-cloud-100">{formatCurrency(record.price)}</span>
      ),
    },
    {
      title: "Payment",
      key: "paymentStatus",
      responsive: ["lg"],
      render: (_, record) => (
        <StatusTag tone={paymentStatusToneMap[record.paymentStatus]}>
          {paymentStatusLabelMap[record.paymentStatus] ?? record.paymentStatus}
        </StatusTag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <BookingStatusSelect
          value={record.status}
          onChange={(value) => handleStatusChange(record._id, value)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 108,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="View booking">
            <Button
              type="text"
              className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
              icon={<EyeOutlined />}
              onClick={() => setViewing(record)}
            />
          </Tooltip>
          <Tooltip title="Delete booking">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteFlow.request(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pending"
          value={statusCounts.pending}
          icon={<CalendarOutlined />}
          tone="warning"
        />
        <StatCard
          label="Confirmed"
          value={statusCounts.confirmed}
          icon={<BookOutlined />}
          tone="info"
        />
        <StatCard
          label="Completed"
          value={statusCounts.completed}
          icon={<BookOutlined />}
          tone="success"
        />
        <StatCard
          label="Cancelled"
          value={statusCounts.cancelled}
          icon={<BookOutlined />}
          tone="danger"
        />
      </div>

      <PageToolbar eyebrow="Service bookings" count={pagination?.total} />

      <GlassCard flat className="mb-4">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            placeholder="Search name, email…"
            value={search}
            onChange={setSearch}
          />
          <Select
            allowClear
            placeholder="All services"
            value={serviceId || undefined}
            options={serviceOptions}
            onChange={(value) => {
              setServiceId(value ?? "");
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="All statuses"
            value={status || undefined}
            options={BOOKING_STATUS_OPTIONS.map((s) => ({
              label: bookingStatusLabelMap[s],
              value: s,
            }))}
            onChange={(value) => {
              setStatus((value as BookingStatus) ?? "");
              setPage(1);
            }}
          />
          <RangePicker
            className="w-full!"
            value={dateRange}
            onChange={(range) => {
              setDateRange((range as [Dayjs, Dayjs] | null) ?? null);
              setPage(1);
            }}
            placeholder={["From date", "To date"]}
          />
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && bookings.length === 0 ? (
          <EmptyState
            icon={<BookOutlined />}
            title="No bookings found"
            description="Try adjusting search, service, status, or date filters."
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={bookings}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} bookings`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <BookingDetailModal
        booking={viewing}
        open={!!viewing}
        updating={isUpdatingStatus}
        onClose={() => setViewing(null)}
        onStatusChange={(next) => {
          if (!viewing) return;
          handleStatusChange(viewing._id, next);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title="Delete this booking?"
        description={`This permanently removes the booking${
          deleteFlow.target?.user?.name ? ` for ${deleteFlow.target.user.name}` : ""
        }. This can't be undone.`}
        confirmLabel="Delete booking"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
