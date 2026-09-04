import { useState } from "react";
import { Tag, Dropdown, Button, Popconfirm, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  StarFilled,
  StarOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  MoreOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type {
  Product,
  ProductStatus,
} from "@/redux/features/shop/product.types";
import {
  getCategoryName,
  getTotalStock,
  calculateDiscountPercent,
  formatPrice,
  GENDER_CONFIG,
  STATUS_CONFIG,
} from "../../shopHelpers";

interface ProductCardProps {
  product: Product;
  onViewDetails: (id: string) => void;
  onEdit: (product: Product) => void;
  onRestock: (product: Product) => void;
  onToggleFeatured: (id: string) => void;
  onChangeStatus: (id: string, status: ProductStatus) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({
  product,
  onViewDetails,
  onEdit,
  onRestock,
  onToggleFeatured,
  onChangeStatus,
  onDelete,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images || [];
  const primaryImage = images[0] ? toFileUrl(images[0]) : null;
  const hoverImage = images[1] ? toFileUrl(images[1]) : primaryImage;

  const totalStock = getTotalStock(product.variants);
  const discountPercent = calculateDiscountPercent(
    product.price,
    product.compareAtPrice,
  );
  const genderConfig = GENDER_CONFIG[product.gender] || GENDER_CONFIG.unisex;
  const statusInfo = STATUS_CONFIG[product.status] || STATUS_CONFIG.active;

  // Sizes & Colors unique lists
  const uniqueSizes = Array.from(
    new Set((product.variants || []).map((v) => v.size)),
  );
  const uniqueColors = Array.from(
    new Set((product.variants || []).map((v) => v.color)),
  );
  const hasPreOrder = (product.variants || []).some((v) => v.isPreOrder);

  const statusMenuItems: MenuProps["items"] = [
    { key: "active", label: "Set Active (Live in Store)" },
    { key: "draft", label: "Set Draft" },
    { key: "inactive", label: "Set Inactive" },
    { key: "archived", label: "Set Archived" },
  ];

  return (
    <GlassCard className="group flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Media & Thumbnail Area */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewDetails(product._id)}
      >
        {primaryImage ? (
          <img
            src={isHovered && hoverImage ? hoverImage : primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-mist-400">
            <InboxOutlined className="text-4xl" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${genderConfig.bg} ${genderConfig.text} border ${genderConfig.border}`}
            >
              {genderConfig.label}
            </span>
            {discountPercent && (
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            {hasPreOrder && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                Pre-Order
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            <Tooltip
              title={
                product.featured
                  ? "Remove from Spotlight"
                  : "Feature on Spotlight"
              }
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(product._id);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-110 shadow-xs ${
                  product.featured
                    ? "bg-amber-400 text-amber-950"
                    : "bg-white/80 text-mist-500 hover:bg-white hover:text-amber-500"
                }`}
              >
                {product.featured ? (
                  <StarFilled className="text-sm" />
                ) : (
                  <StarOutlined className="text-sm" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Stock Callout Overlay */}
        <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
          {totalStock > 0 ? (
            <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {totalStock} units available
            </span>
          ) : hasPreOrder ? (
            <span className="rounded-md bg-amber-600/90 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              Pre-Order Available
            </span>
          ) : (
            <span className="rounded-md bg-rose-600/90 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            {getCategoryName(product.category)}
          </span>

          <Dropdown
            menu={{
              items: statusMenuItems,
              onClick: ({ key }) =>
                onChangeStatus(product._id, key as ProductStatus),
            }}
            trigger={["click"]}
          >
            <button
              type="button"
              className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                product.status === "active"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : product.status === "draft"
                    ? "border-gray-200 bg-gray-50 text-gray-600"
                    : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {statusInfo.label} ▾
            </button>
          </Dropdown>
        </div>

        {/* Product Title */}
        <h4
          onClick={() => onViewDetails(product._id)}
          className="mt-1.5 line-clamp-1 font-bold text-cloud-100 hover:text-emerald-700 cursor-pointer"
        >
          {product.name}
        </h4>

        {/* Pricing */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-cloud-100">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-mist-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Sizing & Colors pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          {uniqueSizes.slice(0, 5).map((size) => (
            <span
              key={size}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-mist-700"
            >
              {size}
            </span>
          ))}
          {uniqueSizes.length > 5 && (
            <span className="text-[10px] text-mist-400">
              +{uniqueSizes.length - 5}
            </span>
          )}

          <span className="mx-1 text-mist-300">·</span>

          <span className="text-[11px] text-mist-500">
            {uniqueColors.length}{" "}
            {uniqueColors.length === 1 ? "color" : "colors"}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="text-[11px] text-mist-500">
            <span className="font-semibold text-cloud-100">
              {product.sold || 0}
            </span>{" "}
            sold
          </div>

          <div className="flex items-center gap-1">
            <Tooltip title="Quick Restock Inventory">
              <Button
                type="text"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => onRestock(product)}
                className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              />
            </Tooltip>

            <Tooltip title="Full Edit Product">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(product)}
                className="h-8 w-8 rounded-lg text-mist-600 hover:bg-mist-100 hover:text-emerald-700"
              />
            </Tooltip>

            <Tooltip title="View Product Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onViewDetails(product._id)}
                className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
              />
            </Tooltip>

            <Popconfirm
              title="Delete Apparel Product?"
              description={
                (product.sold || 0) > 0
                  ? "Warning: This product has sales records. Deletion might be rejected."
                  : "Are you sure you want to permanently delete this product?"
              }
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(product._id)}
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
        </div>
      </div>
    </GlassCard>
  );
}
