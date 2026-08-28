import { useMemo, useState } from "react";
import { Button, Table, type TableProps } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useIFundAyiti } from "./IFundAyitiContext";
import { periodStatusToneMap, periodStatusLabelMap } from "./statusMaps";
import { PeriodFormModal } from "./components/PeriodFormModal";
import type { ApplicationPeriod, ApplicationPeriodInput } from "./types";

export default function ApplicationPeriodsPage() {
  const { periods, applications, addPeriod, updatePeriod, removePeriod } = useIFundAyiti();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApplicationPeriod | null>(null);

  const deletion = useConfirmDelete<ApplicationPeriod>((period) => {
    removePeriod(period.id);
    toast.message("Period deleted", { description: `${period.title} has been removed.` });
  });

  const appCountByPeriod = useMemo(() => {
    const map: Record<string, number> = {};
    for (const app of applications) map[app.periodId] = (map[app.periodId] ?? 0) + 1;
    return map;
  }, [applications]);

  const openForm = (period: ApplicationPeriod | null) => {
    setEditing(period);
    setFormOpen(true);
  };

  const handleSubmit = (input: ApplicationPeriodInput) => {
    // Business rule: only one period can be Open at a time.
    if (input.status === "Open") {
      const conflict = periods.find((p) => p.status === "Open" && p.id !== editing?.id);
      if (conflict) {
        toast.error("Another period is already open", {
          description: `Close "${conflict.title}" before opening a new cycle.`,
        });
        return;
      }
    }

    if (editing) {
      updatePeriod(editing.id, input);
      toast.success("Period updated", { description: `${input.title} has been saved.` });
    } else {
      addPeriod(input);
      toast.success("Period created", { description: `${input.title} is ready to go.` });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const columns: TableProps<ApplicationPeriod>["columns"] = [
    {
      title: "Period",
      key: "title",
      render: (_, record) => (
        <div className="min-w-0">
          <div className="font-medium text-cloud-100">{record.title}</div>
          <div className="max-w-[320px] truncate text-xs text-mist-400">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Dates",
      key: "dates",
      responsive: ["md"],
      render: (_, record) => (
        <span className="text-mist-400">
          {formatDate(record.startDate)} – {formatDate(record.endDate)}
        </span>
      ),
    },
    {
      title: "Max grant",
      key: "maximumGrantAmount",
      render: (_, record) => (
        <span className="font-medium text-cloud-100">{formatCurrency(record.maximumGrantAmount)}</span>
      ),
    },
    {
      title: "Applications",
      key: "apps",
      responsive: ["lg"],
      render: (_, record) => <span className="text-mist-400">{appCountByPeriod[record.id] ?? 0}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <StatusTag tone={periodStatusToneMap[record.status]}>{periodStatusLabelMap[record.status]}</StatusTag>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 110,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="small" icon={<EditOutlined />} onClick={() => openForm(record)} aria-label="Edit" />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deletion.request(record)}
            aria-label="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageToolbar eyebrow="Application periods" count={periods.length}>
        <Button type="primary" className="btn-gradient !border-0" icon={<PlusOutlined />} onClick={() => openForm(null)}>
          New period
        </Button>
      </PageToolbar>

      <GlassCard flat padded={false}>
        {periods.length === 0 ? (
          <EmptyState
            icon={<CalendarOutlined />}
            title="No application periods yet"
            description="Create a grant cycle so applicants have a period to apply to."
            actionLabel="New period"
            onAction={() => openForm(null)}
          />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={periods} pagination={{ pageSize: 8, hideOnSinglePage: true }} />
        )}
      </GlassCard>

      <PeriodFormModal
        period={editing}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={deletion.isOpen}
        title="Delete application period?"
        description={`This will permanently remove "${deletion.target?.title}". This can't be undone.`}
        loading={deletion.loading}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </div>
  );
}
