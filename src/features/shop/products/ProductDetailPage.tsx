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
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Checkbox,
  Popover,
} from "antd";
import type { MenuProps } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  SkinOutlined,
  CalendarOutlined,
  TagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { toFileUrl } from "@/config";
import { formatDate } from "@/lib/utils";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useToggleProductFeaturedMutation,
  useSetVariantStockMutation,
  useIncreaseStockMutation,
  useSetVariantPreOrderMutation,
  useDeleteProductMutation,
} from "@/redux/features/shop/productsApi";
import { useGetCategoriesQuery } from "@/redux/features/shop/categoriesApi";
import type {
  ProductStatus,
  ProductVariant,
} from "@/redux/features/shop/product.types";
import {
  getCategoryName,
  getTotalStock,
  calculateDiscountPercent,
  formatPrice,
  GENDER_CONFIG,
  STATUS_CONFIG,
} from "../shopHelpers";
import { ProductModal } from "./components/ProductModal";
import { QuickRestockModal } from "./components/QuickRestockModal";

export default function ProductDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const {
    data: productResponse,
    isLoading,
    isError,
  } = useGetProductByIdQuery(id, { skip: !id });

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const categories = categoriesData?.data ?? [];

  // Mutations
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [updateProductStatus] = useUpdateProductStatusMutation();
  const [toggleProductFeatured] = useToggleProductFeaturedMutation();
  const [setVariantStock, { isLoading: isSettingStock }] =
    useSetVariantStockMutation();
  const [increaseStock] = useIncreaseStockMutation();
  const [setVariantPreOrder, { isLoading: isSettingPreOrder }] =
    useSetVariantPreOrderMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Selected Image for Gallery Showcase
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Full Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Quick Restock Modal State
  const [restockModalOpen, setRestockModalOpen] = useState(false);

  // Granular Pre-Order Settings Modal State
  const [preOrderModalOpen, setPreOrderModalOpen] = useState(false);
  const [targetVariant, setTargetVariant] = useState<ProductVariant | null>(
    null,
  );
  const [preOrderForm] = Form.useForm();

  // Granular Set Stock Popover State
  const [stockEditTarget, setStockEditTarget] = useState<ProductVariant | null>(
    null,
  );
  const [stockInputValue, setStockInputValue] = useState<number>(0);

  const product = productResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 1 }} className="max-w-xs" />
        <GlassCard>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton.Image active className="h-96! w-full! rounded-2xl!" />
            <div className="space-y-4">
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<SkinOutlined className="text-5xl text-mist-400" />}
          title="Apparel Item Not Found"
          description="The requested Product could not be found or may have been removed."
          actionLabel="Back to Merchandise Store"
          onAction={() => navigate("/shop/products")}
        />
      </div>
    );
  }

  const isFeatured = Boolean(product.featured);
  const totalStock = getTotalStock(product.variants);
  const discountPercent = calculateDiscountPercent(
    product.price,
    product.compareAtPrice,
  );
  const genderConfig = GENDER_CONFIG[product.gender] || GENDER_CONFIG.unisex;
  const statusInfo = STATUS_CONFIG[product.status] || STATUS_CONFIG.active;
  const images = product.images || [];

  // Handlers for granular field mutations
  const handleToggleFeatured = async () => {
    try {
      const res = await toggleProductFeatured(product._id).unwrap();
      toast.success(
        res.data?.featured
          ? "Product spotlighted on store homepage!"
          : "Product removed from spotlight",
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update spotlight status");
    }
  };

  const handleChangeStatus = async (status: ProductStatus) => {
    try {
      await updateProductStatus({ id: product._id, status }).unwrap();
      toast.success(`Product status changed to "${status}"`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(product._id).unwrap();
      toast.success("Product deleted successfully");
      navigate("/shop/products");
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Could not delete product. Items with existing sales history are protected.",
      );
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    try {
      await updateProduct({ id: product._id, formData }).unwrap();
      toast.success("Product details updated successfully");
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update Product");
    }
  };

  const handleOpenPreOrderModal = (variant: ProductVariant) => {
    setTargetVariant(variant);
    preOrderForm.setFieldsValue({
      isPreOrder: Boolean(variant.isPreOrder),
      expectedAvailableDate: variant.expectedAvailableDate
        ? dayjs(variant.expectedAvailableDate)
        : null,
    });
    setPreOrderModalOpen(true);
  };

  const handleSavePreOrder = async () => {
    if (!targetVariant) return;
    try {
      const values = await preOrderForm.validateFields();
      await setVariantPreOrder({
        productId: product._id,
        size: targetVariant.size,
        color: targetVariant.color,
        isPreOrder: Boolean(values.isPreOrder),
        expectedAvailableDate:
          values.isPreOrder && values.expectedAvailableDate
            ? values.expectedAvailableDate.toISOString()
            : null,
      }).unwrap();

      toast.success(
        `Updated Pre-Order settings for ${targetVariant.size} / ${targetVariant.color}`,
      );
      setPreOrderModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update pre-order settings");
    }
  };

  const handleSaveExactStock = async () => {
    if (!stockEditTarget) return;
    try {
      await setVariantStock({
        productId: product._id,
        size: stockEditTarget.size,
        color: stockEditTarget.color,
        stock: stockInputValue,
      }).unwrap();

      toast.success(
        `Updated stock to ${stockInputValue} units for ${stockEditTarget.size} / ${stockEditTarget.color}`,
      );
      setStockEditTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to set variant stock");
    }
  };

  const handleQuickAdd10 = async (variant: ProductVariant) => {
    try {
      await increaseStock({
        productId: product._id,
        size: variant.size,
        color: variant.color,
        quantity: 10,
      }).unwrap();
      toast.success(`Added +10 units to ${variant.size} / ${variant.color}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to restock");
    }
  };

  const statusMenuItems: MenuProps["items"] = [
    { key: "active", label: "Active (Live in Store)" },
    { key: "draft", label: "Draft" },
    { key: "inactive", label: "Inactive" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/shop/products")}
            className="h-10 w-10 rounded-xl hover:bg-gray-100"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist-500">
              <Link to="/shop/products" className="hover:text-emerald-700">
                Merchandise
              </Link>
              <span>/</span>
              <span className="text-emerald-700">
                {getCategoryName(product.category)}
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-cloud-100 sm:text-2xl">
              {product.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Spotlight toggle */}
          <Tooltip
            title={
              isFeatured
                ? "Remove from Homepage Spotlight"
                : "Promote on Homepage Spotlight"
            }
          >
            <Button
              icon={
                isFeatured ? (
                  <StarFilled className="text-amber-500" />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={handleToggleFeatured}
              className={`h-10 rounded-xl font-medium ${
                isFeatured
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              {isFeatured ? "Featured Spotlight" : "Spotlight"}
            </Button>
          </Tooltip>

          {/* Quick Status Dropdown */}
          <Dropdown
            menu={{
              items: statusMenuItems,
              onClick: ({ key }) => handleChangeStatus(key as ProductStatus),
            }}
            trigger={["click"]}
          >
            <Button className="h-10 rounded-xl font-medium">
              Status: <span className="font-bold ml-1">{statusInfo.label}</span>{" "}
              ▾
            </Button>
          </Dropdown>

          {/* Quick Restock Modal Trigger */}
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => setRestockModalOpen(true)}
            className="h-10 rounded-xl font-medium text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
          >
            Restock
          </Button>

          {/* Full Edit Modal Trigger */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditModalOpen(true)}
            className="h-10 rounded-xl bg-[#0B3D2E]! font-medium text-white! shadow-sm hover:bg-[#082e23]!"
          >
            Edit Product
          </Button>

          {/* Delete Button */}
          <Popconfirm
            title="Delete Apparel Product?"
            description={
              (product.sold || 0) > 0
                ? "Warning: This Product has sales records. Deletion might be rejected."
                : "Are you sure you want to permanently delete this product?"
            }
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={handleDelete}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              className="h-10 rounded-xl"
            />
          </Popconfirm>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <GlassCard className="p-4">
          <p className="text-xs font-medium text-mist-600">Retail Price</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cloud-100">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <span className="text-xs text-mist-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
          </div>
          {discountPercent && (
            <p className="mt-1 text-xs font-semibold text-rose-600">
              Customer saves {discountPercent}% ($
              {(product.compareAtPrice! - product.price).toFixed(2)})
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs font-medium text-mist-600">
            Total Stock in Warehouse
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cloud-100">
              {totalStock}
            </span>
            <span className="text-xs text-mist-500">units</span>
          </div>
          <p className="mt-1 text-xs text-mist-500">
            Across {product.variants?.length || 0} size/color variants
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs font-medium text-mist-600">Units Sold</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">
              {product.sold || 0}
            </span>
            <span className="text-xs text-mist-500">total units</span>
          </div>
          <p className="mt-1 text-xs text-mist-500">
            Estimated revenue:{" "}
            {formatPrice((product.sold || 0) * product.price)}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs font-medium text-mist-600">Classification</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${genderConfig.bg} ${genderConfig.text} border ${genderConfig.border}`}
            >
              {genderConfig.label}
            </span>
            <Tag className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              {getCategoryName(product.category)}
            </Tag>
          </div>
        </GlassCard>
      </div>

      {/* Main Content: Gallery (Left) & Details / Inventory Matrix (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Media Showcase (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <GlassCard className="overflow-hidden p-3">
            {images.length > 0 ? (
              <div>
                <Image.PreviewGroup>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                    <Image
                      src={toFileUrl(images[activeImageIndex])}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Image.PreviewGroup>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          idx === activeImageIndex
                            ? "border-emerald-600 ring-2 ring-emerald-600/20"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={toFileUrl(img)}
                          alt={`Angle ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-72 w-full flex-col items-center justify-center rounded-2xl bg-gray-50 text-mist-400">
                <InboxOutlined className="text-5xl" />
                <span className="mt-2 text-sm">No photos uploaded</span>
              </div>
            )}
          </GlassCard>

          {/* Product Meta & Tags */}
          <GlassCard className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Style & Search Tags
            </h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.tags && product.tags.length > 0 ? (
                product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-mist-700"
                  >
                    <TagOutlined className="text-[10px] text-mist-400" />
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-mist-400">No tags assigned</span>
              )}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-mist-500">
              <div>Added on: {formatDate(product.createdAt)}</div>
              {product.updatedAt && (
                <div className="mt-1">
                  Last updated: {formatDate(product.updatedAt)}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Product Story & Inventory Matrix (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Product Description Card */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cloud-100">
              Product Specifications & Description
            </h3>
            <div
              className="prose prose-sm max-w-none mt-3 text-mist-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </GlassCard>

          {/* Variant & Inventory Matrix Admin Control Center */}
          <GlassCard className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-cloud-100">
                  Size & Color Variant Inventory Matrix
                </h3>
                <p className="text-xs text-mist-500">
                  Manage stock levels, restock batches, and pre-order dispatch
                  dates per SKU.
                </p>
              </div>

              <Button
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => setRestockModalOpen(true)}
                className="rounded-lg text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 font-medium"
              >
                + Restock Batch
              </Button>
            </div>

            {/* Matrix Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-semibold uppercase text-mist-600">
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Color</th>
                    <th className="py-3 px-3">Stock Units</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Pre-Order Setting</th>
                    <th className="py-3 px-3 text-right">Granular Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.variants?.map((variant, idx) => {
                    const isOutOfStock = (variant.stock || 0) <= 0;
                    const isLowStock =
                      (variant.stock || 0) > 0 && (variant.stock || 0) <= 5;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Size */}
                        <td className="py-3 px-3 font-bold text-cloud-100">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                            {variant.size}
                          </span>
                        </td>

                        {/* Color */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-cloud-100">
                            {variant.color}
                          </span>
                        </td>

                        {/* Stock Units & Quick Set Stock */}
                        <td className="py-3 px-3">
                          <Popover
                            trigger="click"
                            open={
                              stockEditTarget?.size === variant.size &&
                              stockEditTarget?.color === variant.color
                            }
                            onOpenChange={(visible) => {
                              if (visible) {
                                setStockEditTarget(variant);
                                setStockInputValue(variant.stock);
                              } else {
                                setStockEditTarget(null);
                              }
                            }}
                            content={
                              <div className="w-48 space-y-2.5 p-1">
                                <p className="text-xs font-semibold text-cloud-100">
                                  Set Exact Stock ({variant.size} /{" "}
                                  {variant.color})
                                </p>
                                <InputNumber
                                  min={0}
                                  value={stockInputValue}
                                  onChange={(v) => setStockInputValue(v || 0)}
                                  className="w-full rounded-lg"
                                />
                                <div className="flex justify-end gap-1.5 pt-1">
                                  <Button
                                    size="small"
                                    onClick={() => setStockEditTarget(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="small"
                                    type="primary"
                                    loading={isSettingStock}
                                    onClick={handleSaveExactStock}
                                    className="bg-[#0B3D2E]! hover:bg-[#082e23]! text-white!"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            }
                          >
                            <button
                              type="button"
                              className="group flex items-center gap-1.5 cursor-pointer rounded-lg border border-transparent px-2 py-1 hover:border-gray-200 hover:bg-white"
                            >
                              <span className="text-sm font-bold text-cloud-100">
                                {variant.stock}
                              </span>
                              <EditOutlined className="text-[10px] text-mist-400 group-hover:text-emerald-600" />
                            </button>
                          </Popover>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3">
                          {isOutOfStock ? (
                            variant.isPreOrder ? (
                              <Tag
                                icon={<ClockCircleOutlined />}
                                className="rounded-full border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-800"
                              >
                                Pre-Order
                              </Tag>
                            ) : (
                              <Tag
                                icon={<CloseCircleOutlined />}
                                className="rounded-full border-rose-200 bg-rose-50 text-[11px] font-semibold text-rose-800"
                              >
                                Sold Out
                              </Tag>
                            )
                          ) : isLowStock ? (
                            <Tag
                              icon={<WarningOutlined />}
                              className="rounded-full border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-700"
                            >
                              Low Stock ({variant.stock})
                            </Tag>
                          ) : (
                            <Tag
                              icon={<CheckCircleOutlined />}
                              className="rounded-full border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-800"
                            >
                              In Stock
                            </Tag>
                          )}
                        </td>

                        {/* Pre-Order Details */}
                        <td className="py-3 px-3">
                          {variant.isPreOrder ? (
                            <div>
                              <span className="font-semibold text-amber-700">
                                Enabled
                              </span>
                              {variant.expectedAvailableDate && (
                                <div className="text-[10px] text-mist-500">
                                  Ships:{" "}
                                  {formatDate(variant.expectedAvailableDate)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-mist-400">Disabled</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Tooltip title="Quick Restock +10 units">
                              <Button
                                size="small"
                                onClick={() => handleQuickAdd10(variant)}
                                className="rounded-lg text-[11px] text-emerald-700 hover:bg-emerald-50"
                              >
                                +10
                              </Button>
                            </Tooltip>

                            <Tooltip title="Configure Pre-Order Settings">
                              <Button
                                size="small"
                                icon={<ClockCircleOutlined />}
                                onClick={() => handleOpenPreOrderModal(variant)}
                                className="rounded-lg text-[11px] text-mist-600 hover:text-amber-700 hover:bg-amber-50"
                              />
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Pre-Order Configuration Modal */}
      <Modal
        open={preOrderModalOpen}
        onCancel={() => setPreOrderModalOpen(false)}
        onOk={handleSavePreOrder}
        confirmLoading={isSettingPreOrder}
        okText="Update Pre-Order"
        cancelText="Cancel"
        width={420}
        destroyOnClose
        okButtonProps={{
          className:
            "bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium",
        }}
        title={
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-cloud-100">
            <ClockCircleOutlined className="text-amber-500" />
            <span className="font-bold">
              Pre-Order Mode ({targetVariant?.size} / {targetVariant?.color})
            </span>
          </div>
        }
      >
        <Form form={preOrderForm} layout="vertical" className="mt-4">
          <Form.Item
            name="isPreOrder"
            valuePropName="checked"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                Pre-Order Status
              </span>
            }
          >
            <Checkbox>
              <span className="text-xs font-medium text-cloud-100">
                Accept customer orders when inventory is out of stock
              </span>
            </Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.isPreOrder !== curr.isPreOrder}
          >
            {({ getFieldValue }) =>
              getFieldValue("isPreOrder") ? (
                <Form.Item
                  name="expectedAvailableDate"
                  label={
                    <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                      Expected Dispatch Date
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please specify dispatch date for pre-orders",
                    },
                  ]}
                >
                  <DatePicker
                    className="h-10 w-full rounded-xl"
                    placeholder="Select anticipated shipping date"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* Full Edit Modal */}
      <ProductModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateProduct}
        editingProduct={product}
        categories={categories}
        isLoading={isUpdating}
      />

      {/* Quick Restock Modal */}
      <QuickRestockModal
        open={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        product={product}
      />
    </div>
  );
}
