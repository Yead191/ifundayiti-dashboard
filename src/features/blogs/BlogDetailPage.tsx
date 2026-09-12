import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Tag, Dropdown, Spin, Tooltip, Modal } from "antd";
import type { MenuProps } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  CheckCircleFilled,
  ClockCircleFilled,
  InboxOutlined,
  CalendarOutlined,
  FolderFilled,
  UserOutlined,
  CopyOutlined,
  CheckOutlined,
  FullscreenOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { toFileUrl } from "@/config";
import {
  useGetBlogByIdOrSlugQuery,
  useUpdateBlogStatusMutation,
  useToggleBlogFeaturedMutation,
  useDeleteBlogMutation,
} from "@/redux/features/blogs/blogsApi";
import { BLOG_STATUS } from "@/redux/features/blogs/blogs.types";
import {
  BLOG_STATUS_CONFIG,
  formatBlogDate,
  formatBlogDateTime,
  estimateReadTime,
  getCategoryName,
  getAuthorInfo,
} from "./blogHelpers";
import { DeleteBlogModal } from "./components/DeleteBlogModal";

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const {
    data: blogRes,
    isLoading,
    isError,
  } = useGetBlogByIdOrSlugQuery(id || "", {
    skip: !id,
  });

  const [updateBlogStatus, { isLoading: isUpdatingStatus }] =
    useUpdateBlogStatusMutation();
  const [toggleFeatured, { isLoading: isTogglingFeatured }] =
    useToggleBlogFeaturedMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const blog = blogRes?.data;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <GlassCard className="p-12 text-center">
        <EmptyState
          title="Article Not Found"
          description="The article you are looking for does not exist or has been removed."
          actionLabel="← Back to All Articles"
          onAction={() => navigate("/blogs")}
        />
      </GlassCard>
    );
  }

  const coverUrl = blog.image ? toFileUrl(blog.image) : null;
  const statusCfg =
    BLOG_STATUS_CONFIG[blog.status] || BLOG_STATUS_CONFIG[BLOG_STATUS.DRAFT];
  const categoryName = getCategoryName(blog.category);
  const author = getAuthorInfo(blog.author);
  const readTime = estimateReadTime(blog.content);

  const handleCopySlug = () => {
    navigator.clipboard.writeText(blog.slug);
    setCopied(true);
    toast.success("Slug copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleFeatured(blog._id).unwrap();
      toast.success("Spotlight status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update spotlight status");
    }
  };

  const handleChangeStatus = async (
    status: (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS],
  ) => {
    try {
      await updateBlogStatus({ id: blog._id, status }).unwrap();
      toast.success(`Article status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBlog(blog._id).unwrap();
      toast.success("Article deleted successfully");
      navigate("/blogs");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete article");
    }
  };

  const statusMenuItems: MenuProps["items"] = [
    {
      key: BLOG_STATUS.PUBLISHED,
      label: (
        <span className="flex items-center gap-2 font-medium text-emerald-700">
          <CheckCircleFilled className="text-emerald-600" />
          <span>Publish Now</span>
        </span>
      ),
      disabled: blog.status === BLOG_STATUS.PUBLISHED,
      onClick: () => handleChangeStatus(BLOG_STATUS.PUBLISHED),
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
      onClick: () => handleChangeStatus(BLOG_STATUS.DRAFT),
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
      onClick: () => handleChangeStatus(BLOG_STATUS.ARCHIVED),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            to="/blogs"
            className="flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeftOutlined className="text-xs" />
            <span>All Articles</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 truncate max-w-xs">{blog.title}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Spotlight toggle */}
          <Button
            onClick={handleToggleFeatured}
            loading={isTogglingFeatured}
            className={`h-10 rounded-xl font-medium transition-all ${
              blog.isFeatured
                ? "bg-amber-500! text-white! border-amber-500 shadow-sm"
                : "border-gray-200 text-gray-700 hover:border-amber-400"
            }`}
            icon={
              <StarFilled
                className={blog.isFeatured ? "text-white" : "text-amber-500"}
              />
            }
          >
            {blog.isFeatured ? "Spotlighted" : "Feature in Spotlight"}
          </Button>

          {/* Quick status dropdown */}
          <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]}>
            <Button
              loading={isUpdatingStatus}
              className="h-10 rounded-xl font-medium border-gray-200"
            >
              <span className="flex items-center gap-1.5">
                <span>Status:</span>
                <strong className={statusCfg.text}>{statusCfg.label}</strong>
              </span>
            </Button>
          </Dropdown>

          {/* Edit Article */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/blogs/edit/${blog._id}`)}
            className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold px-4 border-0 shadow-sm"
          >
            Edit Article
          </Button>

          {/* Delete Article */}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalOpen(true)}
            className="h-10 rounded-xl border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Grid: Article Reading Column + Metadata Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Article Showcase */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="p-6 sm:p-8 space-y-6">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                <FolderFilled className="text-emerald-700 text-xs" />
                <span>{categoryName}</span>
              </span>

              <Tag
                bordered={false}
                className={`rounded-full px-3 py-1 text-xs font-semibold m-0 ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
              >
                {statusCfg.label}
              </Tag>

              {blog.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                  <StarFilled className="text-amber-500 text-xs" />
                  <span>Spotlight</span>
                </span>
              )}

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {readTime}
              </span>
            </div>

            {/* Article Headline */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-cloud-100 leading-tight">
              {blog.title}
            </h1>

            {/* Author & Timestamp Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-150 text-xs text-gray-500">
              <div className="flex items-center gap-3">
                {author.image ? (
                  <img
                    src={toFileUrl(author.image)}
                    alt={author.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-600/20"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug">
                    {author.name}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    {author.email || ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-mist-500">
                <span className="flex items-center gap-1.5">
                  <CalendarOutlined className="text-mist-400" />
                  <span>
                    Published:{" "}
                    {formatBlogDate(blog.publishedAt || blog.createdAt)}
                  </span>
                </span>
              </div>
            </div>

            {/* Featured Cover Photo */}
            {coverUrl && (
              <div className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md">
                <img
                  src={coverUrl}
                  alt={blog.title}
                  className="h-full w-full object-cover select-none"
                />

                {/* <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    icon={<FullscreenOutlined />}
                    onClick={() => setImagePreviewOpen(true)}
                    className="rounded-xl bg-white/90 backdrop-blur-md font-medium text-xs h-9 px-4"
                  >
                    View High-Res Photo
                  </Button>
                </div> */}
              </div>
            )}

            {/* Article Content / Rendered HTML */}
            <div className="pt-2">
              <div
                className="prose prose-emerald max-w-none text-gray-800 leading-relaxed space-y-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>p]:leading-relaxed [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-emerald-50/40 [&>blockquote]:py-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>img]:rounded-2xl [&>img]:shadow-md [&>img]:my-4"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Tags Section */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="pt-6 border-t border-gray-150">
                <div className="flex items-center gap-2 mb-2.5">
                  <TagOutlined className="text-emerald-700 text-xs" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Article Tags
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {blog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Metadata & Inspector Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Specifications */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-400">
              Publishing Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Status</span>
                <Tag
                  bordered={false}
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold m-0 ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
                >
                  {statusCfg.label}
                </Tag>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Category</span>
                <span className="font-semibold text-gray-800">
                  {categoryName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Spotlight</span>
                <span className="font-semibold text-gray-800">
                  {blog.isFeatured ? "Featured ★" : "No"}
                </span>
              </div>

              <div className="space-y-1.5 py-1.5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Article Slug</span>
                  <button
                    type="button"
                    onClick={handleCopySlug}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 hover:underline cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckOutlined /> <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <CopyOutlined /> <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[11px] bg-gray-50 border border-gray-150 p-2 rounded-lg text-gray-600 break-all select-all">
                  /{blog.slug}
                </p>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Published Date</span>
                <span className="font-medium text-gray-700">
                  {formatBlogDateTime(blog.publishedAt)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Created Date</span>
                <span className="font-medium text-gray-700">
                  {formatBlogDateTime(blog.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-400">Last Updated</span>
                <span className="font-medium text-gray-700">
                  {formatBlogDateTime(blog.updatedAt)}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions Panel */}
          <GlassCard className="p-5 sm:p-6 space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-400">
              Editorial Actions
            </h3>

            <div className="space-y-2.5 pt-1">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                className="w-full h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold border-0 shadow-sm"
              >
                Edit Story in Editor
              </Button>

              <Button
                icon={<ShareAltOutlined />}
                onClick={handleCopySlug}
                className="w-full h-10 rounded-xl font-medium border-gray-200"
              >
                Copy Story Slug URL
              </Button>

              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setDeleteModalOpen(true)}
                className="w-full h-10 rounded-xl font-medium border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100"
              >
                Delete Article Permanently
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteBlogModal
        open={deleteModalOpen}
        blog={blog}
        loading={isDeleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Full Resolution Image Lightbox Modal */}
      {coverUrl && (
        <Modal
          open={imagePreviewOpen}
          onCancel={() => setImagePreviewOpen(false)}
          footer={null}
          width={900}
          centered
          destroyOnClose
          className="rounded-3xl overflow-hidden p-0"
          styles={{ body: { padding: 0 } }}
        >
          <div className="p-4 bg-black/95 text-center">
            <img
              src={coverUrl}
              alt={blog.title}
              className="max-h-[80vh] w-auto max-w-full mx-auto object-contain rounded-xl"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
