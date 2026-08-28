import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Image, Skeleton, Tag } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { formatDateTime } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useDeleteEventMutation,
  useGetEventBySlugQuery,
  useUpdateEventMutation,
} from "@/redux/features/events/eventsApi";
import { buildEventFormData } from "@/redux/features/events/buildEventFormData";
import type { ApiEvent, EventFormPayload } from "@/redux/features/events/events.types";
import {
  eventStatusLabelMap,
  eventStatusToneMap,
  eventTypeLabelMap,
  eventTypeToneMap,
  normalizeEventStatus,
  normalizeEventType,
} from "./statusMaps";
import { EventFormModal } from "./components/EventFormModal";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function EventDetailPage() {
  const { eventSlug = "" } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetEventBySlugQuery(eventSlug, {
    skip: !eventSlug,
  });
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [formOpen, setFormOpen] = useState(false);

  const event = data?.data;
  const status = normalizeEventStatus(event?.status);
  const type = normalizeEventType(event?.type);

  const deleteFlow = useConfirmDelete<ApiEvent>(async (record) => {
    const promise = deleteEvent(record._id)
      .unwrap()
      .then(() => navigate("/events"));

    toast.promise(promise, {
      loading: `Deleting ${record.title}…`,
      success: `${record.title} was deleted.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const handleSubmit = async (payload: EventFormPayload) => {
    if (!event) return;
    try {
      await updateEvent({ id: event._id, body: buildEventFormData(payload) }).unwrap();
      toast.success("Event updated", { description: `${payload.title} has been saved.` });
      setFormOpen(false);
    } catch (error) {
      toast.error("Couldn't update event", { description: getErrorMessage(error) });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 1 }} className="mb-6 max-w-xs" />
        <GlassCard flat>
          <Skeleton.Image active className="mb-6! h-56! w-full!" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </GlassCard>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div>
        <Link
          to="/events"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
        >
          <ArrowLeftOutlined />
          Back to events
        </Link>
        <GlassCard flat>
          <EmptyState
            icon={<CalendarOutlined />}
            title="Event not found"
            description="This event may have been removed, or the link is invalid."
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/events"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
      >
        <ArrowLeftOutlined />
        Back to events
      </Link>

      <div className="aurora-field glass-panel mb-6 overflow-hidden">
        <div className="relative h-52 w-full overflow-hidden md:h-64">
          <img
            src={getImageUrl(event.coverImage)}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0c0f24] via-[#0c0f24]/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusTag tone={eventStatusToneMap[status]}>{eventStatusLabelMap[status]}</StatusTag>
              <StatusTag tone={eventTypeToneMap[type]}>{eventTypeLabelMap[type]}</StatusTag>
              {event.isFeatured && (
                <StatusTag tone="gold" icon={<StarFilled />}>
                  Featured
                </StatusTag>
              )}
            </div>
            <h2 className="font-display text-2xl font-semibold text-cloud-100 md:text-3xl">
              {event.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-mist-500">{event.slug}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-navy-700/60 px-6 py-4 md:px-7">
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="btn-gradient border-0!"
            onClick={() => setFormOpen(true)}
          >
            Edit event
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => deleteFlow.request(event)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard flat className="lg:col-span-2">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
            About
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-300">
            {event.description}
          </p>

          {(event.tags?.length ?? 0) > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {event.tags.map((tag) => (
                <Tag
                  key={tag}
                  className="m-0! border-violet-600/30! bg-violet-600/15! text-violet-glow!"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          {(event.images?.length ?? 0) > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
                Gallery
              </h3>
              <Image.PreviewGroup>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {event.images.map((src) => (
                    <Image
                      key={src}
                      src={getImageUrl(src)}
                      alt=""
                      className="rounded-xl object-cover"
                      rootClassName="overflow-hidden rounded-xl border border-navy-700/60"
                      height={120}
                      width="100%"
                      style={{ objectFit: "cover" }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}
        </GlassCard>

        <div className="space-y-4">
          <GlassCard flat>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
              Schedule & place
            </h3>
            <div className="space-y-3 text-sm">
              <DetailRow
                icon={<CalendarOutlined />}
                label="Starts"
                value={formatDateTime(event.eventDate)}
              />
              <DetailRow
                icon={<CalendarOutlined />}
                label="Ends"
                value={formatDateTime(event.endDate)}
              />
              <DetailRow
                icon={<EnvironmentOutlined />}
                label="Location"
                value={event.location}
              />
            </div>
          </GlassCard>

          <GlassCard flat>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
              Organization
            </h3>
            <div className="space-y-3 text-sm">
              <DetailRow
                icon={<TeamOutlined />}
                label="Name"
                value={event.organization?.name || "—"}
              />
              <DetailRow
                icon={<TeamOutlined />}
                label="Designation"
                value={event.organization?.designation || "—"}
              />
              <DetailRow
                icon={<MailOutlined />}
                label="Email"
                value={event.organization?.email || "—"}
              />
            </div>
          </GlassCard>
        </div>
      </div>

      <EventFormModal
        open={formOpen}
        initial={event}
        loading={isUpdating}
        onCancel={() => {
          if (isUpdating) return;
          setFormOpen(false);
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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/15 text-violet-glow">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-mist-600">{label}</div>
        <div className="text-cloud-100">{value}</div>
      </div>
    </div>
  );
}
