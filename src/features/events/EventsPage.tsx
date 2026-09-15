import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Spin } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useDeleteEventMutation,
  useGetEventsQuery,
  useGetEventStatsOverviewQuery,
  useUpdateEventMutation,
} from "@/redux/features/events/eventsApi";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { EventStatsHeader } from "./components/EventStatsHeader";
import { EventFiltersBar } from "./components/EventFiltersBar";
import { EventsTable } from "./components/EventsTable";

export default function EventsPage() {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter states
  const [category, setCategory] = useState<string>("all");
  const [formatType, setFormatType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [pricingType, setPricingType] = useState<string>("all");

  // Debounced search
  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: searchTerm,
  } = useDebouncedSearch({ delay: 350 });

  // Stats query
  const {
    data: statsRes,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useGetEventStatsOverviewQuery();

  // Events query
  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      searchTerm: searchTerm.trim() || undefined,
      category: category !== "all" ? category : undefined,
      type: formatType !== "all" ? formatType : undefined,
      status: status !== "all" ? status : undefined,
      pricingType: pricingType !== "all" ? pricingType : undefined,
      sort: "-createdAt",
    }),
    [page, pageSize, searchTerm, category, formatType, status, pricingType],
  );

  const {
    data: eventsRes,
    isLoading: isLoadingEvents,
    isFetching: isFetchingEvents,
    refetch: refetchEvents,
  } = useGetEventsQuery(queryParams);

  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const events = useMemo(() => eventsRes?.data || [], [eventsRes?.data]);
  const pagination = eventsRes?.pagination || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPage: 1,
  };

  // Compute upcoming gatherings count
  const upcomingCount = useMemo(() => {
    const now = new Date();
    return events.filter(
      (ev) =>
        (ev.status === "published" || !ev.status) &&
        new Date(ev.startDate) > now,
    ).length;
  }, [events]);

  const handleRefresh = () => {
    refetchStats();
    refetchEvents();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateEvent({ id, body: { status: newStatus } }).unwrap();
      toast.success("Event status updated", {
        description: `Status changed to ${newStatus.toUpperCase()}.`,
      });
    } catch (err: any) {
      toast.error("Failed to update status", {
        description: err?.data?.message || "An error occurred.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id).unwrap();
      toast.success("Event deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete event", {
        description: err?.data?.message || "An error occurred.",
      });
    }
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Events & Gatherings
          </h1>
          <p className="mt-1 text-sm text-mist-600">
            Publish, manage and monitor galas, fundraisers, pitch nights, and hybrid community workshops.
          </p>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <EventStatsHeader
        stats={statsRes?.data}
        loading={isLoadingStats}
        upcomingCount={upcomingCount}
      />

      {/* Filter Toolbar */}
      <EventFiltersBar
        searchTerm={searchInput}
        onSearchChange={(val) => {
          setSearchInput(val);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategoryChangeHelper(val);
          setPage(1);
        }}
        formatType={formatType}
        onFormatChange={(val) => {
          setFormatType(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        pricingType={pricingType}
        onPricingTypeChange={(val) => {
          setPricingType(val);
          setPage(1);
        }}
        onRefresh={handleRefresh}
        isFetching={isFetchingEvents}
      />

      {/* Table Content */}
      {isLoadingEvents ? (
        <div className="flex h-72 items-center justify-center">
          <Spin size="large" tip="Loading event records..." />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarOutlined className="text-5xl text-mist-400" />}
          title="No events found"
          description={
            searchInput || category !== "all" || status !== "all" || formatType !== "all"
              ? "No events match your current filter criteria. Try clearing search or adjusting filters."
              : "No events have been created yet. Click '+ Create New Event' to publish your first gathering."
          }
        />
      ) : (
        <EventsTable
          data={events}
          loading={isFetchingEvents}
          page={page}
          pageSize={pageSize}
          total={pagination.total}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );

  function setCategoryChangeHelper(val: string) {
    setCategory(val);
  }
}
