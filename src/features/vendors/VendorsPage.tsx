import { useEffect, useState } from "react";
import { Avatar, Badge, Button, Select, Table, Tabs, Tooltip, type TableProps } from "antd";
import {
  UserOutlined,
  EyeOutlined,
  DeleteOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CrownOutlined,
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { toFileUrl } from "@/config";
import {
  useChangeProfileVisibilityMutation,
  useChangeVendorStatusMutation,
  useCreateVendorMutation,
  useDeleteVendorMutation,
  useGetVendorsQuery,
} from "@/redux/features/vendors/vendorsApi";
import { buildVendorFormData } from "@/redux/features/vendors/buildVendorFormData";
import {
  VENDOR_AVAILABILITY_OPTIONS,
  VENDOR_HOURLY_RATE_RANGES,
  VENDOR_STATUS_OPTIONS,
  type ApiVendor,
  type CreateVendorPayload,
  type VendorAccountStatus,
} from "@/redux/features/vendors/vendors.types";
import { subscriptionStatusToneMap } from "@/features/users/statusMaps";
import { statusDotClassMap, statusLabelMap } from "./statusMaps";
import { VendorProfileModal } from "./components/VendorProfileModal";
import { VendorStatusSelect } from "./components/VendorStatusSelect";
import { VendorRejectModal } from "./components/VendorRejectModal";
import { CreateVendorModal } from "./components/CreateVendorModal";

type StatusTab = VendorAccountStatus | "all";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: VendorAccountStatus) {
  const { data } = useGetVendorsQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

export default function VendorsPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [availability, setAvailability] = useState<string>("");
  const [hourlyRateRange, setHourlyRateRange] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState<ApiVendor | null>(null);
  const [rejecting, setRejecting] = useState<ApiVendor | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab]);

  const allCount = useStatusCount();
  const pendingCount = useStatusCount("pending");
  const activeCount = useStatusCount("active");
  const blockedCount = useStatusCount("blocked");
  const rejectedCount = useStatusCount("rejected");

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    pending: pendingCount,
    active: activeCount,
    blocked: blockedCount,
    rejected: rejectedCount,
  };

  const { data, isFetching } = useGetVendorsQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? '' : statusTab,
    availability: availability || undefined,
    hourlyRateRange: hourlyRateRange || undefined,
  });

  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeVendorStatusMutation();
  const [changeVisibility, { isLoading: isChangingVisibility }] =
    useChangeProfileVisibilityMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const vendors = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiVendor>(async (record) => {
    try {
      await deleteVendor(record._id).unwrap();
      toast.success("Vendor deleted", { description: `${record.name}'s account has been removed.` });
      setViewing((prev) => (prev?._id === record._id ? null : prev));
    } catch (error) {
      toast.error("Couldn't delete vendor", { description: getErrorMessage(error) });
    }
  });

  const handleCreateVendor = async (payload: CreateVendorPayload) => {
    try {
      await createVendor(buildVendorFormData(payload)).unwrap();
      toast.success("Vendor created", {
        description: `${payload.name} can now sign in with the credentials you set.`,
      });
      setCreateOpen(false);
    } catch (error) {
      toast.error("Couldn't create vendor", { description: getErrorMessage(error) });
    }
  };

  const handleVisibilityChange = (vendor: ApiVendor, isProfileVisible: boolean) => {
    const promise = changeVisibility({
      id: vendor._id,
      body: { isProfileVisible },
    })
      .unwrap()
      .then(() => {
        setViewing((prev) =>
          prev && prev._id === vendor._id
            ? {
                ...prev,
                vendorProfile: {
                  ...prev.vendorProfile,
                  isProfileVisible,
                },
              }
            : prev
        );
      });

    toast.promise(promise, {
      loading: isProfileVisible ? "Making profile visible…" : "Hiding profile…",
      success: isProfileVisible
        ? `${vendor.name} is now visible on the vendor page.`
        : `${vendor.name} is hidden from the vendor page.`,
      error: (err) => getErrorMessage(err),
    });
  };

  const applyStatusChange = (
    vendor: ApiVendor,
    status: VendorAccountStatus,
    rejectionReason?: string
  ) => {
    const promise = changeStatus({
      id: vendor._id,
      body: {
        status,
        ...(status === "rejected" && rejectionReason ? { rejectionReason } : {}),
      },
    })
      .unwrap()
      .then(() => {
        setViewing((prev) =>
          prev && prev._id === vendor._id
            ? { ...prev, status, rejectionReason: rejectionReason ?? prev.rejectionReason }
            : prev
        );
        setRejecting(null);
      });

    toast.promise(promise, {
      loading: `Updating ${vendor.name}…`,
      success: `${vendor.name} is now ${statusLabelMap[status].toLowerCase()}.`,
      error: (err) => getErrorMessage(err),
    });
  };

  const handleStatusChange = (vendor: ApiVendor, status: VendorAccountStatus) => {
    if (status === "rejected") {
      setRejecting(vendor);
      return;
    }
    applyStatusChange(vendor, status);
  };

  const columns: TableProps<ApiVendor>["columns"] = [
    {
      title: "Vendor",
      key: "name",
      render: (_, record) => (
        <button
          type="button"
          className="group flex items-center gap-3.5 text-left"
          onClick={() => setViewing(record)}
        >
          <div className="rounded-xl bg-linear-to-br from-violet-600/40 to-violet-900/30 p-[1.5px] transition group-hover:from-violet-600/70">
            <Avatar
              src={toFileUrl(record.image)}
              icon={<UserOutlined />}
              size={44}
              className="rounded-[10px]!bg-navy-800!"
              shape="square"
            />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-cloud-100 transition group-hover:text-violet-glow">
              {record.name}
            </div>
            <div className="max-w-60 truncate text-xs text-mist-400">
              {record.vendorProfile?.jobTitle || record.role}
              {record.company ? ` · ${record.company}` : ""}
            </div>
          </div>
        </button>
      ),
    },
    {
      title: "Subscription",
      key: "subscription",
      responsive: ["md"],
      render: (_, record) => {
        const sub = record.subscription;
        if (!sub) {
          return <span className="text-mist-600">—</span>;
        }
        return (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusTag tone="gold" icon={<CrownOutlined />}>
                {sub.name}
              </StatusTag>
              <StatusTag tone={subscriptionStatusToneMap[sub.status] ?? "neutral"}>
                {sub.status}
              </StatusTag>
            </div>
            <div className="mt-1 text-xs text-mist-400">
              {formatCurrency(sub?.price?? 0)}
              <span className="text-mist-600">/{sub?.recuring?? ''}</span>
              <span className="mx-1 text-mist-700">·</span>
              ends {formatDate(sub?.end_date?? '')}
            </div>
          </div>
        );
      },
    },
    {
      title: "Rate",
      key: "hourlyRate",
      responsive: ["lg"],
      render: (_, record) => (
        <span className="font-display text-sm font-semibold text-cloud-100">
          {record.vendorProfile?.hourlyRate != null
            ? `${formatCurrency(record.vendorProfile.hourlyRate)}`
            : "—"}
          {record.vendorProfile?.hourlyRate != null && (
            <span className="ml-0.5 text-xs font-normal text-mist-600">/hr</span>
          )}
        </span>
      ),
    },
    {
      title: "Availability",
      key: "availability",
      responsive: ["lg"],
      render: (_, record) =>
        record.vendorProfile?.availability ? (
          <span className="inline-flex items-center gap-1.5 text-mist-300">
            <ClockCircleOutlined className="text-mist-600" />
            {record.vendorProfile.availability}
          </span>
        ) : (
          <span className="text-mist-600">—</span>
        ),
    },
    {
      title: "Joined",
      key: "createdAt",
      responsive: ["xl"],
      render: (_, record) => <span className="text-mist-400">{formatDate(record.createdAt)}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <VendorStatusSelect
          value={record.status}
          onChange={(status) => handleStatusChange(record, status)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 108,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="View profile">
            <Button
              type="text"
              className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
              icon={<EyeOutlined />}
              onClick={() => setViewing(record)}
            />
          </Tooltip>
          <Tooltip title="Delete account">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteFlow.request(record)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: "all", label: "All", count: tabCounts.all, tone: "violet" as const },
    ...VENDOR_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: statusLabelMap[status],
      count: tabCounts[status],
      tone: status,
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <TeamOutlined className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">Vendor directory</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Review pending applications, manage account status, and keep your expert network curated.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {pendingCount > 0 && (
            <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm">
              <div className="font-semibold text-warning">{pendingCount} pending</div>
              <div className="text-xs text-mist-400">Awaiting your review</div>
            </div>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="btn-gradient border-0!"
            onClick={() => setCreateOpen(true)}
          >
            New vendor
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
                        statusDotClassMap[tab.key as VendorAccountStatus]
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
            className="sm:w-64!"
          />
          <Select
            allowClear
            placeholder="Availability"
            className="sm:w-44!"
            value={availability || undefined}
            options={VENDOR_AVAILABILITY_OPTIONS.map((a) => ({ label: a, value: a }))}
            onChange={(value) => {
              setAvailability(value ?? "");
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="Hourly rate"
            className="sm:w-40!"
            value={hourlyRateRange || undefined}
            options={VENDOR_HOURLY_RATE_RANGES.map((r) => ({ label: r.label, value: r.value }))}
            onChange={(value) => {
              setHourlyRateRange(value ?? "");
              setPage(1);
            }}
          />
          <div className="sm:ml-auto text-xs text-mist-600">
            {pagination?.total ?? 0} vendor{(pagination?.total ?? 0) === 1 ? "" : "s"}
          </div>
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && vendors.length === 0 ? (
          <EmptyState
            icon={<UserOutlined />}
            title="No vendors in this view"
            description="Try another status tab or clear your search and filters."
            actionLabel="New vendor"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={vendors}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} vendors`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <CreateVendorModal
        open={createOpen}
        loading={isCreating}
        onCancel={() => {
          if (isCreating) return;
          setCreateOpen(false);
        }}
        onSubmit={handleCreateVendor}
      />

      <VendorProfileModal
        vendor={viewing}
        open={!!viewing}
        updating={isChangingStatus}
        visibilityUpdating={isChangingVisibility}
        onClose={() => setViewing(null)}
        onStatusChange={(status) => {
          if (!viewing) return;
          handleStatusChange(viewing, status);
        }}
        onVisibilityChange={(isProfileVisible) => {
          if (!viewing) return;
          handleVisibilityChange(viewing, isProfileVisible);
        }}
        onDelete={(vendor) => {
          setViewing(null);
          deleteFlow.request(vendor);
        }}
      />

      <VendorRejectModal
        vendor={rejecting}
        open={!!rejecting}
        loading={isChangingStatus}
        onCancel={() => setRejecting(null)}
        onConfirm={(reason) => {
          if (!rejecting) return;
          applyStatusChange(rejecting, "rejected", reason);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete ${deleteFlow.target?.name}?`}
        description="This permanently deletes the vendor account from Hubology. This can't be undone."
        confirmLabel="Delete account"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
