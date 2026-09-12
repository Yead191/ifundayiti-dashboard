import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Select,
  Button,
  Pagination,
  Segmented,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  BarsOutlined,
  StarFilled,
  FileTextOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  InboxOutlined,
  TagsOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetBlogsQuery,
  useGetBlogStatsQuery,
  useGetBlogCategoriesQuery,
  useUpdateBlogStatusMutation,
  useToggleBlogFeaturedMutation,
  useDeleteBlogMutation,
} from "@/redux/features/blogs/blogsApi";
import type { IBlog, BLOG_STATUS } from "@/redux/features/blogs/blogs.types";
import { BlogCard } from "./components/BlogCard";
import { BlogTable } from "./components/BlogTable";
import { DeleteBlogModal } from "./components/DeleteBlogModal";

export default function BlogsPage() {
  const navigate = useNavigate();

  // Filters & Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Deletion modal state
  const [deletingBlog, setDeletingBlog] = useState<IBlog | null>(null);

  // Queries & Mutations
  const { data: statsRes, isLoading: isLoadingStats } = useGetBlogStatsQuery();
  const { data: categoriesRes } = useGetBlogCategoriesQuery();

  const queryParams = useMemo(() => ({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    isFeatured: featuredOnly ? true : undefined,
    sort: "-publishedAt -createdAt",
  }), [page, pageSize, searchTerm, selectedCategory, selectedStatus, featuredOnly]);

  const {
    data: blogsRes,
    isLoading: isLoadingBlogs,
    isFetching,
    refetch,
  } = useGetBlogsQuery(queryParams);

  const [updateBlogStatus] = useUpdateBlogStatusMutation();
  const [toggleFeatured] = useToggleBlogFeaturedMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const blogs = blogsRes?.data || [];
  const pagination = blogsRes?.pagination;
  const stats = statsRes?.data || {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    featured: 0,
  };
  const categories = categoriesRes?.data || [];

  // Handlers
  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeatured(id).unwrap();
      toast.success("Spotlight status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update spotlight status");
    }
  };

  const handleChangeStatus = async (
    id: string,
    status: (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS],
  ) => {
    try {
      await updateBlogStatus({ id, status }).unwrap();
      toast.success(`Article status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update article status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBlog) return;
    try {
      await deleteBlog(deletingBlog._id).unwrap();
      toast.success("Article deleted successfully");
      setDeletingBlog(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete article");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setFeaturedOnly(false);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    featuredOnly;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-cloud-100">
            Editorial & Blogs
          </h1>
          <p className="text-xs sm:text-sm text-mist-600 mt-1">
            Publish and manage field updates, transparency reports, and community stories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            icon={<TagsOutlined />}
            onClick={() => navigate("/blogs/categories")}
            className="h-10 rounded-xl font-medium border-gray-200 hover:border-[#0B3D2E]"
          >
            Manage Categories
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/blogs/create")}
            className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold px-5 shadow-sm border-0"
          >
            Write New Article
          </Button>
        </div>
      </div>

      {/* Stats Cards Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50">
            <FileTextOutlined className="text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-mist-500">
              Total Articles
            </p>
            <h3 className="font-display text-xl font-bold text-cloud-100">
              {isLoadingStats ? "…" : stats.total}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50">
            <CheckCircleFilled className="text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-mist-500">
              Published
            </p>
            <h3 className="font-display text-xl font-bold text-emerald-800">
              {isLoadingStats ? "…" : stats.published}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/50">
            <ClockCircleFilled className="text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-mist-500">
              Drafts
            </p>
            <h3 className="font-display text-xl font-bold text-amber-700">
              {isLoadingStats ? "…" : stats.draft}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/60">
            <InboxOutlined className="text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-mist-500">
              Archived
            </p>
            <h3 className="font-display text-xl font-bold text-slate-700">
              {isLoadingStats ? "…" : stats.archived}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3.5 col-span-2 sm:col-span-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 ring-1 ring-amber-400/40">
            <StarFilled className="text-xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-800">
              Spotlight
            </p>
            <h3 className="font-display text-xl font-bold text-amber-700">
              {isLoadingStats ? "…" : stats.featured}
            </h3>
          </div>
        </GlassCard>
      </div>

      {/* Filter & Search Toolbar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Search input */}
          <div className="relative w-full lg:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search by title or story text..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          {/* Center: Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setPage(1);
              }}
              className="w-44 h-10"
              popupMatchSelectWidth={false}
              options={[
                { value: "all", label: "All Categories" },
                ...categories.map((c) => ({
                  value: c._id,
                  label: `${c.name} (${c.blogCount ?? 0})`,
                })),
              ]}
            />

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
              className="w-36 h-10"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />

            {/* Spotlight Only Button */}
            <Button
              onClick={() => {
                setFeaturedOnly(!featuredOnly);
                setPage(1);
              }}
              className={`h-10 rounded-xl font-medium transition-all ${
                featuredOnly
                  ? "bg-amber-500! text-white! border-amber-500 shadow-sm"
                  : "border-gray-200 text-gray-700 hover:border-amber-400"
              }`}
              icon={<StarFilled className={featuredOnly ? "text-white" : "text-amber-500"} />}
            >
              Spotlight
            </Button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                onClick={handleResetFilters}
                className="h-10 rounded-xl border-dashed border-gray-300 text-mist-600 hover:text-cloud-100"
              >
                Reset
              </Button>
            )}

            <Tooltip title="Refresh articles list">
              <Button
                icon={<ReloadOutlined className={isFetching ? "animate-spin" : ""} />}
                onClick={() => refetch()}
                className="h-10 w-10 rounded-xl"
              />
            </Tooltip>
          </div>

          {/* Right: View Mode Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <Segmented
              value={viewMode}
              onChange={(val) => setViewMode(val as "grid" | "table")}
              options={[
                { value: "grid", icon: <AppstoreOutlined /> },
                { value: "table", icon: <BarsOutlined /> },
              ]}
              className="p-1 rounded-xl bg-gray-100"
            />
          </div>
        </div>
      </GlassCard>

      {/* Main Content Area */}
      {isLoadingBlogs ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-white border border-gray-100 p-4 shadow-2xs"
            />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <EmptyState
            icon={<FileTextOutlined className="text-4xl text-[#0B3D2E]" />}
            title={hasActiveFilters ? "No Matching Articles Found" : "No Articles Published Yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search query, category filter, or status selection."
                : "Create your first editorial story to share project milestones and field dispatches."
            }
            actionLabel={hasActiveFilters ? "Reset Filters" : "+ Write First Article"}
            onAction={
              hasActiveFilters
                ? handleResetFilters
                : () => navigate("/blogs/create")
            }
          />
        </GlassCard>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onDelete={setDeletingBlog}
              onToggleFeatured={handleToggleFeatured}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      ) : (
        <BlogTable
          blogs={blogs}
          loading={isFetching}
          onDelete={setDeletingBlog}
          onToggleFeatured={handleToggleFeatured}
          onChangeStatus={handleChangeStatus}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.total > pageSize && (
        <div className="flex items-center justify-center pt-2">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={pagination.total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) setPageSize(newPageSize);
            }}
            showSizeChanger
            pageSizeOptions={["12", "24", "48", "96"]}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteBlogModal
        open={Boolean(deletingBlog)}
        blog={deletingBlog}
        loading={isDeleting}
        onCancel={() => setDeletingBlog(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
