import { useNavigate } from "react-router-dom";
import { Table, Tag, Dropdown, Button, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarFilled,
  CheckCircleFilled,
  ClockCircleFilled,
  InboxOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { toFileUrl } from "@/config";
import type { IBlog } from "@/redux/features/blogs/blogs.types";
import { BLOG_STATUS } from "@/redux/features/blogs/blogs.types";
import {
  BLOG_STATUS_CONFIG,
  formatBlogDate,
  getCategoryName,
  getAuthorInfo,
} from "../blogHelpers";

interface BlogTableProps {
  blogs: IBlog[];
  loading: boolean;
  onDelete: (blog: IBlog) => void;
  onToggleFeatured?: (id: string) => void;
  onChangeStatus?: (id: string, status: (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS]) => void;
}

export function BlogTable({
  blogs,
  loading,
  onDelete,
  onToggleFeatured,
  onChangeStatus,
}: BlogTableProps) {
  const navigate = useNavigate();

  const getStatusMenuItems = (blog: IBlog): MenuProps["items"] => [
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
  ];

  const getActionMenuItems = (blog: IBlog): MenuProps["items"] => [
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
            label: blog.isFeatured ? "Remove from Spotlight" : "Feature in Spotlight",
            icon: <StarFilled className={blog.isFeatured ? "text-amber-500" : ""} />,
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

  const columns: ColumnsType<IBlog> = [
    {
      title: "Article",
      dataIndex: "title",
      key: "title",
      render: (_, blog) => {
        const coverUrl = blog.image ? toFileUrl(blog.image) : null;
        return (
          <div
            onClick={() => navigate(`/blogs/${blog._id}`)}
            className="flex items-center gap-3.5 py-1 cursor-pointer group max-w-md"
          >
            <div className="relative h-14 w-22 shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200/80">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={blog.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-950 text-emerald-300/50">
                  <PictureOutlined className="text-lg" />
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <h4 className="font-display text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#0B3D2E] transition-colors line-clamp-1">
                {blog.title}
              </h4>
              <p className="font-mono text-[11px] text-gray-400 truncate">
                /{blog.slug}
              </p>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex items-center gap-1 pt-0.5">
                  {blog.tags.slice(0, 2).map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-gray-100 px-1.5 py-0.2 text-[10px] text-gray-600"
                    >
                      #{t}
                    </span>
                  ))}
                  {blog.tags.length > 2 && (
                    <span className="text-[10px] text-gray-400">
                      +{blog.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Category",
      key: "category",
      width: 160,
      render: (_, blog) => {
        const categoryName = getCategoryName(blog.category);
        return (
          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
            {categoryName}
          </span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, blog) => {
        const statusCfg =
          BLOG_STATUS_CONFIG[blog.status] ||
          BLOG_STATUS_CONFIG[BLOG_STATUS.DRAFT];
        return (
          <Dropdown
            menu={{ items: getStatusMenuItems(blog) }}
            trigger={["click"]}
          >
            <Tag
              bordered={false}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold m-0 cursor-pointer transition-colors ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
            >
              <span className="flex items-center gap-1.5">
                {blog.status === BLOG_STATUS.PUBLISHED && (
                  <CheckCircleFilled className="text-[11px]" />
                )}
                {blog.status === BLOG_STATUS.DRAFT && (
                  <ClockCircleFilled className="text-[11px]" />
                )}
                {blog.status === BLOG_STATUS.ARCHIVED && (
                  <InboxOutlined className="text-[11px]" />
                )}
                <span>{statusCfg.label}</span>
              </span>
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Spotlight",
      key: "featured",
      width: 100,
      align: "center",
      render: (_, blog) => (
        <Tooltip title={blog.isFeatured ? "Featured in Spotlight" : "Click to Spotlight"}>
          <button
            type="button"
            onClick={() => onToggleFeatured?.(blog._id)}
            className={`flex h-8 w-8 mx-auto items-center justify-center rounded-xl transition-all shadow-2xs cursor-pointer ${
              blog.isFeatured
                ? "bg-amber-500 text-white shadow-amber-500/25 ring-1 ring-amber-400"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            }`}
          >
            <StarFilled className="text-xs" />
          </button>
        </Tooltip>
      ),
    },
    {
      title: "Author",
      key: "author",
      width: 180,
      render: (_, blog) => {
        const author = getAuthorInfo(blog.author);
        return (
          <div className="flex items-center gap-2">
            {author.image ? (
              <img
                src={toFileUrl(author.image)}
                alt={author.name}
                className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {author.name}
              </p>
              {author.email && (
                <p className="text-[11px] text-gray-400 truncate">
                  {author.email}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Date",
      key: "date",
      width: 130,
      render: (_, blog) => (
        <span className="text-xs text-gray-500">
          {formatBlogDate(blog.publishedAt || blog.createdAt)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      align: "right",
      render: (_, blog) => (
        <Dropdown
          menu={{ items: getActionMenuItems(blog) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
            icon={<MoreOutlined />}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <Table
        dataSource={blogs}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={false}
        className="custom-admin-table"
      />
    </div>
  );
}
