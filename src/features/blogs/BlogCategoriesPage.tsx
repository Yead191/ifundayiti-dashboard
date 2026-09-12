import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderFilled,
  FileTextOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetBlogCategoriesQuery,
  useDeleteBlogCategoryMutation,
} from "@/redux/features/blogs/blogsApi";
import type { IBlogCategory } from "@/redux/features/blogs/blogs.types";
import { formatBlogDate } from "./blogHelpers";
import { BlogCategoryModal } from "./components/BlogCategoryModal";

export default function BlogCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IBlogCategory | null>(null);

  const {
    data: categoriesRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetBlogCategoriesQuery();

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteBlogCategoryMutation();

  const categories = categoriesRes?.data || [];

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const handleDelete = async (category: IBlogCategory) => {
    if (category.blogCount && category.blogCount > 0) {
      toast.error(
        `Cannot delete "${category.name}" because it is linked to ${category.blogCount} article(s). Reassign articles first.`
      );
      return;
    }

    try {
      await deleteCategory(category._id).unwrap();
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  const columns: ColumnsType<IBlogCategory> = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (name, cat) => (
        <div className="flex items-center gap-2.5 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            <FolderFilled className="text-sm" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-gray-900">
              {name}
            </h4>
            <p className="font-mono text-[11px] text-gray-400">
              /{cat.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Articles Count",
      dataIndex: "blogCount",
      key: "blogCount",
      width: 160,
      render: (count) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/80">
          <FileTextOutlined className="text-emerald-700" />
          <span>{count ?? 0} Articles</span>
        </span>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => (
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarOutlined className="text-gray-400 text-xs" />
          <span>{formatBlogDate(date)}</span>
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      align: "right",
      render: (_, cat) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip title="Rename Category">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingCategory(cat);
                setModalOpen(true);
              }}
              className="rounded-lg h-8 w-8 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50"
            />
          </Tooltip>

          <Popconfirm
            title="Delete this category?"
            description={
              cat.blogCount && cat.blogCount > 0
                ? "This category cannot be deleted while articles are assigned to it."
                : "Are you sure you want to delete this category?"
            }
            onConfirm={() => handleDelete(cat)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, disabled: Boolean(cat.blogCount && cat.blogCount > 0) }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="rounded-lg h-8 w-8 hover:bg-rose-50"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/blogs"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-800 hover:border-emerald-600 transition-colors shadow-2xs"
          >
            <ArrowLeftOutlined className="text-sm" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-cloud-100">
              Blog Categories
            </h1>
            <p className="text-xs text-mist-500">
              Organize articles, field notes, and editorial stories into browsable themes.
            </p>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold px-5 border-0 shadow-sm"
        >
          Add New Category
        </Button>
      </div>

      {/* Toolbar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search categories by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-mist-500">
              {filteredCategories.length} categories total
            </span>
            <Tooltip title="Refresh categories list">
              <Button
                icon={<ReloadOutlined className={isFetching ? "animate-spin" : ""} />}
                onClick={() => refetch()}
                className="h-10 w-10 rounded-xl"
              />
            </Tooltip>
          </div>
        </div>
      </GlassCard>

      {/* Categories Table */}
      {filteredCategories.length === 0 && !isLoading ? (
        <GlassCard className="p-12 text-center">
          <EmptyState
            icon={<FolderFilled className="text-4xl text-[#0B3D2E]" />}
            title={searchTerm ? "No Matching Categories" : "No Categories Added Yet"}
            description={
              searchTerm
                ? "No categories match your search term. Try clearing the search input."
                : "Create categories like Healthcare, Education, and Agriculture to organize stories."
            }
            actionLabel={searchTerm ? "Clear Search" : "+ Add First Category"}
            onAction={
              searchTerm
                ? () => setSearchTerm("")
                : () => {
                    setEditingCategory(null);
                    setModalOpen(true);
                  }
            }
          />
        </GlassCard>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
          <Table
            dataSource={filteredCategories}
            columns={columns}
            rowKey="_id"
            loading={isLoading || isDeleting}
            pagination={false}
            className="custom-admin-table"
          />
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      <BlogCategoryModal
        open={modalOpen}
        category={editingCategory}
        onCancel={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
