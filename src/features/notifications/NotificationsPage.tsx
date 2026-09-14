import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Segmented,
  Checkbox,
  Popconfirm,
  Pagination,
  Spin,
  Tooltip,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  DeleteOutlined,
  BellOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
  UserOutlined,
  ClearOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  type NotificationItem,
} from "@/redux/features/notification/notificationApi";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { SOCKET_URL, TOKEN_KEY } from "@/config";
import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import { resolveNotificationPath } from "@/lib/notificationPath";
import { getNotificationVisualMeta } from "@/lib/notificationIcons";
import { playNotificationSound } from "@/lib/notificationAudio";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { getImageUrl } from "@/lib/getImageUrl";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: profile } = useGetProfileQuery();
  const userId = profile?.data?._id;

  // Search & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: searchTerm,
  } = useDebouncedSearch();

  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">(
    "all",
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Query Params
  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      searchTerm?: string;
      seen?: boolean;
    } = {
      page,
      limit,
    };

    if (searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }

    if (statusFilter === "unread") {
      params.seen = false;
    } else if (statusFilter === "read") {
      params.seen = true;
    }

    return params;
  }, [page, limit, searchTerm, statusFilter]);

  // RTK Query
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery(queryParams, {
    skip: !userId,
  });

  const [readNotification] = useReadNotificationMutation();
  const [readAllNotifications, { isLoading: isReadingAll }] =
    useReadAllNotificationsMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAllNotifications, { isLoading: isClearingAll }] =
    useClearAllNotificationsMutation();

  const notifications = response?.data?.data ?? [];
  const unreadCount = response?.data?.unreadCount ?? 0;
  const pagination = response?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
  };

  // Socket.io real-time listener for live updates on this page
  useEffect(() => {
    if (!userId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem(TOKEN_KEY),
      },
    });

    const eventName = `getNotification::${userId}`;

    const handleRealtimePush = (newNotification: NotificationItem) => {
      playNotificationSound();
      toast(newNotification.title || "New Alert", {
        description:
          newNotification.message || "A new notification just arrived.",
        action: {
          label: "View",
          onClick: () => {
            const resolvedPath = resolveNotificationPath(newNotification.path);
            navigate(resolvedPath);
          },
        },
      });
      void refetch();
    };

    socket.on(eventName, handleRealtimePush);

    return () => {
      socket.off(eventName, handleRealtimePush);
      socket.disconnect();
    };
  }, [userId, refetch, navigate]);

  // Selection helpers
  const allCurrentPageSelected =
    notifications.length > 0 &&
    notifications.every((n) => selectedIds.includes(n._id));

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIdSet = new Set(notifications.map((n) => n._id));
      setSelectedIds((prev) => prev.filter((id) => !pageIdSet.has(id)));
    } else {
      const pageIds = notifications.map((n) => n._id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Actions
  const handleItemClick = (notification: NotificationItem) => {
    if (!notification.seen) {
      void readNotification({ id: notification._id });
    }
    const resolved = resolveNotificationPath(notification.path);
    navigate(resolved);
  };

  const handleToggleRead = (
    e: React.MouseEvent,
    notification: NotificationItem,
  ) => {
    e.stopPropagation();
    if (!notification.seen) {
      void readNotification({ id: notification._id })
        .unwrap()
        .then(() => toast.success("Marked as read"))
        .catch(() => toast.error("Failed to mark as read"));
    }
  };

  const handleDeleteSingle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    void deleteNotification({ id })
      .unwrap()
      .then(() => {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        toast.success("Notification deleted");
      })
      .catch(() => toast.error("Failed to delete notification"));
  };

  const handleReadAll = () => {
    if (unreadCount === 0) return;
    toast.promise(readAllNotifications().unwrap(), {
      loading: "Marking all as read…",
      success: "All notifications marked as read.",
      error: "Couldn't update notifications.",
    });
  };

  const handleClearAll = () => {
    if (pagination.total === 0) return;
    toast.promise(clearAllNotifications().unwrap(), {
      loading: "Clearing all notifications…",
      success: "All notification history cleared.",
      error: "Failed to clear notifications.",
    });
    setSelectedIds([]);
  };

  // Batch actions on selected
  const handleBatchMarkRead = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(
        selectedIds.map((id) => readNotification({ id }).unwrap()),
      );
      toast.success(`${selectedIds.length} notifications marked as read.`);
      setSelectedIds([]);
    } catch {
      toast.error("Some notifications could not be updated.");
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(
        selectedIds.map((id) => deleteNotification({ id }).unwrap()),
      );
      toast.success(`${selectedIds.length} notifications deleted.`);
      setSelectedIds([]);
    } catch {
      toast.error("Some notifications could not be deleted.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <GlassCard className="relative overflow-hidden bg-linear-to-br from-white via-white to-emerald-50/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3D2E] text-white shadow-md shadow-emerald-950/20">
                <BellOutlined className="text-xl" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900 md:text-2xl">
                  Notification Center
                </h1>
                <p className="text-xs text-slate-500">
                  Manage real-time updates, activity alerts, and platform
                  announcements
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => void refetch()}
              className="rounded-lg border-slate-200 text-slate-600 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
            >
              Refresh
            </Button>

            {unreadCount > 0 && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={isReadingAll}
                onClick={handleReadAll}
                className="bg-[#0B3D2E] hover:bg-emerald-800! border-0 rounded-lg shadow-sm font-medium"
              >
                Mark all as read
              </Button>
            )}

            {pagination.total > 0 && (
              <Popconfirm
                title="Clear all notifications?"
                description="This will permanently delete all your notification history."
                okText="Yes, Clear All"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={handleClearAll}
              >
                <Button
                  danger
                  icon={<ClearOutlined />}
                  loading={isClearingAll}
                  className="rounded-lg hover:bg-rose-50"
                >
                  Clear All
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-slate-100 pt-4">
          <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60">
            <span className="text-xs font-medium text-slate-500">
              Total Alerts
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-slate-900">
                {pagination.total}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200/60">
            <span className="text-xs font-medium text-emerald-700">Unread</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-emerald-800">
                {unreadCount}
              </span>
              {unreadCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60">
            <span className="text-xs font-medium text-slate-500">Read</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-slate-700">
                {Math.max(0, pagination.total - unreadCount)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60">
            <span className="text-xs font-medium text-slate-500">
              Live Push Sync
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-800">
                Connected
              </span>
              <WifiOutlined className="text-xs text-emerald-600 ml-auto" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search notifications by title or message…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            className="h-10 w-full max-w-md rounded-xl border-slate-200 bg-white hover:border-[#0B3D2E]/40 focus:border-[#0B3D2E] shadow-xs"
          />

          <Segmented
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as "all" | "unread" | "read");
              setPage(1);
            }}
            options={[
              { label: `All (${pagination.total})`, value: "all" },
              { label: `Unread (${unreadCount})`, value: "unread" },
              {
                label: `Read (${Math.max(0, pagination.total - unreadCount)})`,
                value: "read",
              },
            ]}
            className="bg-slate-200/60 p-1 rounded-xl text-xs font-medium"
          />
        </div>
      </div>

      {/* Batch Action Bar (if selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs font-medium text-emerald-900">
              notifications selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={handleBatchMarkRead}
              className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
            >
              Mark Read
            </Button>

            <Popconfirm
              title={`Delete ${selectedIds.length} notifications?`}
              description="This action cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={handleBatchDelete}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="hover:bg-rose-50"
              >
                Delete
              </Button>
            </Popconfirm>

            <Button
              size="small"
              type="text"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500"
            >
              Deselect
            </Button>
          </div>
        </div>
      )}

      {/* Notification Items List */}
      <div className="space-y-3">
        {/* Table header row with Select All */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allCurrentPageSelected}
                onChange={toggleSelectAll}
                className="text-slate-600"
              >
                <span className="font-medium">Select all on this page</span>
              </Checkbox>
            </div>
            <span>
              Showing {notifications.length} of {pagination.total}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin
              indicator={
                <LoadingOutlined className="text-3xl text-[#0B3D2E]" spin />
              }
            />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<BellOutlined />}
            title={
              searchTerm
                ? "No matching notifications"
                : statusFilter === "unread"
                  ? "No unread notifications"
                  : "Your notification inbox is clean"
            }
            description={
              searchTerm
                ? `No alerts matched your search "${searchTerm}".`
                : statusFilter === "unread"
                  ? "You have already caught up with all incoming activity."
                  : "New updates from donations, orders, applications, and transactions will appear here."
            }
            actionLabel={searchTerm ? "Clear Search" : undefined}
            onAction={searchTerm ? () => setSearchInput("") : undefined}
          />
        ) : (
          notifications.map((notification) => {
            const unread = !notification.seen;
            const visual = getNotificationVisualMeta(
              notification.title,
              notification.path,
            );
            const isSelected = selectedIds.includes(notification._id);
            const sender =
              typeof notification.sender === "object" && notification.sender
                ? notification.sender
                : null;
            const targetPath = resolveNotificationPath(notification.path);

            return (
              <div
                key={notification._id}
                onClick={() => handleItemClick(notification)}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 cursor-pointer",
                  unread
                    ? "border-emerald-200/90 bg-emerald-50/40 shadow-xs hover:border-emerald-300 hover:bg-emerald-50/70"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs",
                  isSelected &&
                    "ring-2 ring-emerald-600 border-transparent bg-emerald-50/60",
                )}
              >
                {/* Left section: Checkbox + Icon + Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Checkbox */}
                  <div
                    className="pt-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(notification._id);
                    }}
                  >
                    <Checkbox checked={isSelected} />
                  </div>

                  {/* Visual Category Icon */}
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg shadow-xs transition-transform duration-200 group-hover:scale-105",
                      visual.bgClass,
                      visual.borderClass,
                    )}
                  >
                    {visual.icon}
                  </div>

                  {/* Text Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={cn(
                          "text-sm",
                          unread
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-800",
                        )}
                      >
                        {notification.title}
                      </h4>

                      {unread && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          New
                        </span>
                      )}

                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border",
                          visual.badgeClass,
                        )}
                      >
                        {visual.category}
                      </span>
                    </div>

                    {notification.message && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 max-w-3xl">
                        {notification.message}
                      </p>
                    )}

                    {/* Sender + Timestamp Metadata */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      {sender && (
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            size={18}
                            src={getImageUrl(sender.image)}
                            icon={<UserOutlined />}
                            className="border border-slate-200"
                          />
                          <span className="font-medium text-slate-700">
                            {sender.name || sender.email}
                          </span>
                        </div>
                      )}

                      <Tooltip title={formatDateTime(notification.createdAt)}>
                        <span className="text-slate-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </Tooltip>

                      <span className="text-slate-300">·</span>

                      {/* Route destination indicator */}
                      <span className="text-slate-400 font-mono text-[10px]">
                        Destination: {targetPath}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right section: Deep Link & Action Buttons */}
                <div
                  className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="small"
                    type="default"
                    icon={<ArrowRightOutlined />}
                    onClick={() => handleItemClick(notification)}
                    className="rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
                  >
                    View Resource
                  </Button>

                  {unread && (
                    <Tooltip title="Mark as read">
                      <Button
                        size="small"
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={(e) => handleToggleRead(e, notification)}
                        className="h-8 w-8 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                      />
                    </Tooltip>
                  )}

                  <Popconfirm
                    title="Delete notification?"
                    description="Are you sure you want to remove this notification?"
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    onConfirm={(e) => {
                      if (e) handleDeleteSingle(e, notification._id);
                    }}
                  >
                    <Tooltip title="Delete">
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="h-8 w-8 rounded-lg hover:bg-rose-50"
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Pagination */}
      {pagination.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row shadow-xs">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
            notifications
          </span>

          <Pagination
            current={page}
            pageSize={limit}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={["10", "20", "50"]}
            onChange={(newPage, newLimit) => {
              setPage(newPage);
              setLimit(newLimit);
            }}
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
}
