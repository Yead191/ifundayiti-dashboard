import { Tag, Button, Space, Popconfirm, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  EnvironmentOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  StarFilled,
  StarOutlined,
  MoreOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  PictureOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
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

interface GalleryCardProps {
  item: GalleryItem;
  onPreview: (item: GalleryItem) => void;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: GalleryStatus) => void;
  onToggleFeatured: (id: string) => void;
  isTogglingFeatured?: boolean;
}

export function GalleryCard({
  item,
  onPreview,
  onEdit,
  onDelete,
  onChangeStatus,
  onToggleFeatured,
  isTogglingFeatured = false,
}: GalleryCardProps) {
  const isFeatured = Boolean(item.featured);
  const imageUrl = toFileUrl(item.image);
  const categoryConfig = GALLERY_CATEGORY_CONFIG[item.category] || {
    label: item.category,
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/20",
  };
  const statusConfig = GALLERY_STATUS_CONFIG[item.status] || {
    label: item.status,
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/30",
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
    <GlassCard className="group relative flex flex-col justify-between overflow-hidden border border-navy-700/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-xl">
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-navy-900/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-mist-500">
            <PictureOutlined className="text-3xl opacity-40" />
            <span className="text-xs">No image available</span>
          </div>
        )}

        {/* Subtle Dark Gradient Overlay for Badges */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-black/30" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Category Tag */}
          <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border} bg-white/90 shadow-xs`}
          >
            {categoryConfig.label}
          </span>

          {/* Interactive Featured Star Spotlight Toggle */}
          <Tooltip
            title={
              isFeatured
                ? "Featured in Spotlight (Click to remove)"
                : "Click to Feature in Spotlight"
            }
          >
            <button
              type="button"
              disabled={isTogglingFeatured}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured(item._id);
              }}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 ${
                isFeatured
                  ? "border-amber-400 bg-amber-500/90 text-white shadow-md shadow-amber-500/30 hover:scale-110 hover:bg-amber-500"
                  : "border-white/30 bg-black/40 text-white/80 backdrop-blur-md hover:scale-110 hover:border-amber-300 hover:text-amber-300"
              }`}
            >
              {isFeatured ? (
                <StarFilled className="text-sm" />
              ) : (
                <StarOutlined className="text-sm" />
              )}
            </button>
          </Tooltip>
        </div>

        {/* Quick View Full Image Hover Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onPreview(item)}
            className="btn-gradient rounded-xl px-3.5 py-1.5 font-medium shadow-lg backdrop-blur-sm"
          >
            View Photo
          </Button>
        </div>

        {/* Bottom Info on Image: Date & Location */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
          {item.location ? (
            <span className="flex items-center gap-1 truncate font-medium drop-shadow-sm">
              <EnvironmentOutlined className="text-emerald-400 shrink-0" />
              <span className="truncate max-w-40">{item.location}</span>
            </span>
          ) : (
            <span />
          )}

          {item.date && (
            <span className="flex items-center gap-1 font-medium drop-shadow-sm shrink-0">
              <CalendarOutlined className="text-mist-300" />
              <span>{formatGalleryDate(item.date)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3
            onClick={() => onPreview(item)}
            className="font-display line-clamp-1 cursor-pointer text-base font-bold text-cloud-100 transition-colors hover:text-emerald-700"
            title={item.title}
          >
            {item.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mist-500">
            {item.description || "No description provided."}
          </p>
        </div>

        {/* Footer Actions & Status */}
        <div className="mt-4 flex items-center justify-between border-t border-navy-700/40 pt-3">
          {/* Status Dropdown Menu */}
          <Dropdown
            menu={{ items: statusMenuItems }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-0.5 transition-colors hover:bg-black/5"
            >
              <Tag
                color={statusConfig.color}
                className="m-0 rounded-full border-0 font-semibold text-xs"
              >
                {statusConfig.label}
              </Tag>
              <MoreOutlined className="text-xs text-mist-400" />
            </button>
          </Dropdown>

          {/* Action Buttons */}
          <Space orientation="horizontal" size="small">
            <Tooltip title="Preview & Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onPreview(item)}
                className="rounded-lg text-mist-500 hover:text-emerald-700"
              />
            </Tooltip>

            <Tooltip title="Edit Metadata">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(item)}
                className="rounded-lg text-mist-500 hover:text-emerald-700"
              />
            </Tooltip>

            <Popconfirm
              title="Delete photo?"
              description="This will permanently remove the photo from the gallery and server disk."
              onConfirm={() => onDelete(item._id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="rounded-lg"
              />
            </Popconfirm>
          </Space>
        </div>
      </div>
    </GlassCard>
  );
}
