import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Tag,
  Skeleton,
  Popconfirm,
  Dropdown,
  Image,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  StarFilled,
  StarOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CheckOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { toFileUrl } from "@/config";
import {
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation,
  useToggleProjectFeaturedMutation,
  useDeleteProjectMutation,
} from "@/redux/features/projects/projectsApi";
import type { ProjectStatus } from "@/redux/features/projects/project.types";
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  formatGrantAmount,
} from "./projectHelpers";
import { ProjectModal } from "./components/ProjectModal";

export default function ProjectDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: projectResponse,
    isLoading,
    isError,
  } = useGetProjectByIdQuery(id, { skip: !id });

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [updateProjectStatus] = useUpdateProjectStatusMutation();
  const [toggleProjectFeatured, { isLoading: isTogglingFeatured }] =
    useToggleProjectFeaturedMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);

  const project = projectResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 1 }} className="max-w-xs" />
        <GlassCard>
          <Skeleton.Image active className="h-64! w-full! rounded-2xl!" />
          <div className="mt-6">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </GlassCard>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<PictureOutlined className="text-5xl text-mist-400" />}
          title="Project Not Found"
          description="The requested community project could not be found or has been removed."
          actionLabel="Back to Projects Directory"
          onAction={() => navigate("/projects")}
        />
      </div>
    );
  }

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
  };

  const cycleTitle =
    typeof project.applicationPeriod === "object" &&
    project.applicationPeriod !== null
      ? project.applicationPeriod.title
      : undefined;

  const statusMenuItems: MenuProps["items"] = [
    {
      key: "Published",
      label: "Mark as Published",
      icon: <CheckOutlined className="text-emerald-500" />,
      disabled: project.status === "Published",
      onClick: async () => {
        try {
          await updateProjectStatus({
            id: project._id,
            body: { status: "Published" },
          }).unwrap();
          toast.success("Project status changed to Published");
        } catch (err: any) {
          toast.error("Failed to update status", {
            description: err?.data?.message,
          });
        }
      },
    },
    {
      key: "Draft",
      label: "Move to Draft",
      icon: <ClockCircleOutlined className="text-amber-500" />,
      disabled: project.status === "Draft",
      onClick: async () => {
        try {
          await updateProjectStatus({
            id: project._id,
            body: { status: "Draft" },
          }).unwrap();
          toast.success("Project moved to Draft");
        } catch (err: any) {
          toast.error("Failed to update status", {
            description: err?.data?.message,
          });
        }
      },
    },
    {
      key: "Archived",
      label: "Archive Project",
      icon: <InboxOutlined className="text-slate-500" />,
      disabled: project.status === "Archived",
      onClick: async () => {
        try {
          await updateProjectStatus({
            id: project._id,
            body: { status: "Archived" },
          }).unwrap();
          toast.success("Project archived");
        } catch (err: any) {
          toast.error("Failed to update status", {
            description: err?.data?.message,
          });
        }
      },
    },
  ];

  const handleToggleFeatured = async () => {
    try {
      await toggleProjectFeatured(project._id).unwrap();
      toast.success(
        isFeatured
          ? "Removed from Spotlight"
          : "Pinned to Spotlight Highlights",
      );
    } catch (err: any) {
      toast.error("Failed to update spotlight", {
        description: err?.data?.message,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(project._id).unwrap();
      toast.success("Project deleted successfully");
      navigate("/projects");
    } catch (err: any) {
      toast.error("Failed to delete project", {
        description: err?.data?.message,
      });
    }
  };

  const handleUpdateSubmit = async (formData: FormData) => {
    try {
      await updateProject({ id: project._id, body: formData }).unwrap();
      toast.success("Project updated successfully");
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to save project changes", {
        description:
          err?.data?.message || err?.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy-700/60 bg-white/80 text-mist-500 transition-colors hover:border-emerald-600 hover:text-emerald-700 shadow-2xs"
          >
            <ArrowLeftOutlined />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-mist-500">
              <Link
                to="/projects"
                className="hover:text-emerald-700 hover:underline"
              >
                Projects
              </Link>
              <span>/</span>
              <span className="truncate max-w-50 text-cloud-100 font-medium">
                {project.name}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#0B3D2E]">
              Project Details & Management
            </h1>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Spotlight Toggle */}
          <Button
            onClick={handleToggleFeatured}
            loading={isTogglingFeatured}
            icon={
              isFeatured ? (
                <StarFilled className="text-amber-500" />
              ) : (
                <StarOutlined />
              )
            }
            className={`rounded-xl border font-medium ${
              isFeatured
                ? "border-amber-400/50 bg-amber-50/70 text-amber-700 hover:border-amber-500"
                : "border-navy-700/60 bg-white hover:border-amber-400 hover:text-amber-600"
            }`}
          >
            {isFeatured ? "Spotlight Active" : "Spotlight Project"}
          </Button>

          {/* Quick Status Transition Dropdown */}
          <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]}>
            <Button className="rounded-xl border-navy-700/60 bg-white font-medium">
              Status:{" "}
              <Tag
                color={statusConfig.color}
                className="m-0 ml-1 rounded-full border-0 text-[10px] font-semibold"
              >
                {statusConfig.label}
              </Tag>
              <MoreOutlined className="ml-1" />
            </Button>
          </Dropdown>

          {/* Edit Primary Button */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditModalOpen(true)}
            className="btn-linear rounded-xl border-0 font-semibold"
          >
            Edit Project
          </Button>

          {/* Delete Button */}
          <Popconfirm
            title="Delete this project permanently?"
            description="This action cannot be undone and will unlink all stored photos."
            onConfirm={handleDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} className="rounded-xl" />
          </Popconfirm>
        </div>
      </div>

      {/* Main Hero Card */}
      <GlassCard className="overflow-hidden p-0 border border-navy-700/60 shadow-xs">
        <div className="relative h-72 w-full bg-navy-950 sm:h-80 md:h-96">
          {project.image ? (
            <img
              src={toFileUrl(project.image)}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-800/20 to-violet-800/20 text-mist-400">
              <PictureOutlined className="text-6xl opacity-30" />
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

          {/* Badges Over Cover */}
          <div className="absolute left-6 top-6 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-xl px-3.5 py-1 text-xs font-bold shadow-md backdrop-blur-md border ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}
            >
              {categoryConfig.label}
            </span>
            {project.year && (
              <span className="rounded-xl bg-black/60 px-3 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-md">
                {project.year}
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                <StarFilled className="text-xs" />
                Spotlight Featured
              </span>
            )}
          </div>

          {/* Banner Title & Information */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                  {project.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-white/90">
                  <span className="flex items-center gap-1.5">
                    <EnvironmentOutlined className="text-emerald-400" />
                    {project.location}
                  </span>
                  {project.founder && (
                    <span className="flex items-center gap-1.5">
                      <UserOutlined className="text-violet-400" />
                      Led by {project.founder}
                    </span>
                  )}
                  {cycleTitle && (
                    <span className="flex items-center gap-1.5">
                      <CalendarOutlined className="text-amber-400" />
                      {cycleTitle}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                <div className="text-[10px] uppercase font-semibold text-white/70">
                  Grant Award
                </div>
                <div className="font-display text-xl font-bold text-white">
                  {formatGrantAmount(project.grantAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Grid: Main Narrative Column & Sidebar Facts Column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main 2-Span Column: Narrative & Stories */}
        <div className="space-y-6 lg:col-span-2">
          {/* Summary / Overview */}
          <GlassCard className="p-6 border border-navy-700/60 shadow-xs">
            <h3 className="font-display text-base font-bold text-cloud-100 flex items-center gap-2">
              <BulbOutlined className="text-emerald-600" />
              Project Overview & Purpose
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-cloud-100 whitespace-pre-line">
              {project.description}
            </p>
          </GlassCard>

          {/* Challenge & Strategy (2 Callout Cards) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.challenge && (
              <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <ThunderboltOutlined className="text-base" />
                  <span>The Challenge</span>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-rose-950/90 whitespace-pre-line">
                  {project.challenge}
                </p>
              </div>
            )}

            {project.approach && (
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircleOutlined className="text-base" />
                  <span>Strategy & Solution</span>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-emerald-950/90 whitespace-pre-line">
                  {project.approach}
                </p>
              </div>
            )}
          </div>

          {/* Measurable Outcomes & Impact */}
          {project.outcome && (
            <GlassCard className="p-6 border border-violet-200/60 bg-violet-50/40 shadow-xs">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
                <CheckCircleOutlined className="text-base" />
                <span>Measurable Outcomes & Tangible Impact</span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-violet-950/90 whitespace-pre-line">
                {project.outcome}
              </p>
            </GlassCard>
          )}

          {/* Grassroots Founder Story */}
          {project.story && (
            <GlassCard className="p-6 border border-amber-200/60 bg-amber-50/30 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <MessageOutlined className="text-base" />
                <span>Founder & Grassroots Story</span>
              </div>
              <blockquote className="mt-3 border-l-2 border-amber-500/50 pl-4 text-xs italic leading-relaxed text-amber-950/90 whitespace-pre-line">
                "{project.story}"
              </blockquote>
            </GlassCard>
          )}

          {/* Photo Gallery Grid */}
          <GlassCard className="p-6 border border-navy-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-cloud-100 flex items-center gap-2">
                <PictureOutlined className="text-emerald-600" />
                Field Implementation Gallery
              </h3>
              <span className="text-xs text-mist-500">
                {project.gallery?.length || 0} photos
              </span>
            </div>

            {Array.isArray(project.gallery) && project.gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <Image.PreviewGroup>
                  {project.gallery.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-4/3 overflow-hidden rounded-xl border border-navy-700/60 bg-navy-950/20 group cursor-pointer shadow-2xs"
                    >
                      <Image
                        src={toFileUrl(photo)}
                        alt={`Field photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-700/70 p-8 text-center text-mist-400">
                <PictureOutlined className="text-3xl opacity-40 mb-2" />
                <p className="text-xs">
                  No gallery photos uploaded for this project yet.
                </p>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setEditModalOpen(true)}
                  className="mt-3 rounded-lg text-xs"
                >
                  Add Field Photos
                </Button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Sidebar: Key Facts & Metadata */}
        <div className="space-y-6">
          <GlassCard className="p-5 border border-navy-700/60 shadow-xs">
            <h4 className="font-display text-sm font-bold text-cloud-100 mb-4">
              Project Quick Facts
            </h4>

            <div className="divide-y divide-navy-700/40 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Status</span>
                <Tag
                  color={statusConfig.color}
                  className="m-0 rounded-full border-0 font-semibold"
                >
                  {statusConfig.label}
                </Tag>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Category</span>
                <span className="font-semibold text-cloud-100">
                  {project.category}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Grant Commitment</span>
                <span className="font-bold text-emerald-700">
                  {formatGrantAmount(project.grantAmount)}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Location</span>
                <span className="font-semibold text-cloud-100">
                  {project.location}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Project Champion</span>
                <span className="font-semibold text-cloud-100">
                  {project.founder || "—"}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Year Founded / Funded</span>
                <span className="font-semibold text-cloud-100">
                  {project.year || "—"}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Spotlight Status</span>
                <span
                  className={`font-semibold ${isFeatured ? "text-amber-600" : "text-mist-500"}`}
                >
                  {isFeatured ? "Featured on Home" : "Standard Listing"}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Grant Cycle</span>
                <span className="font-semibold text-violet-700 truncate max-w-37.5">
                  {cycleTitle || "Independent"}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">System ID</span>
                <span className="font-mono text-[11px] text-mist-500 truncate max-w-35">
                  {project._id}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-mist-500">Created At</span>
                <span className="text-mist-500">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                block
                onClick={() => setEditModalOpen(true)}
                className="btn-linear rounded-xl border-0 font-semibold"
              >
                Edit Project
              </Button>
              <Button
                block
                onClick={() => navigate("/projects")}
                className="rounded-xl"
              >
                Back to Projects
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        open={editModalOpen}
        project={project}
        loading={isUpdating}
        onCancel={() => setEditModalOpen(false)}
        onSubmit={handleUpdateSubmit}
      />
    </div>
  );
}
