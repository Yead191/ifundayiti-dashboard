import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Pagination, Select, Segmented, Skeleton, Tabs, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  StarFilled,
} from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusTag } from "@/components/ui/StatusTag";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatDateTime } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery,
  useUpdateEventMutation,
} from "@/redux/features/events/eventsApi";
import { buildEventFormData } from "@/redux/features/events/buildEventFormData";
import {
  EVENT_STATUS_OPTIONS,
  EVENT_TYPE_OPTIONS,
  type ApiEvent,
  type EventFormPayload,
  type EventStatus,
  type EventType,
} from "@/redux/features/events/events.types";
import {
  eventStatusDotClassMap,
  eventStatusLabelMap,
  eventStatusToneMap,
  eventTypeLabelMap,
  eventTypeToneMap,
  normalizeEventStatus,
  normalizeEventType,
} from "./statusMaps";
import { EventFormModal } from "./components/EventFormModal";

type StatusTab = EventStatus | "all";
type FeaturedFilter = "all" | "featured" | "standard";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: EventStatus) {
  const { data } = useGetEventsQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "">("");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiEvent | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab, typeFilter, featuredFilter]);

  const allCount = useStatusCount();
  const draftCount = useStatusCount("DRAFT");
  const publishedCount = useStatusCount("PUBLISHED");
  const completedCount = useStatusCount("COMPLETED");
  const cancelledCount = useStatusCount("CANCELLED");

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    DRAFT: draftCount,
    PUBLISHED: publishedCount,
    COMPLETED: completedCount,
    CANCELLED: cancelledCount,
  };

  const { data, isFetching, isLoading } = useGetEventsQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? undefined : statusTab,
    type: typeFilter || undefined,
    isFeatured:
      featuredFilter === "all" ? undefined : featuredFilter === "featured",
  });

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiEvent>(async (record) => {
    const promise = deleteEvent(record._id).unwrap();

    toast.promise(promise, {
      loading: `Deleting ${record.title}…`,
      success: `${record.title} was deleted.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: ApiEvent) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: EventFormPayload) => {
    const body = buildEventFormData(payload);
    try {
      if (editing) {
        await updateEvent({ id: editing._id, body }).unwrap();
        toast.success("Event updated", {
          description: `${payload.title} has been saved.`,
        });
      } else {
        await createEvent(body).unwrap();
        toast.success("Event created", {
          description: `${payload.title} is ready on the calendar.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update event" : "Couldn't create event", {
        description: getErrorMessage(error),
      });
    }
  };

  const tabItems = [
    { key: "all" as const, label: "All", count: tabCounts.all },
    ...EVENT_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: eventStatusLabelMap[status],
      count: tabCounts[status],
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 overflow-hidden p-6 md:flex-row md:items-center">
        <div className="relative flex items-start gap-4">
          <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-violet-600/20 blur-[60px]" />
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <CalendarOutlined className="text-lg text-white" />
          </div>
          <div className="relative">
            <h2 className="font-display text-xl font-semibold text-cloud-100">Manage events</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Publish workshops, meetups, and conferences — cover media, organizers, and schedule in
              one place.
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
          New event
        </Button>
      </div>

      <GlassCard flat className="mb-4" padded={false}>
        <div className="px-4 pt-2 md:px-5">
          <Tabs
            activeKey={statusTab}
            onChange={(key) => setStatusTab(key as StatusTab)}
            items={tabItems.map((tab) => ({
              key: tab.key,
              label: (
                <span className="flex items-center gap-2">
                  {tab.key !== "all" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        eventStatusDotClassMap[tab.key as EventStatus]
                      )}
                    />
                  )}
                  {tab.label}
                  <Badge
                    count={tab.count}
                    showZero
                    overflowCount={999}
                    style={{
                      backgroundColor: statusTab === tab.key ? "#8131F0" : "#23274f",
                      color: statusTab === tab.key ? "#fff" : "#9ca3c9",
                      boxShadow: "none",
                    }}
                  />
                </span>
              ),
            }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 border-t border-navy-700/60 p-4 sm:grid-cols-2 xl:grid-cols-4 md:px-5">
          <SearchInput
            placeholder="Search title, location, tags…"
            value={search}
            onChange={setSearch}
          />
          <Select
            allowClear
            placeholder="Event type"
            value={typeFilter || undefined}
            options={EVENT_TYPE_OPTIONS.map((type) => ({
              label: eventTypeLabelMap[type],
              value: type,
            }))}
            onChange={(value) => setTypeFilter(value ?? "")}
            className="w-full!"
          />
          <Segmented
            className="sm:col-span-2 xl:col-span-2"
            value={featuredFilter}
            onChange={(value) => setFeaturedFilter(value as FeaturedFilter)}
            options={[
              { label: "All", value: "all" },
              { label: "Featured", value: "featured" },
              { label: "Standard", value: "standard" },
            ]}
          />
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-800/30">
              <Skeleton.Image active className="!h-40 !w-full" />
              <div className="p-4">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </div>
          ))}
        </div>
      ) : !isFetching && events.length === 0 ? (
        <EmptyState
          icon={<CalendarOutlined />}
          title="No events in this view"
          description="Try another status tab, type, or clear search — or create your first event."
          actionLabel="New event"
          onAction={openCreate}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
              isFetching && "opacity-70 transition-opacity"
            )}
          >
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onView={() => navigate(`/events/${event.slug}`)}
                onEdit={() => openEdit(event)}
                onDelete={() => deleteFlow.request(event)}
              />
            ))}
          </div>

          {(pagination?.totalPage ?? 1) > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                current={pagination?.page ?? page}
                pageSize={pagination?.limit ?? limit}
                total={pagination?.total ?? 0}
                showSizeChanger
                pageSizeOptions={["9", "12", "18", "24"]}
                onChange={(nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setLimit(nextPageSize);
                }}
              />
            </div>
          )}
        </>
      )}

      <EventFormModal
        open={formOpen}
        initial={editing}
        loading={isCreating || isUpdating}
        onCancel={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete ${deleteFlow.target?.title}?`}
        description="This permanently removes the event and its media from Hubology. This can't be undone."
        confirmLabel="Delete event"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}

function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
}: {
  event: ApiEvent;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = normalizeEventStatus(event.status);
  const type = normalizeEventType(event.type);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-700/70 bg-linear-to-b from-[#171b3a] to-[#10132c] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-600/35 hover:shadow-[0_24px_50px_-24px_rgba(129,49,240,0.45)]">
      <button type="button" onClick={onView} className="relative text-left">
        <div className="relative h-40 overflow-hidden bg-navy-900">
          <img
            src={getImageUrl(event.coverImage)}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#10132c] via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <StatusTag tone={eventStatusToneMap[status]}>{eventStatusLabelMap[status]}</StatusTag>
            <StatusTag tone={eventTypeToneMap[type]}>{eventTypeLabelMap[type]}</StatusTag>
          </div>
          {event.isFeatured && (
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5b544]/35 bg-[#f5b544]/15 text-[#f5b544]">
              <StarFilled className="text-xs" />
            </div>
          )}
        </div>

        <div className="relative flex flex-1 flex-col p-4 pt-3">
          <h3 className="line-clamp-2 font-display text-base font-semibold text-cloud-100 transition group-hover:text-violet-glow">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-mist-400">{event.description}</p>

          <div className="mt-3 space-y-1.5 text-xs text-mist-500">
            <div className="flex items-start gap-1.5">
              <CalendarOutlined className="mt-0.5 shrink-0 text-violet-glow/80" />
              <span>{formatDateTime(event.eventDate)}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <EnvironmentOutlined className="mt-0.5 shrink-0 text-violet-glow/80" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between border-t border-navy-700/60 px-2 py-1.5">
        <Button
          type="text"
          size="small"
          className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
          icon={<EyeOutlined />}
          onClick={onView}
        >
          Details
        </Button>
        <div className="flex items-center">
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
