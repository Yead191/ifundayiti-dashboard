import { useState, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  Pagination,
  Skeleton,
  Tooltip,
  Popconfirm,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SearchOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { periodStatusToneMap, periodStatusLabelMap } from "@/features/core/statusMaps";
import { StatusTag } from "@/components/ui/StatusTag";
import { PeriodFormModal } from "./components/PeriodFormModal";
import type { TApplicationPeriodStatus, APIPeriod, CreatePeriodPayload, UpdatePeriodPayload } from "@/redux/features/periods/periodsApi";
import {
  useGetPeriodsQuery,
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useDeletePeriodMutation,
} from "@/redux/features/periods/periodsApi";

const STATUS_OPTIONS: { label: string; value: TApplicationPeriodStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Upcoming", value: "Upcoming" },
  { label: "Open", value: "Open" },
  { label: "Review", value: "Review" },
  { label: "Winner Selection", value: "WinnerSelection" },
  { label: "Closed", value: "Closed" },
];

const STATUS_META: Record<
  TApplicationPeriodStatus,
  { gradient: string; ring: string; icon: string }
> = {
  Upcoming: { gradient: "from-sky-50 to-white", ring: "border-sky-200", icon: "🗓️" },
  Open:     { gradient: "from-emerald-50 to-white", ring: "border-emerald-200", icon: "🟢" },
  Review:   { gradient: "from-amber-50 to-white", ring: "border-amber-200", icon: "🔍" },
  WinnerSelection: { gradient: "from-purple-50 to-white", ring: "border-purple-200", icon: "🏆" },
  Closed:   { gradient: "from-slate-50 to-white", ring: "border-slate-200", icon: "🔒" },
};

function PeriodCard({
  period,
  onEdit,
  onDelete,
  isDeleting,
}: {
  period: APIPeriod;
  onEdit: (p: APIPeriod) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const meta = STATUS_META[period.status];
  const daysLeft = Math.ceil(
    (new Date(period.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isActive = period.status === "Open";
  const isPast = period.status === "Closed";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-linear-to-b transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0B3D2E]/8",
        meta.gradient,
        meta.ring
      )}
    >
      {/* Active pulse indicator */}
      {isActive && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Live
          </span>
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 pr-10">
          <div className="min-w-0">
            <h3 className="font-display text-sm font-bold text-[#0B3D2E] leading-snug truncate">
              {period.title}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-mist-400">
              <CalendarOutlined className="text-[10px]" />
              <span>
                {formatDate(period.startDate)} → {formatDate(period.endDate)}
              </span>
            </div>
          </div>
          <StatusTag tone={periodStatusToneMap[period.status]}>
            {periodStatusLabelMap[period.status]}
          </StatusTag>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-navy-700 bg-white/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-mist-400">
              <TrophyOutlined />
              Max Grant
            </div>
            <div className="mt-1 font-display text-lg font-bold text-[#0B3D2E]">
              {formatCurrency(period.maximumGrantAmount)}
            </div>
          </div>
          <div className="rounded-xl border border-navy-700 bg-white/60 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-mist-400">
              <FileTextOutlined />
              Applications
            </div>
            <div className="mt-1 font-display text-lg font-bold text-[#0B3D2E]">
              {period.totalApplicationsSubmitted}
            </div>
          </div>
        </div>

        {/* Days indicator */}
        <div className="flex items-center justify-between">
          {!isPast && (
            <div className="flex items-center gap-1.5 text-xs text-mist-400">
              <ClockCircleOutlined />
              {isActive ? (
                daysLeft > 0 ? (
                  <span>
                    <span className="font-semibold text-[#0B3D2E]">{daysLeft}d</span> remaining
                  </span>
                ) : (
                  <span className="text-danger font-medium">Ended</span>
                )
              ) : (
                <span>Opens {formatDate(period.startDate)}</span>
              )}
            </div>
          )}
          {isPast && (
            <span className="text-xs text-mist-400 italic">Cycle concluded</span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-navy-700 bg-white/50 px-5 py-3">
        <Tooltip title="Edit cycle">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(period)}
            className="rounded-lg border-navy-700 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
          />
        </Tooltip>
        <Tooltip title="Delete cycle">
          <Popconfirm
            title="Delete this grant cycle?"
            description={`"${period.title}" will be permanently removed.`}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(period._id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              className="rounded-lg"
            />
          </Popconfirm>
        </Tooltip>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-navy-700 bg-white p-5">
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
}

export default function ApplicationPeriodsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<TApplicationPeriodStatus | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<APIPeriod | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetPeriodsQuery({
    page,
    limit: 9,
    searchTerm: searchTerm || undefined,
    status: statusFilter || undefined,
  });

  const [createPeriod, { isLoading: isCreating }] = useCreatePeriodMutation();
  const [updatePeriod, { isLoading: isUpdating }] = useUpdatePeriodMutation();
  const [deletePeriod] = useDeletePeriodMutation();

  const periods = data?.data ?? [];
  const pagination = data?.pagination;

  const openForm = useCallback((period: APIPeriod | null) => {
    setEditing(period);
    setFormOpen(true);
  }, []);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleStatusFilter = (val: TApplicationPeriodStatus | "") => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSubmit = async (
    payload: CreatePeriodPayload | UpdatePeriodPayload,
    id?: string
  ): Promise<void> => {
    if (id) {
      await updatePeriod({ id, body: payload as UpdatePeriodPayload }).unwrap();
      toast.success("Cycle updated", {
        description: "The grant cycle has been saved successfully.",
      });
    } else {
      await createPeriod(payload as CreatePeriodPayload).unwrap();
      toast.success("Cycle created", {
        description: "A new grant cycle is ready for applications.",
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePeriod(id).unwrap();
      toast.success("Cycle removed", {
        description: "The grant cycle has been deleted.",
      });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Could not delete this grant cycle.";
      toast.error("Failed to delete", { description: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const totalOpen = periods.filter((p) => p.status === "Open").length;
  const totalActive = periods.filter((p) =>
    ["Open", "Review", "WinnerSelection"].includes(p.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-700 bg-linear-to-r from-[#0B3D2E]/8 via-white to-[#E6D5B8]/20 p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist-400">
              <CalendarOutlined />
              Grant Cycles Management
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-[#0B3D2E]">
              Application Periods
            </h2>
            <p className="mt-1 text-sm text-mist-400">
              Manage grant cycle windows — set timelines, grant caps, and track
              applicant activity.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-[#0B3D2E]">
                {pagination?.total ?? "—"}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                Total
              </div>
            </div>
            <div className="h-8 w-px bg-navy-700" />
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-emerald-600">
                {totalOpen}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                Open
              </div>
            </div>
            <div className="h-8 w-px bg-navy-700" />
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-[#0B3D2E]">
                {totalActive}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">
                Active
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => openForm(null)}
              className="btn-gradient border-0! rounded-xl ml-4"
            >
              New Cycle
            </Button>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#E6D5B8]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 h-44 w-44 rounded-full bg-[#0B3D2E]/4 blur-3xl pointer-events-none" />
      </div>

      {/* Toolbar: search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Search cycles by name..."
            prefix={<SearchOutlined className="text-mist-400" />}
            allowClear
            onClear={() => {
              setSearchInput("");
              setSearchTerm("");
              setPage(1);
            }}
            className="rounded-xl"
            size="large"
          />
          <Button
            onClick={handleSearch}
            icon={<SearchOutlined />}
            size="large"
            className="rounded-xl border-navy-700 hover:border-[#0B3D2E] hover:text-[#0B3D2E] shrink-0"
          >
            Search
          </Button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <FilterOutlined className="text-mist-400" />
          <Select
            value={statusFilter}
            onChange={handleStatusFilter}
            options={STATUS_OPTIONS}
            style={{ width: 180 }}
            size="large"
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-white py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B3D2E]/5 text-[#0B3D2E]">
            <CalendarOutlined className="text-3xl" />
          </div>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-sm text-mist-400">
                {searchTerm || statusFilter
                  ? "No cycles match your search or filter."
                  : "No grant cycles yet. Create one to get started."}
              </span>
            }
          />
          {!searchTerm && !statusFilter && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openForm(null)}
              className="mt-4 btn-gradient border-0! rounded-xl"
            >
              Create First Cycle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {periods.map((period) => (
            <PeriodCard
              key={period._id}
              period={period}
              onEdit={openForm}
              onDelete={handleDelete}
              isDeleting={deletingId === period._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            current={page}
            total={pagination.total}
            pageSize={9}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            showTotal={(total) => (
              <span className="text-xs text-mist-400">
                {total} total cycle{total !== 1 ? "s" : ""}
              </span>
            )}
          />
        </div>
      )}

      {/* Form Modal */}
      <PeriodFormModal
        period={editing}
        open={formOpen}
        loading={isCreating || isUpdating}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
