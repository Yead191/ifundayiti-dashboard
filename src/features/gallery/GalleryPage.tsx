import { useState, useMemo, useEffect } from "react";
import { Pagination, Spin } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetGalleriesQuery,
  useGetGalleryStatsQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useUpdateGalleryStatusMutation,
  useToggleGalleryFeaturedMutation,
  useDeleteGalleryMutation,
} from "@/redux/features/gallery/galleryApi";
import type {
  GalleryItem,
  GalleryStatus,
  GalleryStats,
} from "@/redux/features/gallery/gallery.types";
import { GalleryStatsHeader } from "./components/GalleryStatsHeader";
import { GalleryFiltersBar } from "./components/GalleryFiltersBar";
import { GalleryCard } from "./components/GalleryCard";
import { GalleryTable } from "./components/GalleryTable";
import { GalleryModal } from "./components/GalleryModal";
import { GalleryLightbox } from "./components/GalleryLightbox";

export default function GalleryPage() {
  // Filters & View State
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isFeaturedOnly, setIsFeaturedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Main gallery query
  const {
    data: galleryResponse,
    isLoading: isLoadingGalleries,
    isFetching: isFetchingGalleries,
    refetch: refetchGalleries,
  } = useGetGalleriesQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch,
    category: categoryFilter,
    status: activeStatus,
    featured: isFeaturedOnly ? true : undefined,
  });

  // Dedicated server stats query (cached & invalidated on gallery mutations)
  const { data: statsResponse, isLoading: isLoadingStats } =
    useGetGalleryStatsQuery();

  // Mutations
  const [createGallery, { isLoading: isCreating }] = useCreateGalleryMutation();
  const [updateGallery, { isLoading: isUpdating }] = useUpdateGalleryMutation();
  const [updateGalleryStatus] = useUpdateGalleryStatusMutation();
  const [toggleGalleryFeatured] = useToggleGalleryFeaturedMutation();
  const [deleteGallery] = useDeleteGalleryMutation();

  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null,
  );

  // Modals state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Extracted data
  const items = galleryResponse?.data ?? [];
  const pagination = galleryResponse?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: items.length,
    totalPage: 1,
  };

  // Compute stats: use dedicated server stats when available, or fallback
  const stats: GalleryStats = useMemo(() => {
    if (statsResponse?.data) {
      return statsResponse.data;
    }

    let published = 0;
    let draft = 0;
    let archived = 0;
    let featured = 0;

    items.forEach((item) => {
      if (item.status === "Published") published++;
      if (item.status === "Draft") draft++;
      if (item.status === "Archived") archived++;
      if (item.featured) featured++;
    });

    return {
      totalItems: pagination.total,
      publishedItems:
        activeStatus === "Published" ? pagination.total : published,
      draftItems: activeStatus === "Draft" ? pagination.total : draft,
      archivedItems:
        activeStatus === "Archived" ? pagination.total : archived,
      featuredItems: featured,
    };
  }, [statsResponse, items, pagination.total, activeStatus]);

  // Keep lightbox data synchronized with any updates
  useEffect(() => {
    if (lightboxItem) {
      const refreshed = items.find((i) => i._id === lightboxItem._id);
      if (refreshed) {
        setLightboxItem(refreshed);
      }
    }
  }, [items]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleOpenPreview = (item: GalleryItem) => {
    setLightboxItem(item);
  };

  const handleStatusTabChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setPage(1);
  };

  const handleToggleFeaturedOnly = () => {
    setIsFeaturedOnly((prev) => !prev);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleSubmitModal = async (formData: FormData) => {
    try {
      if (editingItem) {
        await updateGallery({
          id: editingItem._id,
          body: formData,
        }).unwrap();
        toast.success("Photo updated successfully", {
          description: "All changes and metadata have been saved.",
        });
      } else {
        await createGallery(formData).unwrap();
        toast.success("Photo uploaded successfully", {
          description: "New image has been added to the community gallery.",
        });
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      toast.error("Failed to save gallery item", {
        description:
          err?.data?.message || err?.message || "An unexpected error occurred.",
      });
    }
  };

  const handleChangeStatus = async (id: string, status: GalleryStatus) => {
    try {
      await updateGalleryStatus({ id, body: { status } }).unwrap();
      toast.success("Status updated", {
        description: `Photo has been transitioned to ${status}.`,
      });
    } catch (err: any) {
      toast.error("Failed to update status", {
        description: err?.data?.message || "An error occurred.",
      });
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      setTogglingFeaturedId(id);
      await toggleGalleryFeatured(id).unwrap();
      toast.success("Spotlight status updated");
    } catch (err: any) {
      toast.error("Failed to toggle spotlight", {
        description: err?.data?.message || "An error occurred.",
      });
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteGallery(id).unwrap();
      toast.success("Photo deleted successfully", {
        description: "Image removed from catalog and server disk.",
      });
      if (lightboxItem?._id === id) {
        setLightboxItem(null);
      }
    } catch (err: any) {
      toast.error("Failed to delete photo", {
        description: err?.data?.message || "An error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Community Gallery & Media
          </h1>
          <p className="mt-1 text-sm text-mist-600">
            Upload, curate, spotlight, and manage visual stories documenting
            grassroots progress and community impact across Haiti.
          </p>
        </div>
      </div>

      {/* KPI Stats Counter Header */}
      <GalleryStatsHeader
        stats={stats}
        loading={isLoadingGalleries && !items.length}
        activeStatusFilter={activeStatus}
        onSelectStatus={handleStatusTabChange}
        isFeaturedOnly={isFeaturedOnly}
        onToggleFeaturedOnly={handleToggleFeaturedOnly}
      />

      {/* Action Bar: Tabs, Search, Category Filter, View Mode Switcher, CTA */}
      <GalleryFiltersBar
        activeStatus={activeStatus}
        onStatusChange={handleStatusTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={handleCategoryChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        stats={stats}
        onCreatePhoto={handleOpenCreateModal}
        onRefresh={refetchGalleries}
        isFetching={isFetchingGalleries}
        isFeaturedOnly={isFeaturedOnly}
        onToggleFeaturedOnly={handleToggleFeaturedOnly}
      />

      {/* Main Content Area */}
      {isLoadingGalleries && !items.length ? (
        <div className="flex h-80 items-center justify-center rounded-2xl border border-navy-700/60 bg-white/40">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<PictureOutlined />}
          title="No gallery photos found"
          description={
            debouncedSearch || categoryFilter !== "all" || activeStatus !== "all" || isFeaturedOnly
              ? "No photos match your current filter and search criteria. Try adjusting or clearing your filters."
              : "No photos have been uploaded to the community gallery yet. Start by uploading the first grassroots story."
          }
          actionLabel="Upload First Photo"
          onAction={handleOpenCreateModal}
        />
      ) : viewMode === "grid" ? (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <GalleryCard
              key={item._id}
              item={item}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteItem}
              onChangeStatus={handleChangeStatus}
              onToggleFeatured={handleToggleFeatured}
              isTogglingFeatured={togglingFeaturedId === item._id}
            />
          ))}
        </div>
      ) : (
        /* Detailed Table View */
        <GalleryTable
          items={items}
          loading={isFetchingGalleries}
          onPreview={handleOpenPreview}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteItem}
          onChangeStatus={handleChangeStatus}
          onToggleFeatured={handleToggleFeatured}
          togglingId={togglingFeaturedId}
        />
      )}

      {/* Pagination Footer */}
      {pagination.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-navy-700/60 bg-white/70 p-4 sm:flex-row backdrop-blur-sm">
          <div className="text-xs text-mist-500 font-medium">
            Showing{" "}
            <span className="font-bold text-cloud-100">
              {Math.min(
                (pagination.page - 1) * pagination.limit + 1,
                pagination.total,
              )}
            </span>{" "}
            to{" "}
            <span className="font-bold text-cloud-100">
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total,
              )}
            </span>{" "}
            of <span className="font-bold text-cloud-100">{pagination.total}</span>{" "}
            photos
          </div>

          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={[12, 24, 48, 96]}
            onChange={handlePageChange}
            className="custom-pagination"
          />
        </div>
      )}

      {/* Create & Edit Modal */}
      <GalleryModal
        open={modalOpen}
        item={editingItem}
        loading={isCreating || isUpdating}
        onCancel={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitModal}
      />

      {/* Lightbox / High-Res Preview Modal */}
      <GalleryLightbox
        open={Boolean(lightboxItem)}
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onEdit={(item) => {
          setLightboxItem(null);
          handleOpenEditModal(item);
        }}
        onToggleFeatured={handleToggleFeatured}
        onChangeStatus={handleChangeStatus}
      />
    </div>
  );
}
