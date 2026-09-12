import { useState, useMemo } from "react";
import {
  Input,
  Select,
  Button,
  Pagination,
  Skeleton,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FolderFilled,
  PictureOutlined,
  CheckCircleOutlined,
  StopOutlined,
  StarFilled,
  ReloadOutlined,
  FilterOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetFoldersQuery,
  useGetFolderStatsQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useUpdateFolderStatusMutation,
  useToggleFolderFeaturedMutation,
  useDeleteFolderMutation,
} from "@/redux/features/gallery/galleryApi";
import {
  GALLERY_CATEGORIES,
  type IFolder,
  type GalleryStatus,
} from "@/redux/features/gallery/gallery.types";
import { FolderCard } from "./components/FolderCard";
import { FolderModal } from "./components/FolderModal";
import { DeleteFolderModal } from "./components/DeleteFolderModal";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return (
      err.data?.message ??
      err.message ??
      "An unexpected error occurred. Please try again."
    );
  }
  return "An unexpected error occurred. Please try again.";
}

export default function GalleryFoldersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined);

  // Queries
  const {
    data: foldersResponse,
    isLoading,
    isFetching,
    refetch: refetchFolders,
  } = useGetFoldersQuery({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    featured: featuredFilter,
    sort: "-featured -createdAt",
  });

  const { data: statsResponse, refetch: refetchStats } = useGetFolderStatsQuery();

  // Mutations
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
  const [updateFolder, { isLoading: isUpdating }] = useUpdateFolderMutation();
  const [updateFolderStatus] = useUpdateFolderStatusMutation();
  const [toggleFolderFeatured, { isLoading: isTogglingFeatured }] =
    useToggleFolderFeaturedMutation();
  const [deleteFolder, { isLoading: isDeleting }] = useDeleteFolderMutation();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<IFolder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<IFolder | null>(null);

  const folders = foldersResponse?.data ?? [];
  const pagination = foldersResponse?.pagination;
  const stats = statsResponse?.data;

  // Fallback metrics if stats query is pending
  const metrics = useMemo(() => {
    if (stats) {
      return {
        totalAlbums: stats.totalFolders ?? 0,
        published: stats.publishedFolders ?? 0,
        draft: stats.draftFolders ?? 0,
        featured: stats.featuredFolders ?? 0,
        totalPhotos: stats.totalImages ?? 0,
      };
    }
    const totalAlbums = pagination?.total ?? folders.length;
    const published = folders.filter((f) => f.status === "Published").length;
    const draft = folders.filter((f) => f.status === "Draft").length;
    const featured = folders.filter((f) => f.featured).length;
    const totalPhotos = folders.reduce((acc, f) => acc + (f.galleryCount ?? 0), 0);
    return { totalAlbums, published, draft, featured, totalPhotos };
  }, [stats, folders, pagination?.total]);

  // Handlers
  const handleCreateFolder = async (formData: FormData) => {
    try {
      await createFolder(formData).unwrap();
      const folderName = (formData.get("name") as string) || "Album";
      toast.success("Photo Album Created", {
        description: `"${folderName}" album was successfully created.`,
      });
      setCreateModalOpen(false);
    } catch (error) {
      toast.error("Failed to create album", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleUpdateFolder = async (formData: FormData) => {
    if (!editingFolder) return;
    try {
      await updateFolder({ id: editingFolder._id, body: formData }).unwrap();
      const folderName = (formData.get("name") as string) || editingFolder.name;
      toast.success("Album Updated", {
        description: `"${folderName}" details were successfully updated.`,
      });
      setEditingFolder(null);
    } catch (error) {
      toast.error("Failed to update album", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleChangeStatus = async (id: string, status: GalleryStatus) => {
    try {
      await updateFolderStatus({ id, body: { status } }).unwrap();
      toast.success(`Album status updated to "${status}"`);
    } catch (error) {
      toast.error("Failed to change album status", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFolderFeatured(id).unwrap();
      toast.success("Spotlight status toggled");
    } catch (error) {
      toast.error("Failed to toggle spotlight", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;
    try {
      await deleteFolder(deletingFolder._id).unwrap();
      toast.success("Album Deleted", {
        description: `"${deletingFolder.name}", its cover, and all assigned photos were permanently deleted.`,
      });
      setDeletingFolder(null);
    } catch (error) {
      toast.error("Failed to delete album", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleRefresh = () => {
    refetchFolders();
    refetchStats();
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    featuredFilter !== undefined;

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setFeaturedFilter(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0B3D2E] to-[#062118] text-white shadow-md shadow-[#0B3D2E]/20 ring-1 ring-white/20">
              <FolderFilled className="text-2xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Media & Storytelling
                </span>
                <span className="text-mist-400">/</span>
                <span className="text-xs font-medium text-mist-600">
                  Albums Directory
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cloud-100 font-display">
                  Gallery Albums
                </h1>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined className={isFetching ? "animate-spin" : ""} />}
                  onClick={handleRefresh}
                  className="text-mist-600 hover:text-[#0B3D2E]"
                  title="Refresh Albums & Stats"
                />
              </div>
              <p className="mt-1 max-w-2xl text-sm text-mist-600 leading-relaxed">
                Organize stories, community projects, and grant ceremonies into categorized photo albums.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold shadow-sm px-5 border-0"
            >
              Create New Album
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {/* Total Albums */}
        <div className="rounded-2xl border border-gray-100 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Albums
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <AppstoreOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-cloud-100 font-display">
            {metrics.totalAlbums}
          </p>
          <span className="mt-0.5 block text-xs text-mist-600">
            Categorized story albums
          </span>
        </div>

        {/* Published Albums */}
        <div className="rounded-2xl border border-emerald-100/80 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Published
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              <CheckCircleOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-display">
            {metrics.published}
          </p>
          <span className="mt-0.5 block text-xs text-emerald-800/80 font-medium">
            Live on public website
          </span>
        </div>

        {/* Draft Albums */}
        <div className="rounded-2xl border border-amber-100/80 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Draft / Hidden
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/50">
              <StopOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700 font-display">
            {metrics.draft}
          </p>
          <span className="mt-0.5 block text-xs text-amber-800/80 font-medium">
            Hidden from public
          </span>
        </div>

        {/* Spotlight Albums */}
        <div className="rounded-2xl border border-amber-100/80 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Spotlight
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <StarFilled />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 font-display">
            {metrics.featured}
          </p>
          <span className="mt-0.5 block text-xs text-mist-600">
            Featured carousels
          </span>
        </div>

        {/* Total Photos */}
        <div className="rounded-2xl border border-gray-100 bg-white/95 p-4.5 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Photos
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B3D2E]/10 text-[#0B3D2E]">
              <PictureOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-cloud-100 font-display">
            {metrics.totalPhotos}
          </p>
          <span className="mt-0.5 block text-xs text-mist-600">
            Across all albums
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 md:max-w-md">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search albums by name, category, location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
              className="h-10 w-44"
              options={[
                { label: "All Categories", value: "all" },
                ...GALLERY_CATEGORIES.map((cat) => ({
                  label: cat,
                  value: cat,
                })),
              ]}
            />

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              className="h-10 w-36"
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Published", value: "Published" },
                { label: "Draft", value: "Draft" },
                { label: "Archived", value: "Archived" },
              ]}
            />

            {/* Featured Only Toggle */}
            <Button
              onClick={() => {
                setFeaturedFilter((prev) => (prev === true ? undefined : true));
                setPage(1);
              }}
              className={`h-10 rounded-xl px-3.5 font-medium flex items-center gap-1.5 transition-colors ${
                featuredFilter === true
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <StarFilled className={featuredFilter === true ? "text-amber-500" : "text-mist-400"} />
              <span className="text-xs">Spotlight Only</span>
            </Button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                className="h-10 rounded-xl text-xs font-medium text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Albums Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <GlassCard key={idx} className="p-5">
              <Skeleton.Image className="w-full! h-40! rounded-2xl mb-4" />
              <Skeleton active paragraph={{ rows: 2 }} />
            </GlassCard>
          ))}
        </div>
      ) : folders.length === 0 ? (
        <GlassCard className="p-10">
          <EmptyState
            icon={<FolderFilled className="text-4xl text-[#0B3D2E]" />}
            title={hasActiveFilters ? "No Matching Albums Found" : "No Photo Albums Yet"}
            description={
              hasActiveFilters
                ? "No albums match your search query or filter criteria. Try resetting your filters."
                : "Create your first photo album to begin uploading and organizing community pictures."
            }
            actionLabel={hasActiveFilters ? "Clear All Filters" : "Create New Album"}
            onAction={hasActiveFilters ? handleClearFilters : () => setCreateModalOpen(true)}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder._id}
              folder={folder}
              onEdit={(f) => setEditingFolder(f)}
              onDelete={(f) => setDeletingFolder(f)}
              onChangeStatus={handleChangeStatus}
              onToggleFeatured={handleToggleFeatured}
              isTogglingFeatured={isTogglingFeatured}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination && pagination.total > pageSize && (
        <div className="flex items-center justify-center pt-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={pagination.total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) setPageSize(newPageSize);
            }}
            showSizeChanger
            pageSizeOptions={["12", "24", "36", "48"]}
          />
        </div>
      )}

      {/* Create Album Modal */}
      <FolderModal
        open={createModalOpen}
        folder={null}
        loading={isCreating}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateFolder}
      />

      {/* Edit Album Modal */}
      <FolderModal
        open={Boolean(editingFolder)}
        folder={editingFolder}
        loading={isUpdating}
        onCancel={() => setEditingFolder(null)}
        onSubmit={handleUpdateFolder}
      />

      {/* Delete Album Modal with Cascade Warning */}
      <DeleteFolderModal
        open={Boolean(deletingFolder)}
        folder={deletingFolder}
        loading={isDeleting}
        onCancel={() => setDeletingFolder(null)}
        onConfirm={handleDeleteFolder}
      />
    </div>
  );
}
