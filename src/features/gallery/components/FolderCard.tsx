import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Tag, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  FolderFilled,
  FolderOpenOutlined,
  PictureOutlined,
  CalendarOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  StarFilled,
  StarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";
import type {
  IFolder,
  GalleryStatus,
} from "@/redux/features/gallery/gallery.types";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  GALLERY_CATEGORY_CONFIG,
  GALLERY_STATUS_CONFIG,
} from "../galleryHelpers";

interface FolderCardProps {
  folder: IFolder;
  onEdit: (folder: IFolder) => void;
  onDelete: (folder: IFolder) => void;
  onChangeStatus?: (id: string, status: GalleryStatus) => void;
  onToggleFeatured?: (id: string) => void;
  isTogglingFeatured?: boolean;
}

export function FolderCard({
  folder,
  onEdit,
  onDelete,
  onChangeStatus,
  onToggleFeatured,
  isTogglingFeatured = false,
}: FolderCardProps) {
  const navigate = useNavigate();
  const count = folder.galleryCount ?? 0;
  const coverUrl = folder.image ? getImageUrl(folder.image) : null;
  const isFeatured = Boolean(folder.featured);

  const categoryConfig = folder.category
    ? GALLERY_CATEGORY_CONFIG[
        folder.category as keyof typeof GALLERY_CATEGORY_CONFIG
      ] || {
        label: folder.category,
        bg: "bg-emerald-500/10",
        text: "text-emerald-700",
        border: "border-emerald-500/20",
      }
    : null;

  const statusConfig = GALLERY_STATUS_CONFIG[folder.status] || {
    label: folder.status || "Published",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/30",
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "open",
      label: "Open Album",
      icon: <FolderOpenOutlined />,
      onClick: () => navigate(`/gallery/folder/${folder._id}`),
    },
    {
      key: "edit",
      label: "Edit Album Details",
      icon: <EditOutlined />,
      onClick: () => onEdit(folder),
    },
    ...(onToggleFeatured
      ? [
          {
            key: "featured",
            label: isFeatured
              ? "Remove from Spotlight"
              : "Feature in Spotlight",
            icon: <StarFilled className={isFeatured ? "text-amber-500" : ""} />,
            onClick: () => onToggleFeatured(folder._id),
          },
        ]
      : []),
    ...(onChangeStatus
      ? [
          {
            type: "divider" as const,
          },
          {
            key: "status-published",
            label: "Set as Published",
            icon: <CheckOutlined className="text-emerald-500" />,
            disabled: folder.status === "Published",
            onClick: () => onChangeStatus(folder._id, "Published"),
          },
          {
            key: "status-draft",
            label: "Set as Draft",
            icon: <ClockCircleOutlined className="text-amber-500" />,
            disabled: folder.status === "Draft",
            onClick: () => onChangeStatus(folder._id, "Draft"),
          },
          {
            key: "status-archived",
            label: "Set as Archived",
            icon: <InboxOutlined className="text-slate-400" />,
            disabled: folder.status === "Archived",
            onClick: () => onChangeStatus(folder._id, "Archived"),
          },
        ]
      : []),
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete Album & Photos",
      danger: true,
      icon: <DeleteOutlined />,
      onClick: () => onDelete(folder),
    },
  ];

  return (
    <GlassCard className="group relative flex flex-col justify-between p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/40 hover:shadow-md cursor-pointer">
      <div onClick={() => navigate(`/gallery/folder/${folder._id}`)}>
        {/* Top Cover Image or Icon Header */}
        {coverUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 mb-3.5 border border-gray-100 shadow-2xs">
            <img
              src={coverUrl}
              alt={folder.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-70" />

            {/* Top Badges Floating */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
              {isFeatured && (
                <span className="flex items-center gap-1 rounded-lg bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  <StarFilled className="text-xs" />
                  <span>Spotlight</span>
                </span>
              )}
            </div>

            {/* Floating Menu Button */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2.5 right-2.5 z-10"
            >
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined className="text-base text-white" />}
                  className="h-7 w-7 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 flex items-center justify-center border border-white/20 shadow-xs"
                />
              </Dropdown>
            </div>

            {/* Bottom Album & Count Badge */}
            <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-white">
                <PictureOutlined className="text-emerald-400 text-xs" />
                <span>
                  {count} {count === 1 ? "Photo" : "Photos"}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-50 to-emerald-100/60 text-emerald-800 border border-emerald-200/60 shadow-2xs group-hover:scale-105 transition-transform">
              <FolderFilled className="text-2xl text-[#0B3D2E]" />
            </div>

            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {onToggleFeatured && (
                <Tooltip
                  title={
                    isFeatured ? "Featured Spotlight" : "Feature in Spotlight"
                  }
                >
                  <Button
                    type="text"
                    size="small"
                    loading={isTogglingFeatured}
                    icon={
                      isFeatured ? (
                        <StarFilled className="text-amber-500 text-sm" />
                      ) : (
                        <StarOutlined className="text-mist-400 text-sm" />
                      )
                    }
                    onClick={() => onToggleFeatured(folder._id)}
                    className="h-8 w-8 rounded-xl hover:bg-amber-50"
                  />
                </Tooltip>
              )}

              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined className="text-base text-mist-500" />}
                  className="h-8 w-8 rounded-xl hover:bg-gray-100"
                />
              </Dropdown>
            </div>
          </div>
        )}

        {/* Category & Status Pills Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {categoryConfig && (
            <Tag
              bordered={false}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold m-0 ${categoryConfig.bg} ${categoryConfig.text} border ${categoryConfig.border}`}
            >
              {categoryConfig.label}
            </Tag>
          )}

          <Tag
            bordered={false}
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold m-0 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}
          >
            {statusConfig.label}
          </Tag>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-cloud-100 group-hover:text-[#0B3D2E] transition-colors line-clamp-1">
          {folder.name}
        </h3>

        {/* Description Snippet (if available) */}
        {folder.description && (
          <p className="mt-1 text-xs text-mist-600 line-clamp-2 leading-relaxed">
            {folder.description}
          </p>
        )}

        {/* Metadata row: Location, Date & Count (for no cover) */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-mist-500">
          {!coverUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 border border-emerald-200/80">
              <PictureOutlined className="text-emerald-700" />
              {count} {count === 1 ? "Photo" : "Photos"}
            </span>
          )}

          {folder.location && (
            <span className="flex items-center gap-1 text-mist-500 text-[11px] truncate max-w-35">
              <EnvironmentOutlined className="text-emerald-700" />
              <span>{folder.location}</span>
            </span>
          )}

          {folder.date && (
            <span className="flex items-center gap-1 text-mist-400 text-[11px]">
              <CalendarOutlined className="text-[10px]" />
              {formatDate(folder.date)}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
        <Button
          type="link"
          onClick={() => navigate(`/gallery/folder/${folder._id}`)}
          className="flex items-center gap-1 p-0 text-xs font-semibold text-[#0B3D2E] hover:underline"
        >
          <span>View Album Photos</span>
          <ArrowRightOutlined className="text-[10px]" />
        </Button>
      </div>
    </GlassCard>
  );
}
