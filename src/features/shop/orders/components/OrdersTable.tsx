import { Link } from "react-router-dom";
import { Table, Tag, Button, Space, Popconfirm, Dropdown, Tooltip, Avatar, Popover } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  CopyOutlined,
  MoreOutlined,
  UserOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type { IOrder, OrderStatus } from "@/redux/features/orders/orders.types";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  formatPrice,
  formatOrderDate,
  getCustomerInfo,
} from "../orderHelpers";

interface OrdersTableProps {
  data: IOrder[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onView: (order: IOrder) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: "processing" | "shipped" | "delivered" | "cancelled") => void;
  isUpdatingStatus?: boolean;
}

export function OrdersTable({
  data,
  loading = false,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
  onDelete,
  onChangeStatus,
  isUpdatingStatus = false,
}: OrdersTableProps) {
  const getStatusMenuItems = (order: IOrder): MenuProps["items"] => [
    {
      key: "processing",
      label: "Mark as Processing",
      icon: <SyncOutlined className="text-blue-500" />,
      disabled: order.status === "processing",
      onClick: () => onChangeStatus(order._id, "processing"),
    },
    {
      key: "shipped",
      label: "Mark as Shipped",
      icon: <CarOutlined className="text-indigo-500" />,
      disabled: order.status === "shipped",
      onClick: () => onChangeStatus(order._id, "shipped"),
    },
    {
      key: "delivered",
      label: "Mark as Delivered",
      icon: <CheckCircleOutlined className="text-teal-500" />,
      disabled: order.status === "delivered",
      onClick: () => onChangeStatus(order._id, "delivered"),
    },
    {
      type: "divider",
    },
    {
      key: "cancelled",
      label: "Cancel Order",
      danger: true,
      icon: <CloseCircleOutlined />,
      disabled: order.status === "cancelled",
      onClick: () => onChangeStatus(order._id, "cancelled"),
    },
  ];

  const columns: ColumnsType<IOrder> = [
    {
      title: "Order ID",
      key: "order_id",
      width: 170,
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/shop/orders/${record._id}`}
            className="font-mono text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            {record.order_id || record._id.slice(-8).toUpperCase()}
          </Link>
          <Tooltip title="Copy Order ID">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(record.order_id || record._id);
                toast.success("Order ID copied to clipboard");
              }}
              className="rounded p-1 text-mist-400 hover:bg-black/5 hover:text-cloud-100"
            >
              <CopyOutlined className="text-xs" />
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 230,
      render: (_, record) => {
        const customer = getCustomerInfo(record.user);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={customer.image ? toFileUrl(customer.image) : undefined}
              icon={!customer.image ? <UserOutlined /> : undefined}
              className="shrink-0 border border-navy-700/60 bg-emerald-600/10 text-emerald-700"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-xs font-bold text-cloud-100">
                {customer.name}
              </div>
              <div className="truncate text-[11px] text-mist-500">
                {customer.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Items",
      key: "items",
      width: 220,
      render: (_, record) => {
        const hasPreOrder = record.items.some((it) => it.isPreOrder);
        const previewItems = record.items.slice(0, 3);
        const remainingCount = record.items.length - previewItems.length;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2 overflow-hidden">
                {previewItems.map((item, idx) => {
                  const imgUrl = item.image
                    ? toFileUrl(item.image)
                    : typeof item.product === "object" && item.product?.images?.[0]
                      ? toFileUrl(item.product.images[0])
                      : undefined;

                  return (
                    <Avatar
                      key={idx}
                      shape="square"
                      size="small"
                      src={imgUrl}
                      className="rounded-lg border-2 border-white shadow-2xs"
                    >
                      {item.name?.[0]}
                    </Avatar>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-cloud-100">
                {record.total_items ?? record.items.reduce((s, i) => s + (i.quantity || 1), 0)} items
              </span>
              {remainingCount > 0 && (
                <span className="text-[11px] text-mist-400 font-medium">
                  (+{remainingCount})
                </span>
              )}
            </div>

            {hasPreOrder && (
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-400/40">
                  <ThunderboltOutlined className="text-[9px]" />
                  Pre-Order Batch
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Total Amount",
      key: "total_price",
      width: 140,
      render: (_, record) => {
        const pb = record.price_breakdown;
        const popoverContent = (
          <div className="w-52 space-y-1.5 p-1 text-xs">
            <div className="flex justify-between text-mist-500">
              <span>Subtotal:</span>
              <span className="font-medium text-cloud-100">{formatPrice(pb?.subtotal)}</span>
            </div>
            <div className="flex justify-between text-mist-500">
              <span>Delivery Fee:</span>
              <span className="font-medium text-cloud-100">
                {pb?.delivery_charge === 0 ? "Free" : formatPrice(pb?.delivery_charge)}
              </span>
            </div>
            <div className="flex justify-between text-mist-500">
              <span>Tax (8.875%):</span>
              <span className="font-medium text-cloud-100">{formatPrice(pb?.tax)}</span>
            </div>
            {Boolean(pb?.discount_amount) && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-medium">-{formatPrice(pb.discount_amount)}</span>
              </div>
            )}
            <div className="border-t border-navy-700/40 pt-1.5 flex justify-between font-bold text-cloud-100">
              <span>Total:</span>
              <span className="text-emerald-700">{formatPrice(pb?.total_price)}</span>
            </div>
          </div>
        );

        return (
          <Popover content={popoverContent} title="Cost Breakdown" trigger="hover">
            <span className="cursor-help inline-flex rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/20">
              {formatPrice(record.price_breakdown?.total_price)}
            </span>
          </Popover>
        );
      },
    },
    {
      title: "Payment",
      key: "payment_status",
      width: 120,
      render: (_, record) => {
        const payConfig = PAYMENT_STATUS_CONFIG[record.payment_status] || {
          label: record.payment_status,
          color: "default",
        };

        return (
          <Tag
            color={payConfig.color}
            className="rounded-full border-0 text-[11px] font-semibold"
          >
            {payConfig.label}
          </Tag>
        );
      },
    },
    {
      title: "Order Status",
      key: "status",
      width: 150,
      render: (_, record) => {
        const statusConfig = ORDER_STATUS_CONFIG[record.status] || {
          label: record.status,
          color: "default",
        };

        return (
          <Dropdown
            menu={{ items: getStatusMenuItems(record) }}
            trigger={["click"]}
            disabled={isUpdatingStatus}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-2 py-1 hover:bg-black/5 transition-colors"
            >
              <Tag
                color={statusConfig.color}
                className="m-0 rounded-full border-0 text-[11px] font-semibold"
              >
                {statusConfig.label}
              </Tag>
              <MoreOutlined className="text-mist-400 text-xs" />
            </button>
          </Dropdown>
        );
      },
    },
    {
      title: "Date",
      key: "createdAt",
      width: 150,
      render: (_, record) => (
        <span className="text-xs text-mist-500">
          {formatOrderDate(record.createdAt)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View Full Order Receipt & Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              className="rounded-lg text-mist-500 hover:bg-emerald-50 hover:text-emerald-700"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this order permanently?"
            description="This will permanently delete the order record from database."
            onConfirm={() => onDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="rounded-lg hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <GlassCard className="border border-navy-700/60 p-0 overflow-hidden shadow-xs">
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: onPageChange,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (tot) => `Total ${tot} orders`,
          className: "px-4 py-3",
        }}
        scroll={{ x: 1100 }}
      />
    </GlassCard>
  );
}
