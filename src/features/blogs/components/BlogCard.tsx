import { useNavigate } from "react-router-dom";
import { Tag, Dropdown, Button, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarFilled,
  StarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  InboxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type { IBlog } from "@/redux/features/blogs/blogs.types";
import { BLOG_STATUS } from "@/redux/features/blogs/blogs.types";
import {
  BLOG_STATUS_CONFIG,
  formatBlogDate,
  estimateReadTime,
  getCategoryName,
  getAuthorInfo,
  stripHtml,
} from "../blogHelpers";

interface BlogCardProps {
  blog: IBlog;
  onDelete: (blog: IBlog) => void;
  onToggleFeatured?: (id: string) => void;
  onChangeStatus?: (id: string, status: (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS]) => void;
}

export function BlogCard({
  blog,
  onDelete,
  onToggleFeatured,
  onChangeStatus,
}: BlogCardProps) {
  const navigate = useNavigate();
  const coverUrl = blog.image ? toFileUrl(blog.image) : null;
  const isFeatured = Boolean(blog.isFeatured);
  const statusCfg = BLOG_STATUS_CONFIG[blog.status] || BLOG_STATUS_CONFIG[BLOG_STATUS.DRAFT];
  const categoryName = getCategoryName(blog.category);
  const author = getAuthorInfo(blog.author);
  const readTime = estimateReadTime(blog.content);
  const excerpt = stripHtml(blog.content);

  const statusMenuItems: MenuProps["items"] = [
    {
      key: "status-header",
      type: "group",
      label: "Change Article Status",
      children: [
        {
          key: BLOG_STATUS.PUBLISHED,
          label: (
            <span className="flex items-center gap-2 font-medium text-emerald-700">
              <CheckCircleFilled className="text-emerald-600" />
              <span>Publish Now</span>
            </span>
          ),
          disabled: blog.status === BLOG_STATUS.PUBLISHED,
          onClick: () => onChangeStatus?.(blog._id, BLOG_STATUS.PUBLISHED),
        },
        {
          key: BLOG_STATUS.DRAFT,
          label: (
            <span className="flex items-center gap-2 font-medium text-amber-700">
              <ClockCircleFilled className="text-amber-600" />
              <span>Save as Draft</span>
            </span>
          ),
          disabled: blog.status === BLOG_STATUS.DRAFT,
          onClick: () => onChangeStatus?.(blog._id, BLOG_STATUS.DRAFT),
        },
        {
          key: BLOG_STATUS.ARCHIVED,
          label: (
            <span className="flex items-center gap-2 font-medium text-slate-600">
              <InboxOutlined className="text-slate-500" />
              <span>Archive Article</span>
            </span>
          ),
          disabled: blog.status === BLOG_STATUS.ARCHIVED,
          onClick: () => onChangeStatus?.(blog._id, BLOG_STATUS.ARCHIVED),
        },
      ],
    },
  ];

  const actionMenuItems: MenuProps["items"] = [
    {
      key: "view",
      label: "View Details & Preview",
      icon: <EyeOutlined />,
      onClick: () => navigate(`/blogs/${blog._id}`),
    },
    {
      key: "edit",
      label: "Edit Article",
      icon: <EditOutlined />,
      onClick: () => navigate(`/blogs/edit/${blog._id}`),
    },
    ...(onToggleFeatured
      ? [
          {
            key: "featured",
            label: isFeatured ? "Remove from Spotlight" : "Feature in Spotlight",
            icon: <StarFilled className={isFeatured ? "text-amber-500" : ""} />,
            onClick: () => onToggleFeatured(blog._id),
          },
        ]
      : []),
    {
      type: "divider" as const,
    },
    {
      key: "delete",
      label: "Delete Article",
      danger: true,
      icon: <DeleteOutlined />,
      onClick: () => onDelete(blog),
    },
  ];

  return (
    <GlassCard className="group relative flex flex-col justify-between p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/40 hover:shadow-md cursor-pointer">
      <div onClick={() => navigate(`/blogs/${blog._id}`)}>
        {/* Cover Photo Header */}
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-gray-100 mb-3.5 border border-gray-100 shadow-2xs">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={blog.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#10382B] to-[#061B14] text-white/40">
              <FileTextOutlined className="text-4xl text-emerald-600/50 mb-1" />
              <span className="text-xs font-semibold text-emerald-200/50">IFundAyiti Editorial</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Top Left: Category Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-lg bg-black/65 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs border border-white/15">
              {categoryName}
            </span>
          </div>

          {/* Top Right: Spotlight Star & Action Button */}
          <div
            className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {onToggleFeatured && (
              <Tooltip title={isFeatured ? "Featured in Spotlight" : "Click to Spotlight"}>
                <button
                  type="button"
                  onClick={() => onToggleFeatured(blog._id)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md transition-all shadow-xs cursor-pointer ${
                    isFeatured
                      ? "bg-amber-500 text-white shadow-amber-500/30"
                      : "bg-black/50 text-white/70 hover:bg-black/70 hover:text-white"
                  }`}
                >
                  <StarFilled className="text-xs" />
                </button>
              </Tooltip>
            )}

            <Dropdown menu={{ items: actionMenuItems }} trigger={["click"]} placement="bottomRight">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-all shadow-xs cursor-pointer"
              >
                <MoreOutlined className="text-sm" />
              </button>
            </Dropdown>
          </div>

          {/* Bottom Right: Reading time pill */}
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white/90">
              {readTime}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-2">
          {/* Status and Slug Row */}
          <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]}>
              <Tag
                bordered={false}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold m-0 cursor-pointer transition-colors ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
              >
                <span className="flex items-center gap-1">
                  {blog.status === BLOG_STATUS.PUBLISHED && <CheckCircleFilled className="text-[10px]" />}
                  {blog.status === BLOG_STATUS.DRAFT && <ClockCircleFilled className="text-[10px]" />}
                  {blog.status === BLOG_STATUS.ARCHIVED && <InboxOutlined className="text-[10px]" />}
                  <span>{statusCfg.label}</span>
                </span>
              </Tag>
            </Dropdown>

            <span className="font-mono text-[10px] text-gray-400 truncate max-w-[150px]">
              /{blog.slug}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-base font-bold text-gray-900 group-hover:text-[#0B3D2E] transition-colors line-clamp-2 leading-snug">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {excerpt || "No narrative content provided yet."}
          </p>
        </div>
      </div>

      {/* Footer: Author & Published Date */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2 min-w-0">
          {author.image ? (
            <img
              src={toFileUrl(author.image)}
              alt={author.name}
              className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-gray-700 truncate max-w-[120px]">
            {author.name}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
          <CalendarOutlined className="text-[10px]" />
          <span>{formatBlogDate(blog.publishedAt || blog.createdAt)}</span>
        </div>
      </div>
    </GlassCard>
  );
}
