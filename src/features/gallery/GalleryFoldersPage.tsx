import { useState, useMemo } from "react";
import { Button, Input, Skeleton, Pagination } from "antd";
import {
  FolderAddOutlined,
  SearchOutlined,
  FolderFilled,
  PictureOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
} from "@/redux/features/gallery/galleryApi";
import type { IFolder } from "@/redux/features/gallery/gallery.types";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Queries
  const { data, isLoading, isFetching } = useGetFoldersQuery({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
  });

  // Mutations
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
  const [updateFolder, { isLoading: isUpdating }] = useUpdateFolderMutation();
  const [deleteFolder, { isLoading: isDeleting }] = useDeleteFolderMutation();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<IFolder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<IFolder | null>(null);

  const folders = data?.data ?? [];
  const pagination = data?.pagination;

  // Stats
  const totalPhotosCount = useMemo(() => {
    return folders.reduce((acc, f) => acc + (f.galleryCount ?? 0), 0);
  }, [folders]);

  // Handlers
  const handleCreateFolder = async (formData: FormData) => {
    try {
      await createFolder(formData).unwrap();
      const folderName = (formData.get("name") as string) || "Album Folder";
      toast.success("Album Folder Created", {
        description: `"${folderName}" folder was successfully created.`,
      });
      setCreateModalOpen(false);
    } catch (error) {
      toast.error("Failed to create folder", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleUpdateFolder = async (formData: FormData) => {
    if (!editingFolder) return;
    try {
      await updateFolder({ id: editingFolder._id, body: formData }).unwrap();
      const folderName = (formData.get("name") as string) || editingFolder.name;
      toast.success("Album Folder Updated", {
        description: `"${folderName}" folder was successfully updated.`,
      });
      setEditingFolder(null);
    } catch (error) {
      toast.error("Failed to update folder", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;
    try {
      await deleteFolder(deletingFolder._id).unwrap();
      toast.success("Folder Deleted", {
        description: `"${deletingFolder.name}" and all assigned photos were permanently deleted.`,
      });
      setDeletingFolder(null);
    } catch (error) {
      toast.error("Failed to delete folder", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0B3D2E] to-[#062118] text-white shadow-md shadow-[#0B3D2E]/20 ring-1 ring-white/20">
              <FolderFilled className="text-2xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Media & Public Content
                </span>
                <span className="text-mist-400">/</span>
                <span className="text-xs font-medium text-mist-600">
                  Albums Directory
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-cloud-100">
                Community Gallery Albums
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-mist-600">
                Organize grant initiatives, field projects, and community
                outreach photos into dedicated album folders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="primary"
              icon={<FolderAddOutlined />}
              onClick={() => setCreateModalOpen(true)}
              className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm px-5"
            >
              Create Folder
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* Total Folders */}
        <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mist-500">
              Total Albums
            </span>
            <FolderFilled className="text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cloud-100">
            {pagination?.total ?? folders.length}
          </div>
          <span className="text-[11px] text-mist-500">
            Categorized album folders
          </span>
        </div>

        {/* Total Photos in Albums */}
        <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mist-500">
              Total Photos
            </span>
            <PictureOutlined className="text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B3D2E]">
            {totalPhotosCount}
          </div>
          <span className="text-[11px] text-mist-500">
            Assigned across albums
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-mist-600">
              Browse Folders
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              {pagination?.total ?? folders.length}
            </span>
          </div>

          <Input
            prefix={<SearchOutlined className="text-mist-400" />}
            placeholder="Search folders by name…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            allowClear
            className="h-9 w-full sm:w-72 rounded-xl"
          />
        </div>
      </GlassCard>

      {/* Folders Grid */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <GlassCard key={i} className="p-5 space-y-3">
              <Skeleton.Avatar active shape="square" size="large" />
              <Skeleton active paragraph={{ rows: 2 }} />
            </GlassCard>
          ))}
        </div>
      ) : folders.length === 0 ? (
        <GlassCard className="p-12">
          <EmptyState
            icon={<FolderFilled className="text-5xl text-mist-400" />}
            title="No Gallery Folders Found"
            description={
              searchTerm
                ? `No album folders match "${searchTerm}". Try a different search term.`
                : "No gallery folders have been created yet. Create a folder first to start organizing your gallery photos."
            }
            actionLabel={searchTerm ? "Clear Search" : "Create First Folder"}
            onAction={() => {
              if (searchTerm) {
                setSearchTerm("");
              } else {
                setCreateModalOpen(true);
              }
            }}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder._id}
              folder={folder}
              onEdit={(f) => setEditingFolder(f)}
              onDelete={(f) => setDeletingFolder(f)}
            />
          ))}
        </div>
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

      {/* Create Folder Modal */}
      <FolderModal
        open={createModalOpen}
        folder={null}
        loading={isCreating}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateFolder}
      />

      {/* Rename Folder Modal */}
      <FolderModal
        open={Boolean(editingFolder)}
        folder={editingFolder}
        loading={isUpdating}
        onCancel={() => setEditingFolder(null)}
        onSubmit={handleUpdateFolder}
      />

      {/* Delete Folder Modal with Cascade Warning */}
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
