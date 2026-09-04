import { useMemo } from "react";
import { Table, Button, Dropdown, Popconfirm, Tag, Tooltip } from "antd";
import type { TableProps, MenuProps } from "antd";
import {
  StarFilled,
  StarOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  InboxOutlined,
} from "@ant-design/icons";
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

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetails: (id: string) => void;
  onEdit: (product: Product) => void;
  onRestock: (product: Product) => void;
  onToggleFeatured: (id: string) => void;
  onChangeStatus: (id: string, status: ProductStatus) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({
  products,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onViewDetails,
  onEdit,
  onRestock,
  onToggleFeatured,
  onChangeStatus,
  onDelete,
}: ProductTableProps) {
  const statusMenuItems: MenuProps["items"] = [
    { key: "active", label: "Active (Live in Store)" },
    { key: "draft", label: "Draft" },
    { key: "inactive", label: "Inactive" },
    { key: "archived", label: "Archived" },
  ];

  const columns: TableProps<Product>["columns"] = useMemo(
    () => [
      {
        title: "Product & Style",
        key: "Product",
        render: (_: unknown, record: Product) => {
          const firstImg = record.images?.[0]
            ? toFileUrl(record.images[0])
            : null;
          const genderConfig =
            GENDER_CONFIG[record.gender] || GENDER_CONFIG.unisex;

          return (
            <div className="flex items-center gap-3">
              <div
                onClick={() => onViewDetails(record._id)}
                className="h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                {firstImg ? (
                  <img
                    src={firstImg}
                    alt={record.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-mist-400">
                    <InboxOutlined className="text-xl" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={() => onViewDetails(record._id)}
                    className="cursor-pointer font-bold text-cloud-100 hover:text-emerald-700 transition-colors line-clamp-1"
                  >
                    {record.name}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${genderConfig.bg} ${genderConfig.text} border ${genderConfig.border}`}
                  >
                    {genderConfig.label}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-mist-500">
                  {record.variants?.length || 0} variants ·{" "}
                  {record.tags?.slice(0, 3).join(", ") || "clothing"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: "Category",
        key: "category",
        width: 150,
        render: (_: unknown, record: Product) => (
          <Tag className="rounded-full border-emerald-200 bg-emerald-50/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            {getCategoryName(record.category)}
          </Tag>
        ),
      },
      {
        title: "Price & Discount",
        key: "price",
        width: 140,
        render: (_: unknown, record: Product) => {
          const discount = calculateDiscountPercent(
            record.price,
            record.compareAtPrice,
          );

          return (
            <div>
              <div className="font-extrabold text-cloud-100">
                {formatPrice(record.price)}
              </div>
              {record.compareAtPrice &&
                record.compareAtPrice > record.price && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-mist-400 line-through">
                      {formatPrice(record.compareAtPrice)}
                    </span>
                    {discount && (
                      <span className="font-bold text-rose-600">
                        -{discount}%
                      </span>
                    )}
                  </div>
                )}
            </div>
          );
        },
      },
      {
        title: "Sizes & Colors",
        key: "variants",
        width: 160,
        render: (_: unknown, record: Product) => {
          const uniqueSizes = Array.from(
            new Set((record.variants || []).map((v) => v.size)),
          );
          const uniqueColors = Array.from(
            new Set((record.variants || []).map((v) => v.color)),
          );

          return (
            <div>
              <div className="flex flex-wrap gap-1">
                {uniqueSizes.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded bg-gray-100 px-1 py-0.2 text-[10px] font-semibold text-mist-700"
                  >
                    {s}
                  </span>
                ))}
                {uniqueSizes.length > 4 && (
                  <span className="text-[10px] text-mist-400">
                    +{uniqueSizes.length - 4}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-mist-500">
                {uniqueColors.slice(0, 2).join(", ")}
                {uniqueColors.length > 2 && ` +${uniqueColors.length - 2}`}
              </div>
            </div>
          );
        },
      },
      {
        title: "Stock Units",
        key: "stock",
        width: 130,
        render: (_: unknown, record: Product) => {
          const total = getTotalStock(record.variants);
          const hasPreOrder = (record.variants || []).some((v) => v.isPreOrder);

          if (total > 0) {
            return (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-cloud-100">{total}</span>
                <span className="text-xs text-mist-500">units</span>
              </div>
            );
          }
          if (hasPreOrder) {
            return (
              <Tag className="rounded-full border-amber-200 bg-amber-50 text-xs font-semibold text-amber-800">
                Pre-Order
              </Tag>
            );
          }
          return (
            <Tag className="rounded-full border-rose-200 bg-rose-50 text-xs font-semibold text-rose-800">
              Sold Out
            </Tag>
          );
        },
      },
      {
        title: "Sold",
        dataIndex: "sold",
        key: "sold",
        width: 90,
        render: (sold?: number) => (
          <span className="font-semibold text-cloud-100">{sold || 0}</span>
        ),
      },
      {
        title: "Spotlight",
        key: "featured",
        width: 90,
        align: "center",
        render: (_: unknown, record: Product) => (
          <Tooltip
            title={
              record.featured
                ? "Remove from Homepage Spotlight"
                : "Feature on Homepage Spotlight"
            }
          >
            <button
              type="button"
              onClick={() => onToggleFeatured(record._id)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                record.featured
                  ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                  : "text-mist-400 hover:bg-gray-100 hover:text-amber-500"
              }`}
            >
              {record.featured ? (
                <StarFilled className="text-base" />
              ) : (
                <StarOutlined className="text-base" />
              )}
            </button>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        key: "status",
        width: 120,
        render: (_: unknown, record: Product) => {
          const statusInfo =
            STATUS_CONFIG[record.status] || STATUS_CONFIG.active;
          return (
            <Dropdown
              menu={{
                items: statusMenuItems,
                onClick: ({ key }) =>
                  onChangeStatus(record._id, key as ProductStatus),
              }}
              trigger={["click"]}
            >
              <button
                type="button"
                className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  record.status === "active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : record.status === "draft"
                      ? "border-gray-200 bg-gray-50 text-gray-600"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {statusInfo.label} ▾
              </button>
            </Dropdown>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 140,
        align: "right",
        render: (_: unknown, record: Product) => (
          <div className="flex items-center justify-end gap-1">
            <Tooltip title="Quick Restock">
              <Button
                type="text"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => onRestock(record)}
                className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50"
              />
            </Tooltip>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onViewDetails(record._id)}
                className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50"
              />
            </Tooltip>
            <Tooltip title="Edit Product">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                className="h-8 w-8 rounded-lg text-mist-600 hover:bg-mist-100"
              />
            </Tooltip>
            <Popconfirm
              title="Delete Product?"
              description="Are you sure you want to delete this apparel Product?"
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record._id)}
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
    [
      onViewDetails,
      onEdit,
      onRestock,
      onToggleFeatured,
      onChangeStatus,
      onDelete,
    ],
  );

  return (
    <Table<Product>
      rowKey="_id"
      columns={columns}
      dataSource={products}
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: true,
        className: "p-4! m-0!",
      }}
    />
  );
}
