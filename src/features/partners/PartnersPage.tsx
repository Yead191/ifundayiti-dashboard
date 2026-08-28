import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Pagination, Segmented, Skeleton, Tabs, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ApartmentOutlined,
  GlobalOutlined,
  StarFilled,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusTag } from "@/components/ui/StatusTag";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useChangePartnerStatusMutation,
  useCreatePartnerMutation,
  useDeletePartnerMutation,
  useGetPartnersQuery,
  useUpdatePartnerMutation,
} from "@/redux/features/partners/partnersApi";
import { savePartner } from "./savePartner";
import {
  PARTNER_STATUS,
  PARTNER_STATUS_OPTIONS,
  type ApiPartner,
  type PartnerFormPayload,
  type PartnerStatus,
} from "@/redux/features/partners/partners.types";
import {
  normalizePartnerStatus,
  partnerStatusDotClassMap,
  partnerStatusLabelMap,
  partnerStatusToneMap,
} from "./statusMaps";
import { PartnerFormModal } from "./components/PartnerFormModal";

type StatusTab = PartnerStatus | "all";
type FeaturedFilter = "all" | "featured" | "standard";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: PartnerStatus) {
  const { data } = useGetPartnersQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

export default function PartnersPage() {
  const navigate = useNavigate();
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPartner | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab, featuredFilter]);

  const allCount = useStatusCount();
  const pendingCount = useStatusCount(PARTNER_STATUS.PENDING);
  const approvedCount = useStatusCount(PARTNER_STATUS.APPROVED);
  const rejectedCount = useStatusCount(PARTNER_STATUS.REJECTED);

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    PENDING: pendingCount,
    APPROVED: approvedCount,
    REJECTED: rejectedCount,
  };

  const { data, isFetching, isLoading } = useGetPartnersQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? undefined : statusTab,
    featured: featuredFilter === "all" ? undefined : featuredFilter === "featured",
  });

  const [createPartner, { isLoading: isCreating }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: isUpdating }] = useUpdatePartnerMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangePartnerStatusMutation();
  const [deletePartner] = useDeletePartnerMutation();

  const partners = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiPartner>(async (record) => {
    const promise = deletePartner(record._id).unwrap();

    toast.promise(promise, {
      loading: `Removing ${record.name}…`,
      success: `${record.name} was removed.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: ApiPartner) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: PartnerFormPayload) => {
    try {
      if (editing) {
        await savePartner(payload, {
          partnerId: editing._id,
          createPartner: createPartner,
          updatePartner: updatePartner,
        });
        toast.success("Partner updated", { description: `${payload.name} has been saved.` });
      } else {
        await savePartner(payload, {
          createPartner: createPartner,
          updatePartner: updatePartner,
        });
        toast.success("Partner created", { description: `${payload.name} is on the roster.` });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update partner" : "Couldn't create partner", {
        description: getErrorMessage(error),
      });
    }
  };

  const applyStatus = async (partner: ApiPartner, status: PartnerStatus, successMessage: string) => {
    const promise = changeStatus({ id: partner._id, status }).unwrap();
    toast.promise(promise, {
      loading: `Updating ${partner.name}…`,
      success: successMessage,
      error: (err) => getErrorMessage(err),
    });
    await promise.catch(() => undefined);
  };

  const tabItems = [
    { key: "all" as const, label: "All", count: tabCounts.all },
    ...PARTNER_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: partnerStatusLabelMap[status],
      count: tabCounts[status],
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 overflow-hidden p-6 md:flex-row md:items-center">
        <div className="relative flex items-start gap-4">
          <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-info/15 blur-[60px]" />
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <ApartmentOutlined className="text-lg text-white" />
          </div>
          <div className="relative">
            <h2 className="font-display text-xl font-semibold text-cloud-100">Partner network</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Review website applications, onboard partners manually, and curate featured
              collaborations on Hubology.
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          {pendingCount > 0 && (
            <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm">
              <div className="font-semibold text-warning">{pendingCount} pending</div>
              <div className="text-xs text-mist-400">Applications to review</div>
            </div>
          )}
          <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
            New partner
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
                        partnerStatusDotClassMap[tab.key as PartnerStatus]
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

        <div className="grid grid-cols-1 gap-2.5 border-t border-navy-700/60 p-4 sm:grid-cols-2 xl:grid-cols-3 md:px-5">
          <SearchInput
            placeholder="Search partners, offers, contacts…"
            value={search}
            onChange={setSearch}
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
            <div key={i} className="overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-800/30 p-5">
              <Skeleton active avatar paragraph={{ rows: 4 }} />
            </div>
          ))}
        </div>
      ) : !isFetching && partners.length === 0 ? (
        <EmptyState
          icon={<ApartmentOutlined />}
          title="No partners in this view"
          description="Try another status tab or clear search — or add a partner manually."
          actionLabel="New partner"
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
            {partners.map((partner) => (
              <PartnerCard
                key={partner._id}
                partner={partner}
                statusLoading={isChangingStatus}
                onView={() => navigate(`/partners/${partner._id}`)}
                onEdit={() => openEdit(partner)}
                onDelete={() => deleteFlow.request(partner)}
                onApprove={() =>
                  applyStatus(partner, PARTNER_STATUS.APPROVED, `${partner.name} is now approved.`)
                }
                onReject={() =>
                  applyStatus(partner, PARTNER_STATUS.REJECTED, `${partner.name} was rejected.`)
                }
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

      <PartnerFormModal
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
        title={`Delete ${deleteFlow.target?.name}?`}
        description="This permanently removes the partner profile from Hubology. This can't be undone."
        confirmLabel="Delete partner"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}

function PartnerCard({
  partner,
  statusLoading,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: {
  partner: ApiPartner;
  statusLoading?: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const status = normalizePartnerStatus(partner.status);
  const isPending = status === PARTNER_STATUS.PENDING;
  const previewOffers = partner.offers?.slice(0, 2) ?? [];
  const extraOffers = (partner.offers?.length ?? 0) - previewOffers.length;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-700/70 bg-linear-to-b from-[#171b3a] to-[#10132c] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-600/35 hover:shadow-[0_24px_50px_-24px_rgba(129,49,240,0.45)]">
      <button type="button" onClick={onView} className="relative flex flex-1 flex-col p-5 text-left">
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-violet-600/15 blur-2xl transition group-hover:bg-violet-600/25" />

        <div className="relative mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-linear-to-br from-violet-600/40 to-violet-900/30 p-[1.5px]">
              <Avatar
                src={getImageUrl(partner.image)}
                icon={<ApartmentOutlined />}
                size={48}
                shape="square"
                className="rounded-[10px]! bg-navy-800!"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base font-semibold text-cloud-100 transition group-hover:text-violet-glow">
                {partner.name}
              </div>
              {partner.user && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-mist-500">
                  <UserOutlined className="text-[10px]" />
                  <span className="truncate">{partner.user.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusTag tone={partnerStatusToneMap[status]}>{partnerStatusLabelMap[status]}</StatusTag>
            {partner.featured && (
              <StatusTag tone="gold" icon={<StarFilled />}>
                Featured
              </StatusTag>
            )}
          </div>
        </div>

        <p className="relative line-clamp-2 flex-1 text-sm leading-relaxed text-mist-400">
          {partner.description}
        </p>

        {(previewOffers.length > 0 || partner.website) && (
          <div className="relative mt-4 space-y-2 border-t border-navy-700/50 pt-3">
            {previewOffers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {previewOffers.map((offer) => (
                  <span
                    key={offer}
                    className="rounded-full border border-navy-600/80 bg-navy-800/60 px-2 py-0.5 text-[11px] text-mist-400"
                  >
                    {offer}
                  </span>
                ))}
                {extraOffers > 0 && (
                  <span className="rounded-full border border-navy-600/80 px-2 py-0.5 text-[11px] text-mist-600">
                    +{extraOffers}
                  </span>
                )}
              </div>
            )}
            {partner.website && (
              <div className="flex items-center gap-1.5 text-xs text-mist-500">
                <GlobalOutlined className="text-violet-glow/70" />
                <span className="truncate">{partner.website.replace(/^https?:\/\//, "")}</span>
              </div>
            )}
          </div>
        )}
      </button>

      {isPending && (
        <div className="flex gap-2 border-t border-navy-700/60 px-3 py-2">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            loading={statusLoading}
            className="btn-gradient flex-1 border-0!"
            onClick={onApprove}
          >
            Approve
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            loading={statusLoading}
            className="flex-1"
            onClick={onReject}
          >
            Reject
          </Button>
        </div>
      )}

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
