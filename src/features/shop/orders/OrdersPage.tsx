import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin } from "antd";
import { ShoppingOutlined, UserOutlined } from "@ant-design/icons";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchTerm = searchParams.get("searchTerm") || "";
  const userParam = searchParams.get("user") || undefined;

  // Track the last processed URL search param to avoid reverting user input or clearing
  const lastProcessedUrlQuery = useRef(urlSearchTerm);

  // Filter and pagination states
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all" | "">("all");
  const [searchTerm, setSearchTerm] = useState<string>(urlSearchTerm);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearchTerm);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sync state ONLY if URL query changes externally (e.g. browser navigation or external link)
  useEffect(() => {
    const currentUrlParam = searchParams.get("searchTerm") || "";
    if (currentUrlParam !== lastProcessedUrlQuery.current) {
      lastProcessedUrlQuery.current = currentUrlParam;
      setSearchTerm(currentUrlParam);
      setDebouncedSearch(currentUrlParam);
      setPage(1);
    }
  }, [searchParams]);

  // Debounce search input & sync to URL query params
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);

      const currentParam = searchParams.get("searchTerm") || "";
      const trimmed = searchTerm.trim();
      if (trimmed !== currentParam) {
        lastProcessedUrlQuery.current = trimmed;
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (trimmed) {
              next.set("searchTerm", trimmed);
            } else {
              next.delete("searchTerm");
            }
            return next;
          },
          { replace: true }
        );
      }
    }, searchTerm ? 350 : 50);
    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, setSearchParams]);

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
    user: userParam,
  });

  // Mutations
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  // Extracted data
  const orders = useMemo(() => ordersResponse?.data ?? [], [ordersResponse?.data]);
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

      {/* Active User Filter Chip */}
      {userParam && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-emerald-700" />
            <span>
              Filtering orders for Customer ID:{" "}
              <span className="font-mono font-bold text-emerald-950">{userParam}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete("user");
                  return next;
                },
                { replace: true }
              );
              setPage(1);
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-200/60 hover:text-emerald-950 transition cursor-pointer"
          >
            Clear User Filter ✕
          </button>
        </div>
      )}

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
            searchTerm || activeStatus !== "all" || paymentStatus !== "all" || userParam
              ? "No orders match your current filter parameters. Try clearing the search, user, or status filters."
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
