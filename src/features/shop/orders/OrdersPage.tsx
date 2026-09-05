import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from "@/redux/features/orders/ordersApi";
import type {
  IOrder,
  OrderStats,
  PaymentStatus,
} from "@/redux/features/orders/orders.types";
import { OrderStatsHeader } from "./components/OrderStatsHeader";
import { OrderFiltersBar } from "./components/OrderFiltersBar";
import { OrdersTable } from "./components/OrdersTable";

export default function ShopOrdersPage() {
  const navigate = useNavigate();

  // Filter and pagination states
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all" | "">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Main paginated query
  const {
    data: ordersResponse,
    isLoading: isLoadingOrders,
    isFetching: isFetchingOrders,
    refetch: refetchOrders,
  } = useGetOrdersQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch,
    status: activeStatus === "all" ? undefined : (activeStatus as any),
    payment_status: paymentStatus === "all" ? undefined : paymentStatus,
  });

  // Mutations
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  // Extracted data
  const orders = ordersResponse?.data ?? [];
  const pagination = ordersResponse?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: orders.length,
    totalPage: 1,
  };

  // Compute lightweight KPI stats from query response
  const stats: OrderStats = useMemo(() => {
    let totalRevenue = 0;
    let inFulfillment = 0;
    let delivered = 0;

    orders.forEach((ord) => {
      if (typeof ord.price_breakdown?.total_price === "number") {
        totalRevenue += ord.price_breakdown.total_price;
      }
      if (ord.status === "confirmed" || ord.status === "processing") {
        inFulfillment++;
      }
      if (ord.status === "delivered") {
        delivered++;
      }
    });

    return {
      totalOrders: pagination.total,
      totalRevenue,
      inFulfillmentCount:
        activeStatus === "processing" || activeStatus === "confirmed"
          ? pagination.total
          : inFulfillment,
      deliveredCount: activeStatus === "delivered" ? pagination.total : delivered,
    };
  }, [orders, pagination.total, activeStatus]);

  // Handlers
  const handleStatusTabChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handlePaymentStatusChange = (status: PaymentStatus | "all" | "") => {
    setPaymentStatus(status);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleViewOrder = (order: IOrder) => {
    navigate(`/shop/orders/${order._id}`);
  };

  const handleChangeStatus = async (
    id: string,
    status: "processing" | "shipped" | "delivered" | "cancelled"
  ) => {
    try {
      await updateOrderStatus({ id, body: { status } }).unwrap();
      toast.success("Order status updated", {
        description: `Customer in-app alert & notification email sent.`,
      });
    } catch (err: any) {
      toast.error("Failed to update status", {
        description: err?.data?.message || err?.message || "An error occurred.",
      });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id).unwrap();
      toast.success("Order deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete order", {
        description: err?.data?.message || "An error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Store Orders
          </h1>
          <p className="mt-1 text-sm text-mist-600">
            Monitor and fulfill customer merchandise purchases, payment receipts, and pre-order batches.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <OrderStatsHeader
        stats={stats}
        loading={isLoadingOrders}
        activeStatusFilter={activeStatus}
        onSelectStatus={handleStatusTabChange}
      />

      {/* Filter Bar */}
      <OrderFiltersBar
        activeStatus={activeStatus}
        onStatusChange={handleStatusTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={handlePaymentStatusChange}
        totalCount={pagination.total}
        onRefresh={() => refetchOrders()}
        isFetching={isFetchingOrders}
      />

      {/* Content: Table or Empty State */}
      {isLoadingOrders ? (
        <div className="flex h-72 items-center justify-center">
          <Spin size="large" tip="Loading store orders..." />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingOutlined className="text-5xl text-mist-400" />}
          title="No orders found"
          description={
            searchTerm || activeStatus !== "all" || paymentStatus !== "all"
              ? "No orders match your current filter parameters. Try clearing the search or status filters."
              : "No customer orders have been received in the store yet."
          }
        />
      ) : (
        <OrdersTable
          data={orders}
          loading={isFetchingOrders}
          page={page}
          pageSize={pageSize}
          total={pagination.total}
          onPageChange={handlePageChange}
          onView={handleViewOrder}
          onDelete={handleDeleteOrder}
          onChangeStatus={handleChangeStatus}
          isUpdatingStatus={isUpdatingStatus}
        />
      )}
    </div>
  );
}
