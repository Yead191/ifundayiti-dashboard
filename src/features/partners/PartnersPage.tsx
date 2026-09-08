import { useState, useMemo } from "react";
import { Button, Skeleton, Pagination } from "antd";
import { PlusOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetPartnersQuery,
  useChangePartnerStatusMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
} from "@/redux/features/partners/partnersApi";
import type {
  ApiPartner,
  PartnerStatus,
} from "@/redux/features/partners/partners.types";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";
import { buildPartnerUpdateFormData } from "@/redux/features/partners/buildPartnerFormData";
import { getErrorMessage } from "./partnerHelpers";
import { PartnerMetrics } from "./components/PartnerMetrics";
import { PartnerFilterToolbar } from "./components/PartnerFilterToolbar";
import { PartnerCard } from "./components/PartnerCard";
import { PartnerCreateModal } from "./components/PartnerCreateModal";
import { PartnerStatusModal } from "./components/PartnerStatusModal";

export default function PartnersPage() {
  // Query & Filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [featuredFilter, setFeaturedFilter] = useState<string>("ALL");

  // Query Partners with applied filters
  const { data, isLoading, isFetching } = useGetPartnersQuery({
    page,
    limit,
    searchTerm: searchTerm.trim() || undefined,
    status:
      statusFilter !== "ALL" ? (statusFilter as PartnerStatus) : undefined,
    featured:
      featuredFilter === "FEATURED"
        ? true
        : featuredFilter === "STANDARD"
          ? false
          : undefined,
  });

  // Query for Top Summary Metrics (count all without filters)
  const { data: allPartnersData } = useGetPartnersQuery({
    page: 1,
    limit: 100,
  });

  // Mutations
  const [changeStatus] = useChangePartnerStatusMutation();
  const [updatePartner] = useUpdatePartnerMutation();
  const [deletePartner] = useDeletePartnerMutation();

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusModalTarget, setStatusModalTarget] = useState<ApiPartner | null>(
    null,
  );

  const partners = data?.data || [];
  const pagination = data?.pagination;

  // Compute Metrics from all data
  const metrics = useMemo(() => {
    const list = allPartnersData?.data || [];
    const total = allPartnersData?.pagination?.total ?? list.length;
    const pending = list.filter(
      (p) => p.status === PARTNER_STATUS.PENDING,
    ).length;
    const approved = list.filter(
      (p) => p.status === PARTNER_STATUS.APPROVED,
    ).length;
    const rejected = list.filter(
      (p) => p.status === PARTNER_STATUS.REJECTED,
    ).length;
    const featured = list.filter((p) => Boolean(p.featured)).length;

    return { total, pending, approved, rejected, featured };
  }, [allPartnersData]);

  // Quick Featured Toggle
  const handleToggleFeatured = async (
    partner: ApiPartner,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      const nextFeatured = !partner.featured;
      const formData = buildPartnerUpdateFormData({ featured: nextFeatured });
      await updatePartner({ id: partner._id, body: formData }).unwrap();
      toast.success(
        nextFeatured ? "Marked as Featured" : "Removed from Featured",
        {
          description: nextFeatured
            ? `${partner.name} will now appear in high-priority carousels.`
            : `${partner.name} unstarred from featured placements.`,
        },
      );
    } catch (error) {
      toast.error("Failed to update featured flag", {
        description: getErrorMessage(error),
      });
    }
  };

  // Quick 1-click Approve
  const handleQuickApprove = async (
    partner: ApiPartner,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await changeStatus({
        id: partner._id,
        status: PARTNER_STATUS.APPROVED,
      }).unwrap();
      toast.success("Partner Approved", {
        description: `${partner.name} is now approved and live.`,
      });
    } catch (error) {
      toast.error("Failed to approve partner", {
        description: getErrorMessage(error),
      });
    }
  };

  // Delete Partner
  const handleDeletePartner = async (partner: ApiPartner) => {
    try {
      await deletePartner(partner._id).unwrap();
      toast.success("Partner Deleted", {
        description: `${partner.name} was successfully removed.`,
      });
    } catch (error) {
      toast.error("Failed to delete partner", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setFeaturedFilter("ALL");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0B3D2E] to-[#062118] text-white shadow-md shadow-[#0B3D2E]/20 ring-1 ring-white/20">
              <SafetyCertificateOutlined className="text-2xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Ecosystem & Collaborations
                </span>
                <span className="text-mist-400">/</span>
                <span className="text-xs font-medium text-mist-600">
                  Directory
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-cloud-100">
                Partner Management
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-mist-600">
                Review community partner applications, manage official
                organizational allies, and configure featured homepage
                carousels.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm px-5"
            >
              Add Partner
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Top Metrics Cards */}
      <PartnerMetrics
        metrics={metrics}
        statusFilter={statusFilter}
        featuredFilter={featuredFilter}
        onSelectStatus={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        onSelectFeatured={(featured) => {
          setFeaturedFilter(featured);
          setPage(1);
        }}
      />

      {/* Filter & Search Bar */}
      <PartnerFilterToolbar
        statusFilter={statusFilter}
        featuredFilter={featuredFilter}
        searchTerm={searchTerm}
        onStatusChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        onFeaturedChange={(featured) => {
          setFeaturedFilter(featured);
          setPage(1);
        }}
        onSearchChange={(search) => {
          setSearchTerm(search);
          setPage(1);
        }}
      />

      {/* Partners List Grid */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <GlassCard key={idx} className="p-5 space-y-4">
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </GlassCard>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <GlassCard className="p-12">
          <EmptyState
            icon={
              <SafetyCertificateOutlined className="text-5xl text-mist-400" />
            }
            title="No Partners Found"
            description={
              searchTerm || statusFilter !== "ALL" || featuredFilter !== "ALL"
                ? "No partner organizations match your selected filter criteria. Try resetting the filters."
                : "No partners have been registered yet. Add your first official partner now."
            }
            actionLabel={
              searchTerm || statusFilter !== "ALL" || featuredFilter !== "ALL"
                ? "Clear All Filters"
                : "Add First Partner"
            }
            onAction={() => {
              if (
                searchTerm ||
                statusFilter !== "ALL" ||
                featuredFilter !== "ALL"
              ) {
                handleClearFilters();
              } else {
                setCreateModalOpen(true);
              }
            }}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <PartnerCard
              key={partner._id}
              partner={partner}
              onToggleFeatured={handleToggleFeatured}
              onQuickApprove={handleQuickApprove}
              onOpenStatusModal={(p) => setStatusModalTarget(p)}
              onDelete={handleDeletePartner}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.total > limit && (
        <div className="flex justify-center pt-4">
          <Pagination
            current={page}
            pageSize={limit}
            total={pagination.total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) setLimit(newPageSize);
            }}
            showSizeChanger
            pageSizeOptions={["6", "9", "12", "24"]}
          />
        </div>
      )}

      {/* Partner Direct Create Modal */}
      <PartnerCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Partner Status Review Modal */}
      <PartnerStatusModal
        open={Boolean(statusModalTarget)}
        partner={statusModalTarget}
        onClose={() => setStatusModalTarget(null)}
      />
    </div>
  );
}
