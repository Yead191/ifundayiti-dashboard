import { useEffect, useState } from "react";
import { Badge, Button, Select, Table, Tabs, Tooltip, type TableProps } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  FormOutlined,
  MailOutlined,
  BankOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatDate } from "@/lib/utils";
import {
  useCreateInquiryMutation,
  useDeleteInquiryMutation,
  useGetInquiriesQuery,
  useUpdateInquiryMutation,
} from "@/redux/features/inquiries/inquiriesApi";
import {
  INQUIRY_STATUS_OPTIONS,
  PROJECT_BUDGET_OPTIONS,
  type ApiInquiry,
  type CreateInquiryPayload,
  type InquiryStatus,
  type ProjectBudget,
  type UpdateInquiryPayload,
} from "@/redux/features/inquiries/inquiries.types";
import {
  budgetLabelMap,
  inquiryStatusDotClassMap,
  inquiryStatusLabelMap,
} from "./statusMaps";
import { InquiryDetailModal } from "./components/InquiryDetailModal";
import { InquiryFormModal } from "./components/InquiryFormModal";
import { InquiryStatusSelect } from "./components/InquiryStatusSelect";

type StatusTab = InquiryStatus | "all";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: InquiryStatus) {
  const { data } = useGetInquiriesQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

export default function InquiriesPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [budgetFilter, setBudgetFilter] = useState<ProjectBudget | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState<ApiInquiry | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab, budgetFilter]);

  const allCount = useStatusCount();
  const newCount = useStatusCount("NEW");
  const contactedCount = useStatusCount("CONTACTED");
  const meetingCount = useStatusCount("MEETING_SCHEDULED");
  const proposalCount = useStatusCount("PROPOSAL_SENT");
  const completedCount = useStatusCount("COMPLETED");
  const closedCount = useStatusCount("CLOSED");

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    NEW: newCount,
    CONTACTED: contactedCount,
    MEETING_SCHEDULED: meetingCount,
    PROPOSAL_SENT: proposalCount,
    COMPLETED: completedCount,
    CLOSED: closedCount,
  };

  const { data, isFetching } = useGetInquiriesQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? undefined : statusTab,
    budget: budgetFilter || undefined,
  });

  const [updateInquiry, { isLoading: isUpdating }] = useUpdateInquiryMutation();
  const [createInquiry, { isLoading: isCreating }] = useCreateInquiryMutation();
  const [deleteInquiry] = useDeleteInquiryMutation();

  const inquiries = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiInquiry>(async (record) => {
    const promise = deleteInquiry(record._id)
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: `Removing inquiry from ${record.name}…`,
      success: `Inquiry from ${record.name} was deleted.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const applyStatusChange = (inquiry: ApiInquiry, status: InquiryStatus) => {
    const promise = updateInquiry({ id: inquiry._id, body: { status } })
      .unwrap()
      .then((res) => {
        const updated = res.data ?? { ...inquiry, status };
        setViewing((prev) => (prev && prev._id === inquiry._id ? updated : prev));
      });

    toast.promise(promise, {
      loading: `Updating ${inquiry.name}…`,
      success: `Status set to ${inquiryStatusLabelMap[status].toLowerCase()}.`,
      error: (err) => getErrorMessage(err),
    });
  };

  const handleSave = async (id: string, body: UpdateInquiryPayload) => {
    try {
      const res = await updateInquiry({ id, body }).unwrap();
      const updated = res.data;
      if (updated) {
        setViewing(updated);
      }
      toast.success("Inquiry updated", {
        description: "Changes have been saved.",
      });
    } catch (error) {
      toast.error("Couldn't update inquiry", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleCreate = async (payload: CreateInquiryPayload) => {
    try {
      const res = await createInquiry(payload).unwrap();
      toast.success("Inquiry created", {
        description: `${payload.name}'s inquiry has been added to the pipeline.`,
      });
      setFormOpen(false);
      if (res.data) {
        setViewing(res.data);
      }
    } catch (error) {
      toast.error("Couldn't create inquiry", {
        description: getErrorMessage(error),
      });
    }
  };

  const columns: TableProps<ApiInquiry>["columns"] = [
    {
      title: "Contact",
      key: "name",
      render: (_, record) => (
        <button type="button" className="group text-left" onClick={() => setViewing(record)}>
          <div className="font-medium text-cloud-100 transition group-hover:text-violet-glow">
            {record.name}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-mist-500">
            <MailOutlined />
            <span className="max-w-48 truncate">{record.email}</span>
          </div>
          {record.company && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-mist-600">
              <BankOutlined />
              <span className="max-w-48 truncate">{record.company}</span>
            </div>
          )}
        </button>
      ),
    },
    {
      title: "Project",
      key: "projectDescription",
      responsive: ["lg"],
      render: (_, record) => (
        <p className="line-clamp-2 max-w-xs text-sm text-mist-400">{record.projectDescription}</p>
      ),
    },
    {
      title: "Budget",
      key: "budget",
      responsive: ["md"],
      render: (_, record) => (
        <StatusTag tone="gold">{budgetLabelMap[record.budget]}</StatusTag>
      ),
    },
    {
      title: "Submitted",
      key: "createdAt",
      responsive: ["xl"],
      render: (_, record) => (
        <span className="text-mist-400">{formatDate(record.createdAt)}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <InquiryStatusSelect
          value={record.status}
          onChange={(status) => applyStatusChange(record, status)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 96,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="View & edit">
            <Button
              type="text"
              className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
              icon={<EyeOutlined />}
              onClick={() => setViewing(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
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

  const tabItems = [
    { key: "all", label: "All", count: tabCounts.all },
    ...INQUIRY_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: inquiryStatusLabelMap[status],
      count: tabCounts[status],
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <FormOutlined className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">Project inquiries</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Track project leads submitted from the Hubology website — update status, add notes,
              and keep your pipeline moving.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {newCount > 0 && (
            <div className="rounded-2xl border border-info/25 bg-info/10 px-4 py-3 text-sm">
              <div className="font-semibold text-info">{newCount} new</div>
              <div className="text-xs text-mist-400">Awaiting first contact</div>
            </div>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="btn-gradient border-0!"
            onClick={() => setFormOpen(true)}
          >
            Log inquiry
          </Button>
        </div>
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
                        inquiryStatusDotClassMap[tab.key as InquiryStatus]
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

        <div className="flex flex-col gap-2.5 border-t border-navy-700/60 p-4 sm:flex-row sm:flex-wrap sm:items-center md:px-5">
          <SearchInput
            placeholder="Search by name, email, company…"
            value={search}
            onChange={setSearch}
            className="sm:w-72!"
          />
          <Select
            allowClear
            placeholder="Budget range"
            className="sm:w-48!"
            value={budgetFilter || undefined}
            options={PROJECT_BUDGET_OPTIONS.map((budget) => ({
              label: budgetLabelMap[budget],
              value: budget,
            }))}
            onChange={(value) => {
              setBudgetFilter(value ?? "");
              setPage(1);
            }}
          />
          <div className="sm:ml-auto text-xs text-mist-600">
            {pagination?.total ?? 0} inquir{(pagination?.total ?? 0) === 1 ? "y" : "ies"}
          </div>
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && inquiries.length === 0 ? (
          <EmptyState
            icon={<FormOutlined />}
            title="No inquiries in this view"
            description="Try another status tab, clear filters, or log a new inquiry on behalf of a client."
            actionLabel="Log inquiry"
            onAction={() => setFormOpen(true)}
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={inquiries}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} inquiries`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <InquiryFormModal
        open={formOpen}
        loading={isCreating}
        onCancel={() => {
          if (isCreating) return;
          setFormOpen(false);
        }}
        onSubmit={handleCreate}
      />

      <InquiryDetailModal
        inquiry={viewing}
        open={!!viewing}
        loading={isUpdating}
        onClose={() => setViewing(null)}
        onSave={handleSave}
        onDelete={(item) => {
          setViewing(null);
          deleteFlow.request(item);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete inquiry from ${deleteFlow.target?.name}?`}
        description="This permanently removes the inquiry from your pipeline. This can't be undone."
        confirmLabel="Delete inquiry"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
