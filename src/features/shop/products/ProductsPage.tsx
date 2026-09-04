import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Pagination, Spin } from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetProductsQuery,
  useGetProductStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useToggleProductFeaturedMutation,
  useDeleteProductMutation,
} from "@/redux/features/shop/productsApi";
import { useGetCategoriesQuery } from "@/redux/features/shop/categoriesApi";
import type {
  Product,
  ProductStatus,
} from "@/redux/features/shop/product.types";
import { ProductStatsHeader } from "./components/ProductStatsHeader";
import { ProductFiltersBar } from "./components/ProductFiltersBar";
import { ProductCard } from "./components/ProductCard";
import { ProductTable } from "./components/ProductTable";
import { ProductModal } from "./components/ProductModal";
import { QuickRestockModal } from "./components/QuickRestockModal";

export default function ProductsPage() {
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Queries
  const { data: statsData, isLoading: isLoadingStats } =
    useGetProductStatsQuery();

  const { data: categoriesData } = useGetCategoriesQuery({
    limit: 100,
  });

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
  } = useGetProductsQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    gender: genderFilter !== "all" ? genderFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sort,
  });

  // Mutations
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [updateProductStatus] = useUpdateProductStatusMutation();
  const [toggleProductFeatured] = useToggleProductFeaturedMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(
    null,
  );

  const categories = categoriesData?.data ?? [];
  const products = productsData?.data ?? [];
  const pagination = productsData?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: products.length,
    totalPage: 1,
  };

  // Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleOpenRestock = (product: Product) => {
    setRestockingProduct(product);
    setRestockModalOpen(true);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/shop/products/${id}`);
  };

  const handleSubmitProduct = async (formData: FormData) => {
    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id,
          formData,
        }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct(formData).unwrap();
        toast.success("Apparel product added to store");
      }
      setProductModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save product");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await toggleProductFeatured(id).unwrap();
      const isNowFeatured = res.data?.featured;
      toast.success(
        isNowFeatured
          ? "Product spotlighted on store homepage!"
          : "Product removed from spotlight",
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle spotlight");
    }
  };

  const handleChangeStatus = async (id: string, status: ProductStatus) => {
    try {
      await updateProductStatus({ id, status }).unwrap();
      toast.success(`Product status changed to "${status}"`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Could not delete product. Products with sales history are protected.",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-cloud-100">
              Store Merchandise
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {pagination.total} Items
            </span>
          </div>
          <p className="mt-1 text-sm text-mist-600">
            Manage apparel Products, dynamic variant inventory matrices,
            pricing, and spotlight promotions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => navigate("/shop/categories")}
            className="h-10 rounded-xl font-medium"
          >
            Manage Categories
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            className="h-10 rounded-xl bg-[#0B3D2E]! font-medium text-white! shadow-sm hover:bg-[#082e23]!"
          >
            Add Apparel Item
          </Button>
        </div>
      </div>

      {/* KPI Stats Header */}
      <ProductStatsHeader
        stats={statsData?.data}
        loading={isLoadingStats}
        activeStatusFilter={statusFilter}
        onSelectStatus={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
      />

      {/* Filters Toolbar */}
      <ProductFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={(val) => {
          setCategoryFilter(val);
          setPage(1);
        }}
        categories={categories}
        genderFilter={genderFilter}
        onGenderChange={(val) => {
          setGenderFilter(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusCounts={{
          all: statsData?.data?.totalProducts,
          active: statsData?.data?.activeProducts,
          draft: statsData?.data?.draftProducts,
          inactive: statsData?.data?.inactiveProducts,
          archived: statsData?.data?.archivedProducts,
        }}
      />

      {/* Catalog Display (Grid vs Table) */}
      {isLoadingProducts ? (
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <GlassCard className="py-16">
          <EmptyState
            icon={<SkinOutlined className="text-5xl text-mist-400" />}
            title="No Products Found"
            description={
              searchTerm || categoryFilter !== "all" || genderFilter !== "all"
                ? "No apparel items match your active filters."
                : "Your apparel merchandise catalog is currently empty."
            }
            actionLabel={
              searchTerm || categoryFilter !== "all"
                ? "Clear Filters"
                : "Add First Apparel Item"
            }
            onAction={
              searchTerm || categoryFilter !== "all"
                ? () => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setGenderFilter("all");
                    setStatusFilter("all");
                  }
                : handleOpenCreate
            }
          />
        </GlassCard>
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onViewDetails={handleViewDetails}
                onEdit={handleOpenEdit}
                onRestock={handleOpenRestock}
                onToggleFeatured={handleToggleFeatured}
                onChangeStatus={handleChangeStatus}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pageSize && (
            <div className="flex justify-center pt-2">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={pagination.total}
                onChange={(p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                }}
                showSizeChanger
                pageSizeOptions={["8", "12", "24", "48"]}
              />
            </div>
          )}
        </div>
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <ProductTable
            products={products}
            loading={isFetchingProducts}
            page={page}
            pageSize={pageSize}
            total={pagination.total}
            onPageChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            onViewDetails={handleViewDetails}
            onEdit={handleOpenEdit}
            onRestock={handleOpenRestock}
            onToggleFeatured={handleToggleFeatured}
            onChangeStatus={handleChangeStatus}
            onDelete={handleDeleteProduct}
          />
        </GlassCard>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
        categories={categories}
        isLoading={isCreating || isUpdating}
      />

      {/* Quick Restock Modal */}
      <QuickRestockModal
        open={restockModalOpen}
        onClose={() => {
          setRestockModalOpen(false);
          setRestockingProduct(null);
        }}
        product={restockingProduct}
      />
    </div>
  );
}
