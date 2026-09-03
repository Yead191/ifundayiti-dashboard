import { Modal, Tag, Button, Image } from "antd";
import {
  EditOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  StarFilled,
  PictureOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { toFileUrl } from "@/config";
import type { Project } from "@/redux/features/projects/project.types";
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  formatGrantAmount,
} from "../projectHelpers";

interface ProjectDetailModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export function ProjectDetailModal({
  open,
  project,
  onClose,
  onEdit,
}: ProjectDetailModalProps) {
  if (!project) return null;

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
    typeof project.applicationPeriod === "object" && project.applicationPeriod !== null
      ? project.applicationPeriod.title
      : undefined;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnHidden
      title={null}
      styles={{ body: { padding: 0 } }}
    >
      <div className="overflow-hidden rounded-2xl">
        {/* Hero Cover Banner */}
        <div className="relative h-64 w-full bg-navy-950">
          {project.image ? (
            <img
              src={toFileUrl(project.image)}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-800/20 to-violet-800/20 text-mist-400">
              <PictureOutlined className="text-5xl opacity-40" />
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges Over Cover */}
          <div className="absolute left-6 top-6 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg px-3 py-1 text-xs font-bold shadow-md backdrop-blur-md border ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}
            >
              {categoryConfig.label}
            </span>
            {project.year && (
              <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-md">
                {project.year}
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                <StarFilled />
                Spotlight Featured
              </span>
            )}
          </div>

          {/* Title & Location at bottom of banner */}
          <div className="absolute bottom-5 left-6 right-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                  {project.name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-white/90">
                  <span className="flex items-center gap-1">
                    <EnvironmentOutlined />
                    {project.location}
                  </span>
                  {project.founder && (
                    <span className="flex items-center gap-1">
                      <UserOutlined />
                      Led by {project.founder}
                    </span>
                  )}
                  {cycleTitle && (
                    <span className="flex items-center gap-1">
                      <CalendarOutlined />
                      {cycleTitle}
                    </span>
                  )}
                </div>
              </div>

              <Tag
                color={statusConfig.color}
                className="rounded-full px-3 py-0.5 text-xs font-semibold shadow-md"
              >
                {statusConfig.label}
              </Tag>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-navy-700/50 bg-navy-950/20 p-3">
              <div className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">Grant Award</div>
              <div className="mt-1 font-display text-lg font-bold text-emerald-700">
                {formatGrantAmount(project.grantAmount)}
              </div>
            </div>

            <div className="rounded-xl border border-navy-700/50 bg-navy-950/20 p-3">
              <div className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">Category</div>
              <div className="mt-1 font-display text-sm font-bold text-cloud-100 truncate">
                {project.category}
              </div>
            </div>

            <div className="rounded-xl border border-navy-700/50 bg-navy-950/20 p-3">
              <div className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">Location</div>
              <div className="mt-1 font-display text-sm font-bold text-cloud-100 truncate">
                {project.location}
              </div>
            </div>

            <div className="rounded-xl border border-navy-700/50 bg-navy-950/20 p-3">
              <div className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">Year / Cycle</div>
              <div className="mt-1 font-display text-sm font-bold text-cloud-100 truncate">
                {project.year || "2026"}
              </div>
            </div>
          </div>

          {/* Project Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-mist-500">
              Overview & Mission
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-cloud-100">
              {project.description}
            </p>
          </div>

          {/* The Challenge & The Approach (2-Column Callouts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.challenge && (
              <div className="rounded-2xl border border-rose-200/60 bg-rose-50/50 p-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <ThunderboltOutlined />
                  <span>The Challenge</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-rose-950/90">
                  {project.challenge}
                </p>
              </div>
            )}

            {project.approach && (
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <BulbOutlined />
                  <span>The Strategy & Approach</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-emerald-950/90">
                  {project.approach}
                </p>
              </div>
            )}
          </div>

          {/* Outcome & Impact Metrics */}
          {project.outcome && (
            <div className="rounded-2xl border border-violet-200/60 bg-violet-50/50 p-4">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
                <CheckCircleOutlined />
                <span>Measurable Outcomes & Tangible Impact</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-violet-950/90">
                {project.outcome}
              </p>
            </div>
          )}

          {/* Founder & Community Story */}
          {project.story && (
            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <MessageOutlined />
                <span>Grassroots Founder & Community Story</span>
              </div>
              <p className="mt-2 text-xs italic leading-relaxed text-amber-950/90">
                "{project.story}"
              </p>
            </div>
          )}

          {/* Photo Gallery Grid with Lightbox */}
          {Array.isArray(project.gallery) && project.gallery.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mist-500 mb-3">
                <PictureOutlined />
                <span>Field Gallery ({project.gallery.length} photos)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Image.PreviewGroup>
                  {project.gallery.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-4/3 overflow-hidden rounded-xl border border-navy-700/60 bg-navy-950/20"
                    >
                      <Image
                        src={toFileUrl(photo)}
                        alt={`Photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-navy-700/40 bg-navy-950/10 px-6 py-3.5">
          <div className="text-xs text-mist-500">
            ID: <span className="font-mono text-[11px] text-cloud-100">{project._id}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button onClick={onClose} className="rounded-xl">
              Close
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose();
                onEdit(project);
              }}
              className="btn-linear rounded-xl border-0 font-semibold"
            >
              Edit Project
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
