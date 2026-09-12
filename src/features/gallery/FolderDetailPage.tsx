import { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Pagination,
  Skeleton,
  Input,
  Checkbox,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  FolderFilled,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  SearchOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  StarFilled,
  ReloadOutlined,
  CheckCircleFilled,
  MinusCircleFilled,
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
  useDeleteGalleryMutation,
  useDeleteMultipleGalleriesMutation,
} from "@/redux/features/gallery/galleryApi";
import type {
  IGallery,
} from "@/redux/features/gallery/gallery.types";
import { FolderModal } from "./components/FolderModal";
import { DeleteFolderModal } from "./components/DeleteFolderModal";
import { UploadPhotosModal } from "./components/UploadPhotosModal";
import { EditPhotoCaptionModal } from "./components/EditPhotoCaptionModal";
import { GalleryLightbox } from "./components/GalleryLightbox";
import { getImageUrl } from "@/lib/getImageUrl";
import { toFileUrl } from "@/config";
import { formatDate } from "@/lib/utils";
import {
  GALLERY_CATEGORY_CONFIG,
  GALLERY_STATUS_CONFIG,
} from "./galleryHelpers";

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
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [searchTerm, setSearchTerm] = useState("");

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editFolderModalOpen, setEditFolderModalOpen] = useState(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<IGallery | null>(null);
  const [editingCaptionPhoto, setEditingCaptionPhoto] = useState<IGallery | null>(null);

  // Queries
  const {
    data: folderResponse,
    isLoading: isLoadingFolder,
    refetch: refetchFolder,
  } = useGetFolderByIdQuery(folderId!, {
    skip: !folderId,
  });
  const folder = folderResponse?.data;

  const {
    data: galleryResponse,
    isLoading: isLoadingPhotos,
    isFetching: isFetchingPhotos,
    refetch: refetchPhotos,
  } = useGetGalleriesQuery(
    {
      folder: folderId,
      searchTerm: searchTerm.trim() || undefined,
      page,
      limit: pageSize,
      sort: "-createdAt",
    },
    { skip: !folderId },
  );

  // Mutations
  const [updateFolder, { isLoading: isUpdatingFolder }] = useUpdateFolderMutation();
  const [deleteFolder, { isLoading: isDeletingFolder }] = useDeleteFolderMutation();
  const [createGallery, { isLoading: isUploadingPhotos }] = useCreateGalleryMutation();
  const [updateGallery, { isLoading: isUpdatingCaption }] = useUpdateGalleryMutation();
  const [deleteGallery] = useDeleteGalleryMutation();
  const [deleteMultipleGalleries, { isLoading: isDeletingMultiple }] =
    useDeleteMultipleGalleriesMutation();

  const photos = galleryResponse?.data ?? [];
  const pagination = galleryResponse?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: photos.length,
    totalPage: 1,
  };

  // Handlers for Album metadata
  const handleUpdateFolder = async (formData: FormData) => {
    if (!folder) return;
    try {
      await updateFolder({ id: folder._id, body: formData }).unwrap();
      const updatedName = (formData.get("name") as string) || folder.name;
      toast.success("Album Details Updated", {
        description: `"${updatedName}" was successfully updated.`,
      });
      setEditFolderModalOpen(false);
    } catch (error) {
      toast.error("Failed to update album", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!folder) return;
    try {
      await deleteFolder(folder._id).unwrap();
      toast.success("Album Deleted", {
        description: `"${folder.name}", cover, and all photos were permanently deleted.`,
      });
      setDeleteFolderModalOpen(false);
      navigate("/gallery", { replace: true });
    } catch (error) {
      toast.error("Failed to delete album", {
        description: getErrorMessage(error),
      });
    }
  };

  // Handlers for Photos
  const handleUploadPhotos = async (formData: FormData) => {
    try {
      await createGallery(formData).unwrap();
      toast.success("Photos Uploaded Successfully", {
        description: "Your photos were added to this album.",
      });
      setUploadModalOpen(false);
    } catch (error) {
      toast.error("Failed to upload photos", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleUpdateCaption = async (id: string, caption: string) => {
    try {
      await updateGallery({ id, body: { caption } }).unwrap();
      toast.success("Caption updated");
      setEditingCaptionPhoto(null);
    } catch (error) {
      toast.error("Failed to update caption", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteSinglePhoto = async (id: string) => {
    try {
      await deleteGallery(id).unwrap();
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      toast.success("Photo deleted successfully");
    } catch (error) {
      toast.error("Failed to delete photo", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteSelectedPhotos = async () => {
    if (selectedIds.length === 0) return;
    try {
      await deleteMultipleGalleries({ ids: selectedIds }).unwrap();
      toast.success(`Deleted ${selectedIds.length} photos successfully`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("Failed to delete selected photos", {
        description: getErrorMessage(error),
      });
    }
  };

  // Multi-select toggles
  const handleToggleSelectPhoto = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(photos.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const isAllSelected =
    photos.length > 0 && photos.every((p) => selectedIds.includes(p._id));
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < photos.length;

  // Category & Status Config
  const categoryConfig = folder?.category
    ? GALLERY_CATEGORY_CONFIG[folder.category as keyof typeof GALLERY_CATEGORY_CONFIG]
    : null;

  const statusConfig = folder
    ? GALLERY_STATUS_CONFIG[folder.status] || {
        label: folder.status,
        bg: "bg-emerald-500/10",
        text: "text-emerald-700",
        border: "border-emerald-500/30",
      }
    : null;

  if (isLoadingFolder) {
    return (
      <div className="space-y-6 pb-12">
        <GlassCard className="p-6">
          <Skeleton active avatar paragraph={{ rows: 3 }} />
        </GlassCard>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton.Image key={i} className="w-full! h-36! rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="space-y-6 pb-12">
        <GlassCard className="p-10 text-center">
          <EmptyState
            icon={<FolderFilled className="text-4xl text-[#0B3D2E]" />}
            title="Album Not Found"
            description="The photo album you are looking for does not exist or has been removed."
            actionLabel="Return to Albums Directory"
            onAction={() => navigate("/gallery")}
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            to="/gallery"
            className="text-mist-600 hover:text-[#0B3D2E] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeftOutlined className="text-[10px]" />
            <span>Albums Directory</span>
          </Link>
          <span className="text-mist-400">/</span>
          <span className="text-cloud-100 truncate max-w-xs">{folder.name}</span>
        </div>

        <Button
          onClick={() => {
            refetchFolder();
            refetchPhotos();
          }}
          type="text"
          size="small"
          icon={<ReloadOutlined className={isFetchingPhotos ? "animate-spin" : ""} />}
          className="text-mist-600 hover:text-[#0B3D2E]"
          title="Refresh Photos"
        />
      </div>

      {/* Album Header Banner Card */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            {/* Cover image thumbnail or fallback folder icon */}
            {folder.image ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-md">
                <img
                  src={getImageUrl(folder.image)}
                  alt={folder.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0B3D2E] to-[#062118] text-white shadow-md shadow-[#0B3D2E]/20 ring-1 ring-white/20">
                <FolderFilled className="text-3xl" />
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                {categoryConfig && (
                  <Tag
                    bordered={false}
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold m-0 ${categoryConfig.bg} ${categoryConfig.text} border ${categoryConfig.border}`}
                  >
                    {categoryConfig.label}
                  </Tag>
                )}

                {statusConfig && (
                  <Tag
                    bordered={false}
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold m-0 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}
                  >
                    {folder.status === "Published" ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircleFilled className="text-[10px]" />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <MinusCircleFilled className="text-[10px]" />
                        <span>{folder.status}</span>
                      </span>
                    )}
                  </Tag>
                )}

                {folder.featured && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    <StarFilled className="text-amber-500 text-xs" />
                    <span>Spotlight</span>
                  </span>
                )}

                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 border border-emerald-200/80">
                  <PictureOutlined className="mr-1" />
                  {pagination.total} Photos
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cloud-100 font-display">
                {folder.name}
              </h1>

              {/* Description / Field Narrative */}
              {folder.description && (
                <p className="text-xs sm:text-sm text-mist-600 max-w-3xl leading-relaxed">
                  {folder.description}
                </p>
              )}

              {/* Meta details: location and date */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-mist-500 pt-1">
                {folder.location && (
                  <span className="flex items-center gap-1.5 text-mist-600 font-medium">
                    <EnvironmentOutlined className="text-emerald-700" />
                    <span>{folder.location}</span>
                  </span>
                )}

                {folder.date && (
                  <span className="flex items-center gap-1.5">
                    <CalendarOutlined className="text-mist-400" />
                    <span>Event Date: {formatDate(folder.date)}</span>
                  </span>
                )}

                <span>·</span>

                <span>Created on {formatDate(folder.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <Button
              onClick={() => setEditFolderModalOpen(true)}
              icon={<EditOutlined />}
              className="h-10 rounded-xl px-4 font-medium border-gray-200 hover:border-[#0B3D2E]"
            >
              Edit Album Details
            </Button>

            <Button
              danger
              onClick={() => setDeleteFolderModalOpen(true)}
              icon={<DeleteOutlined />}
              className="h-10 rounded-xl px-4 font-medium border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            >
              Delete Album
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setUploadModalOpen(true)}
              className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold px-5 shadow-sm border-0"
            >
              Upload Photos
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Photos Controls Toolbar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Multi-select check all bar */}
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => handleSelectAll(e.target.checked)}
              disabled={photos.length === 0}
            >
              <span className="text-xs font-bold text-gray-700 select-none">
                Select All ({photos.length})
              </span>
            </Checkbox>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <span className="text-xs font-semibold text-emerald-800">
                  {selectedIds.length} selected
                </span>

                <Popconfirm
                  title={`Delete ${selectedIds.length} Selected Photos?`}
                  description="These photos will be permanently removed from disk storage and database."
                  onConfirm={handleDeleteSelectedPhotos}
                  okText="Delete Selected"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: isDeletingMultiple }}
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    className="rounded-lg text-xs"
                  >
                    Delete Selected
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>

          {/* Search inside this album */}
          <div className="relative w-full sm:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search photos by caption..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-9 rounded-xl"
            />
          </div>
        </div>
      </GlassCard>

      {/* Photos Grid */}
      {isLoadingPhotos ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton.Image key={i} className="w-full! h-44! rounded-2xl" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <EmptyState
            icon={<PictureOutlined className="text-4xl text-[#0B3D2E]" />}
            title={searchTerm ? "No Matching Photos Found" : "This Album is Empty"}
            description={
              searchTerm
                ? "No photos match your caption search keyword. Try clearing the search bar."
                : "No photos have been uploaded to this album yet. Upload pictures to build your visual story."
            }
            actionLabel={searchTerm ? "Clear Search" : "Upload Photos to Album"}
            onAction={searchTerm ? () => setSearchTerm("") : () => setUploadModalOpen(true)}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {photos.map((photo) => {
            const isSelected = selectedIds.includes(photo._id);
            const photoUrl = toFileUrl(photo.image);

            return (
              <div
                key={photo._id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  isSelected ? "border-[#0B3D2E] ring-2 ring-[#0B3D2E]/20" : "border-gray-200/80 hover:border-[#0B3D2E]/40"
                }`}
              >
                {/* Photo Thumbnail */}
                <div
                  onClick={() => setLightboxPhoto(photo)}
                  className="relative aspect-square w-full overflow-hidden bg-gray-100 cursor-pointer"
                >
                  <img
                    src={photoUrl}
                    alt={photo.caption || "Gallery photo"}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                    loading="lazy"
                  />

                  {/* Dark gradient overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Multi-select checkbox top-left */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelectPhoto(photo._id);
                    }}
                    className="absolute top-2 left-2 z-10"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="bg-white/90 rounded-md p-0.5 shadow-xs"
                    />
                  </div>

                  {/* Quick Action Buttons on Hover */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Tooltip title="View Fullscreen">
                      <button
                        type="button"
                        onClick={() => setLightboxPhoto(photo)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black transition-colors shadow-xs cursor-pointer"
                      >
                        <EyeOutlined className="text-xs" />
                      </button>
                    </Tooltip>

                    <Tooltip title="Edit Caption">
                      <button
                        type="button"
                        onClick={() => setEditingCaptionPhoto(photo)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black transition-colors shadow-xs cursor-pointer"
                      >
                        <EditOutlined className="text-xs" />
                      </button>
                    </Tooltip>

                    <Popconfirm
                      title="Delete this photo?"
                      description="This photo will be permanently deleted."
                      onConfirm={() => handleDeleteSinglePhoto(photo._id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors shadow-xs cursor-pointer"
                        title="Delete photo"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </Popconfirm>
                  </div>
                </div>

                {/* Caption Bar Bottom */}
                <div
                  onClick={() => setEditingCaptionPhoto(photo)}
                  className="p-2.5 bg-white border-t border-gray-100 flex-1 flex flex-col justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <p className="text-xs text-cloud-100 font-medium line-clamp-2 leading-snug">
                    {photo.caption || (
                      <span className="text-mist-400 italic">Add caption...</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
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
            pageSizeOptions={["18", "24", "48", "96"]}
          />
        </div>
      )}

      {/* Upload Photos Modal (Multi-File) */}
      <UploadPhotosModal
        open={uploadModalOpen}
        folderId={folder._id}
        folderName={folder.name}
        loading={isUploadingPhotos}
        onCancel={() => setUploadModalOpen(false)}
        onSubmit={handleUploadPhotos}
      />

      {/* Edit Photo Caption Modal */}
      <EditPhotoCaptionModal
        open={Boolean(editingCaptionPhoto)}
        photo={editingCaptionPhoto}
        loading={isUpdatingCaption}
        onCancel={() => setEditingCaptionPhoto(null)}
        onSubmit={handleUpdateCaption}
      />

      {/* Lightbox Modal */}
      <GalleryLightbox
        open={Boolean(lightboxPhoto)}
        item={lightboxPhoto}
        folder={folder}
        onClose={() => setLightboxPhoto(null)}
        onEditCaption={(it) => {
          setLightboxPhoto(null);
          setEditingCaptionPhoto(it);
        }}
        onDelete={handleDeleteSinglePhoto}
      />

      {/* Edit Album Info Modal */}
      <FolderModal
        open={editFolderModalOpen}
        folder={folder}
        loading={isUpdatingFolder}
        onCancel={() => setEditFolderModalOpen(false)}
        onSubmit={handleUpdateFolder}
      />

      {/* Delete Album Warning Modal */}
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
