import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Input,
  Select,
  Tag,
  Switch,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/features/shop/categoriesApi";
import type {
  ProductCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/redux/features/shop/product.types";
import { CategoryModal } from "./components/CategoryModal";
import { formatDate } from "@/lib/utils";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  // RTK Queries & Mutations
  const { data, isLoading, isFetching } = useGetCategoriesQuery({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = data?.data ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: categories.length,
    totalPage: 1,
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: CreateCategoryPayload | UpdateCategoryPayload) => {
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          body: values,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(values as CreateCategoryPayload).unwrap();
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Could not delete category. Ensure no active products are assigned to it."
      );
    }
  };

  const handleToggleStatus = async (cat: ProductCategory) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    try {
      await updateCategory({
        id: cat._id,
        body: { status: nextStatus },
      }).unwrap();
      toast.success(
        `Category marked ${nextStatus === "active" ? "Active" : "Inactive"}`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category status");
    }
  };

  const columns: TableProps<ProductCategory>["columns"] = useMemo(
    () => [
      {
        title: "Category Name",
        dataIndex: "name",
        key: "name",
        render: (name: string, record: ProductCategory) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <AppstoreOutlined className="text-base" />
            </div>
            <div>
              <span className="font-semibold text-cloud-100">{name}</span>
              <div className="text-xs text-mist-500">ID: {record._id}</div>
            </div>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (status: string) =>
          status === "active" ? (
            <Tag
              icon={<CheckCircleOutlined />}
              className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
            >
              Active
            </Tag>
          ) : (
            <Tag
              icon={<CloseCircleOutlined />}
              className="rounded-full border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600"
            >
              Inactive
            </Tag>
          ),
      },
      {
        title: "Quick Switch",
        key: "quickSwitch",
        width: 130,
        render: (_: unknown, record: ProductCategory) => (
          <Tooltip title={`Turn ${record.status === "active" ? "off" : "on"} visibility in store`}>
            <Switch
              size="small"
              checked={record.status === "active"}
              onChange={() => handleToggleStatus(record)}
              className={record.status === "active" ? "bg-emerald-600!" : "bg-gray-300!"}
            />
          </Tooltip>
        ),
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        render: (date?: string) => (
          <span className="text-sm text-mist-500">
            {date ? formatDate(date) : "—"}
          </span>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        align: "right",
        render: (_: unknown, record: ProductCategory) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              className="h-8 w-8 rounded-lg text-mist-600 hover:bg-mist-100 hover:text-emerald-700"
            />
            <Popconfirm
              title="Delete Category?"
              description="Make sure no active products are assigned to this category before deleting."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record._id)}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="h-8 w-8 rounded-lg hover:bg-rose-50"
              />
            </Popconfirm>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-cloud-100">
              Product Categories
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {pagination.total} Categories
            </span>
          </div>
          <p className="mt-1 text-sm text-mist-600">
            Manage taxonomies, apparel sections, and merchandise classifications for the online store.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="h-10 rounded-xl bg-[#0B3D2E]! font-medium text-white! shadow-sm hover:bg-[#082e23]!"
        >
          Add Category
        </Button>
      </div>

      {/* Filter Toolbar */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400" />}
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl border-navy-700/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-mist-500">Status:</span>
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              className="h-10 w-36 rounded-xl"
              options={[
                { label: "All Status", value: "all" },
                { label: "Active Only", value: "active" },
                { label: "Inactive Only", value: "inactive" },
              ]}
            />
          </div>
        </div>
      </GlassCard>

      {/* Categories Table */}
      <GlassCard className="overflow-hidden p-0">
        <Table<ProductCategory>
          rowKey="_id"
          columns={columns}
          dataSource={categories}
          loading={isLoading || isFetching || isDeleting}
          pagination={{
            current: page,
            pageSize,
            total: pagination.total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showSizeChanger: true,
            className: "p-4! m-0!",
          }}
          locale={{
            emptyText: (
              <div className="py-12">
                <EmptyState
                  icon={<AppstoreOutlined className="text-5xl text-mist-400" />}
                  title="No Categories Found"
                  description={
                    searchTerm
                      ? `No categories matching "${searchTerm}".`
                      : "Get started by adding your first product category."
                  }
                  actionLabel={searchTerm ? "Clear Search" : "Add Category"}
                  onAction={
                    searchTerm
                      ? () => setSearchTerm("")
                      : handleOpenCreate
                  }
                />
              </div>
            ),
          }}
        />
      </GlassCard>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingCategory={editingCategory}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
