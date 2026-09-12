import { useState } from "react";
import { Modal, Tag, Button, Tooltip, Popconfirm } from "antd";
import {
  CloseOutlined,
  FullscreenOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  FolderFilled,
  CopyOutlined,
  CheckOutlined,
  PictureOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { toFileUrl } from "@/config";
import type { IGallery, IFolder } from "@/redux/features/gallery/gallery.types";
import { formatGalleryDate } from "../galleryHelpers";

interface GalleryLightboxProps {
  open: boolean;
  item: IGallery | null;
  folder?: IFolder | null;
  onClose: () => void;
  onEditCaption?: (item: IGallery) => void;
  onDelete?: (id: string) => void;
}

export function GalleryLightbox({
  open,
  item,
  folder,
  onClose,
  onEditCaption,
  onDelete,
}: GalleryLightboxProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const imageUrl = toFileUrl(item.image);

  const handleCopyLink = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    toast.success("Image link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1080}
      centered
      destroyOnClose
      closeIcon={null}
      styles={{
        container: {
          padding: 0,
          borderRadius: "24px",
          overflow: "hidden",
          backgroundColor: "#0B110E",
          boxShadow:
            "0 30px 70px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        },
        body: { padding: 0 },
        mask: {
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(5, 12, 9, 0.8)",
        },
      }}
      className="p-0 overflow-hidden"
    >
      <div className="relative flex flex-col lg:flex-row min-h-125 max-h-[90vh] overflow-hidden bg-[#0B110E]">
        {/* Left Side: Photo Theater Canvas */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-radial from-[#15231c] via-[#0c1410] to-[#060a08] min-h-95 lg:min-h-145 overflow-hidden select-none">
          {/* Subtle Ambient Aurora Glow */}
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#0B3D2E]/25 blur-3xl" />

          {/* Centered Image */}
          {imageUrl ? (
            <div className="relative z-10 flex max-h-[75vh] w-full items-center justify-center">
              <img
                src={imageUrl}
                alt={item.caption || "Gallery photo"}
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
              <PictureOutlined className="text-3xl text-gray-600" />
              <span>No image available</span>
            </div>
          )}

          {/* Floating Actions on Theater Canvas */}
          {imageUrl && (
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <Tooltip title="Open full resolution in a new tab">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-md"
                  >
                    <FullscreenOutlined />
                    <span>Full Screen</span>
                  </a>
                </Tooltip>

                <Tooltip title="Copy original file URL">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckOutlined className="text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <CopyOutlined />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Editorial Metadata & Actions Inspector */}
        <div className="w-full lg:w-95 shrink-0 flex flex-col justify-between bg-white p-6 sm:p-7 border-t lg:border-t-0 lg:border-l border-gray-150 overflow-y-auto">
          {/* Top Section */}
          <div className="space-y-5">
            {/* Header: Album Tag & Dedicated Close Button */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                {folder ? (
                  <Tag
                    color="green"
                    className="rounded-full font-semibold text-xs px-3 py-1 m-0 border-0 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs max-w-full"
                  >
                    <FolderFilled className="text-emerald-700 text-xs shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </Tag>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Photo Details
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95"
              >
                <CloseOutlined className="text-sm" />
              </button>
            </div>

            {/* Photo Caption Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Caption / Note
                </span>
                {item.caption && onEditCaption && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditCaption(item);
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>

              {item.caption ? (
                <div className="rounded-2xl bg-emerald-50/40 border border-emerald-100/80 p-4 text-sm text-gray-800 leading-relaxed font-medium">
                  {item.caption}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    No caption assigned to this photo yet.
                  </p>
                  {onEditCaption && (
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        onClose();
                        onEditCaption(item);
                      }}
                      className="rounded-lg text-xs font-medium border-emerald-600 text-emerald-800 hover:bg-emerald-50"
                    >
                      Add Caption
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Photo Specifications Card */}
            <div className="rounded-2xl bg-gray-50/80 border border-gray-150 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <CalendarOutlined className="text-gray-400" />
                  <span>Uploaded</span>
                </span>
                <span className="font-semibold text-gray-700">
                  {formatGalleryDate(item.createdAt)}
                </span>
              </div>

              {folder?.category && (
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-gray-150">
                  <span className="text-gray-400">Category</span>
                  <span className="font-semibold text-gray-700">
                    {folder.category}
                  </span>
                </div>
              )}

              {folder?.location && (
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-gray-150">
                  <span className="text-gray-400">Location</span>
                  <span className="font-semibold text-gray-700">
                    {folder.location}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-2.5 border-t border-gray-150">
                <span className="text-gray-400 flex items-center gap-1">
                  <InfoCircleOutlined />
                  <span>Photo ID</span>
                </span>
                <span className="font-mono text-[11px] text-gray-500 truncate max-w-37.5">
                  {item._id}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions: Clean, well-spaced & unclipped */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              {onEditCaption && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    onClose();
                    onEditCaption(item);
                  }}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold border-gray-200 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
                >
                  Edit Caption
                </Button>
              )}

              <Button
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopyLink}
                className="h-10 rounded-xl text-xs font-semibold px-4 border-gray-200 hover:border-gray-400"
              >
                {copied ? "Copied" : "Copy Link"}
              </Button>
            </div>

            {onDelete && (
              <Popconfirm
                title="Delete this photo?"
                description="This photo will be permanently deleted from database and storage."
                onConfirm={() => {
                  onDelete(item._id);
                  onClose();
                }}
                okText="Delete Photo"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  className="w-full h-10 rounded-xl text-xs font-semibold border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100"
                >
                  Delete Photo Permanently
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
