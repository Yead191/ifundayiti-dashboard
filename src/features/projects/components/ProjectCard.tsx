import { Tag, Button, Space, Popconfirm, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  EnvironmentOutlined,
  UserOutlined,
  DeleteOutlined,
  EyeOutlined,
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
import { cn } from "@/lib/utils";
import { toFileUrl } from "@/config";
import type {
  Project,
  ProjectStatus,
} from "@/redux/features/projects/project.types";
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  formatGrantAmount,
} from "../projectHelpers";

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: ProjectStatus) => void;
  onToggleFeatured: (id: string) => void;
  isTogglingFeatured?: boolean;
}

export function ProjectCard({
  project,
  onView,
  onDelete,
  onChangeStatus,
  onToggleFeatured,
  isTogglingFeatured = false,
}: ProjectCardProps) {
  const isFeatured = Boolean(project.featured);
  const categoryConfig = CATEGORY_CONFIG[project.category] || {
    label: project.category,
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/20",
  };
  const statusConfig = STATUS_CONFIG[project.status] || {
    label: project.status,
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
      disabled: project.status === "Published",
      onClick: () => onChangeStatus(project._id, "Published"),
    },
    {
      key: "Draft",
      label: "Move to Draft",
      icon: <ClockCircleOutlined className="text-amber-500" />,
      disabled: project.status === "Draft",
      onClick: () => onChangeStatus(project._id, "Draft"),
    },
    {
      key: "Archived",
      label: "Archive Project",
      icon: <InboxOutlined className="text-slate-500" />,
      disabled: project.status === "Archived",
      onClick: () => onChangeStatus(project._id, "Archived"),
    },
  ];

  const cycleTitle =
    typeof project.applicationPeriod === "object" &&
    project.applicationPeriod !== null
      ? project.applicationPeriod.title
      : undefined;

  return (
    <GlassCard
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border",
        isFeatured
          ? "border-amber-400/50 bg-linear-to-b from-amber-500/5 via-transparent to-transparent shadow-amber-500/5 hover:border-amber-400/80"
          : "border-navy-700/60 hover:border-emerald-600/50",
      )}
    >
      <div>
        {/* Cover Photo Header */}
        <div
          className="relative h-44 w-full cursor-pointer overflow-hidden bg-navy-950/40"
          onClick={() => onView(project)}
        >
          {project.image ? (
            <img
              src={toFileUrl(project.image)}
              alt={project.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-600/10 to-violet-600/10 text-mist-400">
              <PictureOutlined className="text-4xl opacity-50" />
            </div>
          )}

          {/* Top Badges Overlay */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-lg px-2.5 py-0.5 text-[11px] font-bold shadow-xs backdrop-blur-md border",
                categoryConfig.bg,
                categoryConfig.text,
                categoryConfig.border,
              )}
            >
              {categoryConfig.label}
            </span>
            {project.year && (
              <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs backdrop-blur-md">
                {project.year}
              </span>
            )}
          </div>

          {/* Featured Spotlight Button Top-Right */}
          <Tooltip
            title={
              isFeatured
                ? "Featured Spotlight (Click to unfeature)"
                : "Click to Spotlight on homepage"
            }
          >
            <button
              type="button"
              disabled={isTogglingFeatured}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured(project._id);
              }}
              className={cn(
                "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-xs",
                isFeatured
                  ? "bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-400/40"
                  : "bg-black/50 text-white/80 hover:bg-black/80 hover:text-amber-400",
              )}
            >
              {isFeatured ? (
                <StarFilled className="text-sm text-white" />
              ) : (
                <StarOutlined className="text-sm" />
              )}
            </button>
          </Tooltip>

          {/* Grant Amount Pill Bottom-Right of image */}
          {project.grantAmount !== undefined && (
            <div className="absolute bottom-2.5 right-3 rounded-lg bg-emerald-700/90 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
              {formatGrantAmount(project.grantAmount)}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h4
              onClick={() => onView(project)}
              className="cursor-pointer font-display text-base font-bold text-cloud-100 transition-colors hover:text-emerald-700 line-clamp-1"
            >
              {project.name}
            </h4>
            <Tag
              color={statusConfig.color}
              className="m-0 rounded-full border-0 text-[10px] font-semibold shrink-0"
            >
              {statusConfig.label}
            </Tag>
          </div>

          {/* Location & Founder Info */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist-500">
            <span className="flex items-center gap-1">
              <EnvironmentOutlined className="text-emerald-600" />
              <span className="truncate max-w-32.5">{project.location}</span>
            </span>
            {project.founder && (
              <span className="flex items-center gap-1">
                <UserOutlined className="text-violet-600" />
                <span className="truncate max-w-30 font-medium text-mist-600">
                  {project.founder}
                </span>
              </span>
            )}
          </div>

          {/* Associated Cycle Pill */}
          {cycleTitle && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-mist-500">
              <CalendarOutlined className="text-violet-500" />
              <span className="truncate text-violet-700 font-medium">
                {cycleTitle}
              </span>
            </div>
          )}

          {/* Description Snippet */}
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-mist-600">
            {project.description}
          </p>

          {/* Gallery Indicator Pill */}
          {Array.isArray(project.gallery) && project.gallery.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-mist-400">
              <PictureOutlined />
              <span>
                {project.gallery.length} gallery{" "}
                {project.gallery.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-navy-700/40 bg-navy-950/20 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]}>
            <Button
              size="small"
              className="rounded-lg text-[11px] font-medium text-mist-600 hover:border-emerald-600 hover:text-emerald-700"
            >
              Status <MoreOutlined />
            </Button>
          </Dropdown>

          <Space size={4}>
            <Tooltip title="View Full Project Story">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onView(project)}
                className="rounded-lg text-mist-500 hover:bg-emerald-50 hover:text-emerald-700"
              />
            </Tooltip>

            <Popconfirm
              title="Delete this project?"
              description="This will permanently delete the project and its media files."
              onConfirm={() => onDelete(project._id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="rounded-lg hover:bg-red-50"
              />
            </Popconfirm>
          </Space>
        </div>
      </div>
    </GlassCard>
  );
}
