import { Modal, Tag, Button, Tooltip, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  CloseOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  StarFilled,
  StarOutlined,
  EditOutlined,
  FullscreenOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { toFileUrl } from "@/config";
import type {
  GalleryItem,
  GalleryStatus,
} from "@/redux/features/gallery/gallery.types";
import {
  GALLERY_CATEGORY_CONFIG,
  GALLERY_STATUS_CONFIG,
  formatGalleryDate,
} from "../galleryHelpers";

interface GalleryLightboxProps {
  open: boolean;
  item: GalleryItem | null;
  onClose: () => void;
  onEdit: (item: GalleryItem) => void;
  onToggleFeatured: (id: string) => void;
  onChangeStatus: (id: string, status: GalleryStatus) => void;
}

export function GalleryLightbox({
  open,
  item,
  onClose,
  onEdit,
  onToggleFeatured,
  onChangeStatus,
}: GalleryLightboxProps) {
  if (!item) return null;

  const imageUrl = toFileUrl(item.image);
  const isFeatured = Boolean(item.featured);
  const categoryConfig = GALLERY_CATEGORY_CONFIG[item.category] || {
    label: item.category,
    color: "default",
  };
  const statusConfig = GALLERY_STATUS_CONFIG[item.status] || {
    label: item.status,
    color: "default",
  };

  const statusMenuItems: MenuProps["items"] = [
    {
      key: "Published",
      label: "Mark as Published",
      icon: <CheckOutlined className="text-emerald-500" />,
      disabled: item.status === "Published",
      onClick: () => onChangeStatus(item._id, "Published"),
    },
    {
      key: "Draft",
      label: "Move to Draft",
      icon: <ClockCircleOutlined className="text-amber-500" />,
      disabled: item.status === "Draft",
      onClick: () => onChangeStatus(item._id, "Draft"),
    },
    {
      key: "Archived",
      label: "Archive Photo",
      icon: <InboxOutlined className="text-slate-400" />,
      disabled: item.status === "Archived",
      onClick: () => onChangeStatus(item._id, "Archived"),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      closeIcon={null}
      styles={{ body: { padding: 0 } }}
      className="custom-lightbox-modal overflow-hidden rounded-3xl"
    >
      <div className="relative flex flex-col lg:flex-row overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-4 right-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-navy-900/90 text-mist-600 shadow-sm transition-all hover:bg-navy-700 hover:text-cloud-100"
        >
          <CloseOutlined className="text-sm" />
        </button>

        {/* Left Side: High-Resolution Photo Display */}
        <div className="relative flex-1 flex items-center justify-center bg-neutral-950 p-6 min-h-[350px] lg:min-h-[540px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <div className="text-mist-500 text-sm">No image available</div>
          )}

          {/* Direct link to original file */}
          {imageUrl && (
            <Tooltip title="Open full resolution in new tab">
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white/95 backdrop-blur-md transition-colors hover:bg-black/90"
              >
                <FullscreenOutlined />
                <span>Original</span>
              </a>
            </Tooltip>
          )}
        </div>

        {/* Right Side: Metadata & Story Panel */}
        <div className="w-full lg:w-96 flex flex-col justify-between p-6 sm:p-7 bg-white border-t lg:border-t-0 lg:border-l border-navy-700/80">
          <div className="space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Tag
                color={categoryConfig.color}
                className="rounded-full font-semibold text-xs px-2.5 py-0.5 m-0"
              >
                {categoryConfig.label}
              </Tag>

              <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]}>
                <button
                  type="button"
                  className="cursor-pointer inline-flex items-center gap-1 transition-opacity hover:opacity-85"
                >
                  <Tag
                    color={statusConfig.color}
                    className="rounded-full font-semibold text-xs px-2.5 py-0.5 m-0 border-0 flex items-center gap-1"
                  >
                    <span>{statusConfig.label}</span>
                    <MoreOutlined className="text-[10px]" />
                  </Tag>
                </button>
              </Dropdown>

              {isFeatured && (
                <Tag
                  color="gold"
                  className="rounded-full font-bold text-xs px-2.5 py-0.5 m-0 border-0 flex items-center gap-1"
                >
                  <StarFilled className="text-amber-500 text-[10px]" />
                  <span>Spotlight</span>
                </Tag>
              )}
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl font-bold leading-tight text-[#0B3D2E]">
              {item.title}
            </h2>

            {/* Location & Capture Date */}
            <div className="space-y-2 text-xs">
              {item.location && (
                <div className="flex items-center gap-2 text-mist-600 font-medium">
                  <EnvironmentOutlined className="text-emerald-600 text-sm shrink-0" />
                  <span className="text-cloud-100 font-semibold">{item.location}</span>
                </div>
              )}
              {item.date && (
                <div className="flex items-center gap-2 text-mist-600 font-medium">
                  <CalendarOutlined className="text-mist-500 text-sm shrink-0" />
                  <span>Captured on {formatGalleryDate(item.date)}</span>
                </div>
              )}
            </div>

            {/* Description / Story Note */}
            <div className="rounded-2xl border border-navy-700/80 bg-navy-950/40 p-4 text-xs">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-mist-600">
                Context / Field Note
              </div>
              <p className="text-xs leading-relaxed text-cloud-100 whitespace-pre-wrap">
                {item.description || "No description provided for this photo."}
              </p>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-navy-700/60">
            <Button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              icon={<EditOutlined />}
              className="w-full rounded-xl border-navy-700/80 bg-white py-2 font-semibold text-cloud-100 shadow-xs hover:border-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Edit Photo Details
            </Button>

            <Button
              onClick={() => onToggleFeatured(item._id)}
              icon={
                isFeatured ? (
                  <StarFilled className="text-amber-500" />
                ) : (
                  <StarOutlined />
                )
              }
              className={`w-full rounded-xl border font-semibold shadow-xs transition-colors ${
                isFeatured
                  ? "border-amber-400/80 bg-amber-50 text-amber-800 hover:border-amber-500"
                  : "border-navy-700/80 bg-white text-cloud-100 hover:border-amber-400"
              }`}
            >
              {isFeatured ? "Remove from Spotlight" : "Feature in Spotlight"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
