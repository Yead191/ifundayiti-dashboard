import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Pagination, Skeleton } from "antd";
import {
  ArrowLeftOutlined,
  FolderFilled,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetFolderByIdQuery,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetGalleriesQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useUpdateGalleryStatusMutation,
  useToggleGalleryFeaturedMutation,
  useDeleteGalleryMutation,
} from "@/redux/features/gallery/galleryApi";
import type {
  GalleryItem,
  GalleryStatus,
} from "@/redux/features/gallery/gallery.types";
import { GalleryFiltersBar } from "./components/GalleryFiltersBar";
import { GalleryCard } from "./components/GalleryCard";
import { GalleryTable } from "./components/GalleryTable";
import { GalleryModal } from "./components/GalleryModal";
import { GalleryLightbox } from "./components/GalleryLightbox";
import { FolderModal } from "./components/FolderModal";
import { DeleteFolderModal } from "./components/DeleteFolderModal";
import { getImageUrl } from "@/lib/getImageUrl";

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

export default function FolderDetailPage() {
  const { folderId = "" } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  // Filters state
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isFeaturedOnly, setIsFeaturedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Folder query
  const {
    data: folderResponse,
    isLoading: isLoadingFolder,
    isError: isFolderError,
  } = useGetFolderByIdQuery(folderId, { skip: !folderId });
  const folder = folderResponse?.data;

  // Photos query filtered by this folder
  const {
    data: galleryResponse,
    isLoading: isLoadingGalleries,
    isFetching: isFetchingGalleries,
    refetch: refetchGalleries,
  } = useGetGalleriesQuery(
    {
      folder: folderId,
      page,
      limit: pageSize,
      searchTerm: debouncedSearch,
      category: categoryFilter,
      status: activeStatus,
      featured: isFeaturedOnly ? true : undefined,
    },
    { skip: !folderId },
  );

  // Folder mutations
  const [updateFolder, { isLoading: isUpdatingFolder }] =
    useUpdateFolderMutation();
  const [deleteFolder, { isLoading: isDeletingFolder }] =
    useDeleteFolderMutation();

  // Gallery item mutations
  const [createGallery, { isLoading: isCreatingPhoto }] =
    useCreateGalleryMutation();
  const [updateGallery, { isLoading: isUpdatingPhoto }] =
    useUpdateGalleryMutation();
  const [updateGalleryStatus] = useUpdateGalleryStatusMutation();
  const [toggleGalleryFeatured] = useToggleGalleryFeaturedMutation();
  const [deleteGallery] = useDeleteGalleryMutation();

  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null,
  );

  // Modals state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null);
  const [editFolderModalOpen, setEditFolderModalOpen] = useState(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);

  const photos = galleryResponse?.data ?? [];
  const pagination = galleryResponse?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: photos.length,
    totalPage: 1,
  };

  // Compute local status counts within this folder
  const folderStats = useMemo(() => {
    let published = 0;
    let draft = 0;
    let archived = 0;
    let featured = 0;

    photos.forEach((p) => {
      if (p.status === "Published") published++;
      if (p.status === "Draft") draft++;
      if (p.status === "Archived") archived++;
      if (p.featured) featured++;
    });

    return {
      totalItems: pagination.total,
      publishedItems: published,
      draftItems: draft,
      archivedItems: archived,
      featuredItems: featured,
    };
  }, [photos, pagination.total]);

  // Handlers
  const handleUpdateFolder = async (formData: FormData) => {
    if (!folder) return;
    try {
      await updateFolder({ id: folder._id, body: formData }).unwrap();
      const updatedName = (formData.get("name") as string) || folder.name;
      toast.success("Folder Updated", {
        description: `"${updatedName}" folder was successfully updated.`,
      });
      setEditFolderModalOpen(false);
    } catch (error) {
      toast.error("Failed to update folder", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!folder) return;
    try {
      await deleteFolder(folder._id).unwrap();
      toast.success("Folder Deleted", {
        description: `"${folder.name}" and all photos inside it were permanently deleted.`,
      });
      setDeleteFolderModalOpen(false);
      navigate("/gallery");
    } catch (error) {
      toast.error("Failed to delete folder", {
        description: getErrorMessage(error),
      });
    }
  };

  // Photo handlers
  const handleCreateOrUpdatePhoto = async (formData: FormData) => {
    try {
      if (editingPhoto) {
        await updateGallery({ id: editingPhoto._id, body: formData }).unwrap();
        toast.success("Photo Updated", {
          description: "Gallery item details have been saved.",
        });
      } else {
        await createGallery(formData).unwrap();
        toast.success("Photo Uploaded", {
          description: `New photo uploaded to "${folder?.name || "this folder"}".`,
        });
      }
      setPhotoModalOpen(false);
      setEditingPhoto(null);
    } catch (error) {
      toast.error(
        editingPhoto ? "Failed to update photo" : "Failed to upload photo",
        {
          description: getErrorMessage(error),
        },
      );
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      setTogglingFeaturedId(id);
      await toggleGalleryFeatured(id).unwrap();
      toast.success("Featured status updated");
    } catch (error) {
      toast.error("Failed to update featured flag", {
        description: getErrorMessage(error),
      });
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleChangeStatus = async (id: string, nextStatus: GalleryStatus) => {
    try {
      await updateGalleryStatus({
        id,
        body: { status: nextStatus },
      }).unwrap();
      toast.success("Status Updated", {
        description: `Photo marked as ${nextStatus}.`,
      });
    } catch (error) {
      toast.error("Failed to change status", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await deleteGallery(id).unwrap();
      toast.success("Photo Removed", {
        description: "Photo was successfully deleted.",
      });
    } catch (error) {
      toast.error("Failed to delete photo", {
        description: getErrorMessage(error),
      });
    }
  };

  if (isLoadingFolder) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 1 }} className="max-w-xs" />
        <GlassCard className="p-6">
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </GlassCard>
      </div>
    );
  }

  if (isFolderError || !folder) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<FolderFilled className="text-5xl text-mist-400" />}
          title="Folder Not Found"
          description="The requested gallery folder does not exist or may have been deleted."
          actionLabel="Back to All Albums"
          onAction={() => navigate("/gallery")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <Link
          to="/gallery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-500 transition hover:text-[#0B3D2E]"
        >
          <ArrowLeftOutlined />
          <span>Back to All Albums</span>
        </Link>
      </div>

      {/* Folder Header Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {folder.image ? (
              <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-md">
                <img
                  src={getImageUrl(folder.image)}
                  alt={folder.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0B3D2E] to-[#062118] text-white shadow-md shadow-[#0B3D2E]/20 ring-1 ring-white/20">
                <FolderFilled className="text-2xl" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/gallery"
                  className="text-xs font-semibold uppercase tracking-wider text-emerald-800 hover:underline"
                >
                  Gallery Albums
                </Link>
                <span className="text-mist-400">/</span>
                <span className="text-xs font-medium text-mist-600">
                  Folder Photos
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 border border-emerald-200/80">
                  <PictureOutlined className="mr-1" />
                  {pagination.total} Photos
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-cloud-100">
                  {folder.name}
                </h1>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setEditFolderModalOpen(true)}
                  className="text-mist-500 hover:text-[#0B3D2E]"
                  title="Edit Folder Details"
                />
              </div>

              <p className="mt-0.5 text-xs text-mist-500">
                Created on {new Date(folder.createdAt).toLocaleDateString()} ·
                Photos in this album are synchronized with the public
                storefront.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteFolderModalOpen(true)}
              className="h-10 rounded-xl font-medium"
            >
              Delete Folder
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Gallery Filters & View Mode Controls Bar */}
      <GalleryFiltersBar
        activeStatus={activeStatus}
        onStatusChange={(status) => {
          setActiveStatus(status);
          setPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(cat) => {
          setCategoryFilter(cat);
          setPage(1);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isFeaturedOnly={isFeaturedOnly}
        onToggleFeaturedOnly={() => {
          setIsFeaturedOnly(!isFeaturedOnly);
          setPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreatePhoto={() => {
          setEditingPhoto(null);
          setPhotoModalOpen(true);
        }}
        onRefresh={refetchGalleries}
        isFetching={isFetchingGalleries}
        stats={folderStats}
      />

      {/* Photos Grid / Table */}
      {isLoadingGalleries || isFetchingGalleries ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <GlassCard key={i} className="p-4 space-y-3">
              <Skeleton.Image active className="h-44! w-full! rounded-xl!" />
              <Skeleton active paragraph={{ rows: 2 }} />
            </GlassCard>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <GlassCard className="p-12">
          <EmptyState
            icon={<PictureOutlined className="text-5xl text-mist-400" />}
            title="No Photos in this Album"
            description={
              searchTerm ||
              categoryFilter !== "all" ||
              activeStatus !== "all" ||
              isFeaturedOnly
                ? "No photos match your current filter selections. Try clearing your filters."
                : "This album folder is currently empty. Upload your first photo to this album."
            }
            actionLabel={
              searchTerm ||
              categoryFilter !== "all" ||
              activeStatus !== "all" ||
              isFeaturedOnly
                ? "Clear Filter Criteria"
                : "Upload Photo to Album"
            }
            onAction={() => {
              if (
                searchTerm ||
                categoryFilter !== "all" ||
                activeStatus !== "all" ||
                isFeaturedOnly
              ) {
                setSearchTerm("");
                setCategoryFilter("all");
                setActiveStatus("all");
                setIsFeaturedOnly(false);
              } else {
                setEditingPhoto(null);
                setPhotoModalOpen(true);
              }
            }}
          />
        </GlassCard>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((item) => (
            <GalleryCard
              key={item._id}
              item={item}
              onPreview={setLightboxPhoto}
              onEdit={(it) => {
                setEditingPhoto(it);
                setPhotoModalOpen(true);
              }}
              onDelete={handleDeletePhoto}
              onToggleFeatured={handleToggleFeatured}
              onChangeStatus={handleChangeStatus}
              isTogglingFeatured={togglingFeaturedId === item._id}
            />
          ))}
        </div>
      ) : (
        <GalleryTable
          items={photos}
          loading={isFetchingGalleries}
          onPreview={setLightboxPhoto}
          onEdit={(it) => {
            setEditingPhoto(it);
            setPhotoModalOpen(true);
          }}
          onDelete={handleDeletePhoto}
          onToggleFeatured={handleToggleFeatured}
          onChangeStatus={handleChangeStatus}
        />
      )}

      {/* Pagination Footer */}
      {pagination && pagination.total > pageSize && (
        <div className="flex justify-center pt-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={pagination.total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) setPageSize(newPageSize);
            }}
            showSizeChanger
            pageSizeOptions={["8", "12", "24", "48"]}
          />
        </div>
      )}

      {/* Photo Upload & Edit Modal */}
      <GalleryModal
        open={photoModalOpen}
        item={editingPhoto}
        defaultFolderId={folderId}
        loading={isCreatingPhoto || isUpdatingPhoto}
        onCancel={() => {
          setPhotoModalOpen(false);
          setEditingPhoto(null);
        }}
        onSubmit={handleCreateOrUpdatePhoto}
      />

      {/* Fullscreen Lightbox Preview */}
      <GalleryLightbox
        open={Boolean(lightboxPhoto)}
        item={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onEdit={(it) => {
          setLightboxPhoto(null);
          setEditingPhoto(it);
          setPhotoModalOpen(true);
        }}
        onToggleFeatured={handleToggleFeatured}
        onChangeStatus={handleChangeStatus}
      />

      {/* Edit Folder Modal */}
      <FolderModal
        open={editFolderModalOpen}
        folder={folder}
        loading={isUpdatingFolder}
        onCancel={() => setEditFolderModalOpen(false)}
        onSubmit={handleUpdateFolder}
      />

      {/* Delete Folder Warning Modal */}
      <DeleteFolderModal
        open={deleteFolderModalOpen}
        folder={folder}
        loading={isDeletingFolder}
        onCancel={() => setDeleteFolderModalOpen(false)}
        onConfirm={handleDeleteFolder}
      />
    </div>
  );
}
