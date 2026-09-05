import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Tag,
  Skeleton,
  Popconfirm,
  Dropdown,
  Avatar,
  Steps,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  CopyOutlined,
  PrinterOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { toFileUrl } from "@/config";
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useMarkPreOrderReadyMutation,
  useDeleteOrderMutation,
} from "@/redux/features/orders/ordersApi";
import type { IOrderItem, OrderStatus } from "@/redux/features/orders/orders.types";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PRE_ORDER_STATUS_CONFIG,
  formatPrice,
  formatOrderDate,
  getCustomerInfo,
  getTransactionIdString,
  getPaymentIntentString,
} from "./orderHelpers";
import { PreOrderReadyModal } from "./components/PreOrderReadyModal";

export default function ShopOrderDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Query order by ID
  const {
    data: orderResponse,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(id, { skip: !id });

  // Mutations
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [markPreOrderReady, { isLoading: isMarkingReady }] = useMarkPreOrderReadyMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  // Pre-Order Modal State
  const [preOrderModalOpen, setPreOrderModalOpen] = useState(false);
  const [selectedPreOrderItem, setSelectedPreOrderItem] = useState<{
    item: IOrderItem;
    index: number;
  } | null>(null);

  const order = orderResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 1 }} className="max-w-xs" />
        <GlassCard>
          <Skeleton active paragraph={{ rows: 10 }} />
        </GlassCard>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<ShoppingOutlined className="text-5xl text-mist-400" />}
          title="Order Not Found"
          description="The requested customer order could not be located or has been deleted."
          actionLabel="Back to Orders Directory"
          onAction={() => navigate("/shop/orders")}
        />
      </div>
    );
  }

  const customer = getCustomerInfo(order.user);
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/20",
  };
  const payConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || {
    label: order.payment_status,
    color: "default",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/20",
  };

  // Status transitions
  const statusMenuItems: MenuProps["items"] = [
    {
      key: "processing",
      label: "Mark as Processing",
      icon: <SyncOutlined className="text-blue-500" />,
      disabled: order.status === "processing",
      onClick: async () => {
        try {
          await updateOrderStatus({ id: order._id, body: { status: "processing" } }).unwrap();
          toast.success("Order marked as Processing", {
            description: "Status notification dispatched to customer.",
          });
        } catch (err: any) {
          toast.error("Failed to update status", { description: err?.data?.message });
        }
      },
    },
    {
      key: "shipped",
      label: "Mark as Shipped",
      icon: <CarOutlined className="text-indigo-500" />,
      disabled: order.status === "shipped",
      onClick: async () => {
        try {
          await updateOrderStatus({ id: order._id, body: { status: "shipped" } }).unwrap();
          toast.success("Order marked as Shipped", {
            description: "Shipping notification email dispatched to customer.",
          });
        } catch (err: any) {
          toast.error("Failed to update status", { description: err?.data?.message });
        }
      },
    },
    {
      key: "delivered",
      label: "Mark as Delivered",
      icon: <CheckCircleOutlined className="text-teal-500" />,
      disabled: order.status === "delivered",
      onClick: async () => {
        try {
          await updateOrderStatus({ id: order._id, body: { status: "delivered" } }).unwrap();
          toast.success("Order marked as Delivered", {
            description: "Delivery receipt dispatched to customer.",
          });
        } catch (err: any) {
          toast.error("Failed to update status", { description: err?.data?.message });
        }
      },
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
      onClick: async () => {
        try {
          await updateOrderStatus({ id: order._id, body: { status: "cancelled" } }).unwrap();
          toast.success("Order cancelled", {
            description: "Cancellation email dispatched to customer.",
          });
        } catch (err: any) {
          toast.error("Failed to cancel order", { description: err?.data?.message });
        }
      },
    },
  ];

  const handleDelete = async () => {
    try {
      await deleteOrder(order._id).unwrap();
      toast.success("Order deleted permanently");
      navigate("/shop/orders");
    } catch (err: any) {
      toast.error("Failed to delete order", { description: err?.data?.message });
    }
  };

  const handleOpenPreOrderModal = (item: IOrderItem, index: number) => {
    setSelectedPreOrderItem({ item, index });
    setPreOrderModalOpen(true);
  };

  const handleConfirmPreOrderReady = async () => {
    if (!selectedPreOrderItem) return;
    try {
      await markPreOrderReady({
        orderId: order._id,
        itemIndex: selectedPreOrderItem.index,
      }).unwrap();
      toast.success("Pre-order stock allocated successfully", {
        description: "Variant inventory stock decremented and arrival email sent to customer.",
      });
      setPreOrderModalOpen(false);
      setSelectedPreOrderItem(null);
    } catch (err: any) {
      toast.error("FIFO Pre-Order allocation failed", {
        description: err?.data?.message || err?.message || "Stock check failed or older pre-order exists.",
      });
    }
  };

  // Stepper timeline current index
  const getStepCurrent = (status: OrderStatus) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      case "cancelled":
        return 1;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/shop/orders"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy-700/60 bg-white/80 text-mist-500 transition-colors hover:border-emerald-600 hover:text-emerald-700 shadow-2xs"
          >
            <ArrowLeftOutlined />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-mist-500">
              <Link to="/shop/products" className="hover:text-emerald-700 hover:underline">
                Shop
              </Link>
              <span>/</span>
              <Link to="/shop/orders" className="hover:text-emerald-700 hover:underline">
                Orders
              </Link>
              <span>/</span>
              <span className="font-mono font-medium text-cloud-100">
                {order.order_id || order._id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
              <h1 className="font-display text-xl font-bold tracking-tight text-[#0B3D2E]">
                Order {order.order_id}
              </h1>
              <Tag color={statusConfig.color} className="rounded-full border-0 text-xs font-semibold">
                {statusConfig.label}
              </Tag>
              <Tag color={payConfig.color} className="rounded-full border-0 text-xs font-semibold">
                {payConfig.label}
              </Tag>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Update Menu */}
          <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]} disabled={isUpdatingStatus}>
            <Button className="rounded-xl border-navy-700/60 bg-white font-medium">
              Update Status: <span className="font-bold text-emerald-800 ml-1">{statusConfig.label}</span>
              <MoreOutlined className="ml-1" />
            </Button>
          </Dropdown>

          {/* Print Receipt */}
          <Button
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
            className="rounded-xl border-navy-700/60 bg-white"
          >
            Print Receipt
          </Button>

          {/* Delete Order */}
          <Popconfirm
            title="Delete this order permanently?"
            description="This will permanently delete the customer order from database."
            onConfirm={handleDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} className="rounded-xl" />
          </Popconfirm>
        </div>
      </div>

      {/* Order Progression Stepper */}
      <GlassCard className="p-6 border border-navy-700/60 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-mist-500 mb-4">
          Fulfillment Lifecycle Tracker
        </div>
        <Steps
          current={getStepCurrent(order.status)}
          status={order.status === "cancelled" ? "error" : "process"}
          items={[
            {
              title: "Order Placed",
              description: formatOrderDate(order.createdAt),
            },
            {
              title: "Confirmed",
              description: order.payment_status === "paid" ? "Paid via Stripe" : "Awaiting Payment",
            },
            {
              title: "Processing",
              description: "Items picked & packed",
            },
            {
              title: "Shipped",
              description: "Handed to courier",
            },
            {
              title: "Delivered",
              description: "Package received",
            },
          ]}
        />
      </GlassCard>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Spans: Ordered Items & Shipping Destination */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ordered Items Table Card */}
          <GlassCard className="p-6 border border-navy-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-cloud-100 flex items-center gap-2">
                <ShoppingOutlined className="text-emerald-600" />
                Purchased Apparel & Merchandise ({order.items.length} unique items)
              </h3>
              <span className="text-xs font-semibold text-mist-500">
                Total Items: {order.total_items ?? order.items.reduce((s, i) => s + (i.quantity || 1), 0)}
              </span>
            </div>

            <div className="divide-y divide-navy-700/40">
              {order.items.map((item, idx) => {
                const imgUrl = item.image
                  ? toFileUrl(item.image)
                  : typeof item.product === "object" && item.product?.images?.[0]
                    ? toFileUrl(item.product.images[0])
                    : undefined;

                const preConfig = item.preOrderStatus
                  ? PRE_ORDER_STATUS_CONFIG[item.preOrderStatus]
                  : undefined;

                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Item Image & Description */}
                    <div className="flex items-center gap-3.5">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-navy-700/60 bg-navy-950/20">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-mist-400">
                            <ShoppingOutlined className="text-xl" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-display text-sm font-bold text-cloud-100 line-clamp-1">
                          {item.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-mist-600">
                          <span className="rounded-md bg-navy-950/30 px-2 py-0.5 font-medium">
                            Size: <strong className="text-cloud-100">{item.size}</strong>
                          </span>
                          <span className="rounded-md bg-navy-950/30 px-2 py-0.5 font-medium">
                            Color: <strong className="text-cloud-100">{item.color}</strong>
                          </span>
                          <span className="text-mist-500">
                            Qty: <strong className="text-cloud-100">{item.quantity}</strong> × {formatPrice(item.price)}
                          </span>
                        </div>

                        {/* Pre-Order Tag & Expected Date */}
                        {item.isPreOrder && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-400/40">
                              <ThunderboltOutlined className="text-[10px]" />
                              Pre-Order Item
                            </span>
                            {preConfig && (
                              <span
                                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${preConfig.bg} ${preConfig.text} ${preConfig.border}`}
                              >
                                {preConfig.label}
                              </span>
                            )}
                            {item.expectedAvailableDate && (
                              <span className="text-[11px] text-mist-500">
                                Expected: {formatOrderDate(String(item.expectedAvailableDate))}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Pre-Order Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <div className="font-display text-base font-bold text-emerald-800">
                        {formatPrice(item.total_price)}
                      </div>

                      {/* Action to Mark Ready if Confirmed Pre-Order */}
                      {item.isPreOrder && item.preOrderStatus === "confirmed" && (
                        <Button
                          size="small"
                          type="primary"
                          icon={<ThunderboltOutlined />}
                          onClick={() => handleOpenPreOrderModal(item, idx)}
                          className="btn-linear rounded-lg text-xs font-semibold"
                        >
                          Mark Ready
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Delivery Destination Card */}
          <GlassCard className="p-6 border border-navy-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-cloud-100 flex items-center gap-2">
                <EnvironmentOutlined className="text-emerald-600" />
                Shipping Destination & Contact
              </h3>
              <Tooltip title="Copy full delivery address">
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(order.formatted_address);
                    toast.success("Delivery address copied to clipboard");
                  }}
                  className="rounded-lg text-xs"
                >
                  Copy Address
                </Button>
              </Tooltip>
            </div>

            <div className="rounded-xl border border-navy-700/50 bg-navy-950/20 p-4 space-y-2.5 text-xs">
              <div>
                <span className="text-mist-500 block">Full Formatted Address:</span>
                <span className="font-semibold text-cloud-100 text-sm block mt-0.5">
                  {order.formatted_address}
                </span>
              </div>

              {order.address_breakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-navy-700/40">
                  <div>
                    <span className="text-mist-500 block">Street:</span>
                    <span className="font-medium text-cloud-100">{order.address_breakdown.street_address}</span>
                  </div>
                  <div>
                    <span className="text-mist-500 block">City:</span>
                    <span className="font-medium text-cloud-100">{order.address_breakdown.city}</span>
                  </div>
                  <div>
                    <span className="text-mist-500 block">Postal Code:</span>
                    <span className="font-medium text-cloud-100">{order.address_breakdown.postal_code}</span>
                  </div>
                  <div>
                    <span className="text-mist-500 block">Country:</span>
                    <span className="font-medium text-cloud-100">{order.address_breakdown.country}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-navy-700/40 flex items-center gap-2">
                <PhoneOutlined className="text-emerald-600" />
                <span className="text-mist-500">Contact Number:</span>
                <span className="font-bold text-cloud-100">{order.contact_number || customer.contact || "—"}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Span: Customer Card & Financial Breakdown */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <GlassCard className="p-5 border border-navy-700/60 shadow-xs">
            <h4 className="font-display text-sm font-bold text-cloud-100 mb-3 flex items-center gap-2">
              <UserOutlined className="text-violet-600" />
              Customer Profile
            </h4>

            <div className="flex items-center gap-3">
              <Avatar
                size={48}
                src={customer.image ? toFileUrl(customer.image) : undefined}
                icon={!customer.image ? <UserOutlined /> : undefined}
                className="border border-navy-700/60 bg-emerald-600/10 text-emerald-700 text-lg"
              />
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-bold text-cloud-100 truncate">
                  {customer.name}
                </div>
                <div className="text-xs text-mist-500 truncate flex items-center gap-1 mt-0.5">
                  <MailOutlined />
                  {customer.email}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Financial Breakdown Card */}
          <GlassCard className="p-5 border border-navy-700/60 shadow-xs">
            <h4 className="font-display text-sm font-bold text-cloud-100 mb-3 flex items-center gap-2">
              <CreditCardOutlined className="text-emerald-600" />
              Financial & Payment Summary
            </h4>

            <div className="divide-y divide-navy-700/40 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-mist-500">Payment Status:</span>
                <Tag color={payConfig.color} className="m-0 rounded-full border-0 font-semibold">
                  {payConfig.label}
                </Tag>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-mist-500">Products Subtotal:</span>
                <span className="font-semibold text-cloud-100">
                  {formatPrice(order.price_breakdown?.subtotal)}
                </span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-mist-500">Delivery Fee:</span>
                <span className="font-semibold text-cloud-100">
                  {order.price_breakdown?.delivery_charge === 0
                    ? "Free (Order >= $150)"
                    : formatPrice(order.price_breakdown?.delivery_charge)}
                </span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-mist-500">Tax (8.875%):</span>
                <span className="font-semibold text-cloud-100">
                  {formatPrice(order.price_breakdown?.tax)}
                </span>
              </div>

              {Boolean(order.price_breakdown?.discount_amount) && (
                <div className="py-2 flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.price_breakdown.discount_amount)}</span>
                </div>
              )}

              <div className="py-3 flex items-center justify-between text-sm font-bold border-t-2 border-emerald-600/30">
                <span className="text-cloud-100">Total Price Paid:</span>
                <span className="text-base text-emerald-800">
                  {formatPrice(order.price_breakdown?.total_price)}
                </span>
              </div>
            </div>

            {/* Payment Processor Details */}
            <div className="mt-4 rounded-xl border border-navy-700/50 bg-navy-950/20 p-3 space-y-1.5 text-[11px]">
              <div className="text-mist-500 font-semibold uppercase tracking-wider text-[10px]">
                Stripe Payment Details
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mist-500">Payment Intent:</span>
                <span className="font-mono text-cloud-100 truncate max-w-[130px]">
                  {getPaymentIntentString(order.payment_intent_id)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mist-500">Transaction ID:</span>
                <span className="font-mono text-cloud-100 truncate max-w-[130px]">
                  {getTransactionIdString(order.transaction_id)}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Back Button */}
          <Button block onClick={() => navigate("/shop/orders")} className="rounded-xl">
            Back to Orders List
          </Button>
        </div>
      </div>

      {/* Pre-Order Ready Confirmation Modal */}
      <PreOrderReadyModal
        open={preOrderModalOpen}
        item={selectedPreOrderItem?.item}
        loading={isMarkingReady}
        onCancel={() => {
          setPreOrderModalOpen(false);
          setSelectedPreOrderItem(null);
        }}
        onConfirm={handleConfirmPreOrderReady}
      />
    </div>
  );
}
