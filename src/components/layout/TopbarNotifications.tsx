import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Popconfirm, Segmented, Spin, Tooltip } from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";
import {
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  type NotificationItem,
} from "@/redux/features/notification/notificationApi";
import { SOCKET_URL, TOKEN_KEY } from "@/config";
import { cn, formatRelativeTime } from "@/lib/utils";
import { resolveNotificationPath } from "@/lib/notificationPath";
import { playNotificationSound } from "@/lib/notificationAudio";
import { getNotificationVisualMeta } from "@/lib/notificationIcons";

interface TopbarNotificationsProps {
  userId?: string;
}

export function TopbarNotifications({ userId }: TopbarNotificationsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    data: notificationRes,
    refetch,
    isLoading,
  } = useGetNotificationsQuery({ page: 1, limit: 15 }, { skip: !userId });

  const [readNotification] = useReadNotificationMutation();
  const [readAllNotifications, { isLoading: isMarkingAll }] =
    useReadAllNotificationsMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAllNotifications, { isLoading: isClearingAll }] =
    useClearAllNotificationsMutation();

  const allNotifications = notificationRes?.data?.data ?? [];
  const unreadCount = notificationRes?.data?.unreadCount ?? 0;

  const filteredNotifications =
    activeTab === "unread"
      ? allNotifications.filter((n) => !n.seen)
      : allNotifications;

  // Real-time socket listener
  useEffect(() => {
    if (!userId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem(TOKEN_KEY),
      },
    });

    const eventName = `getNotification::${userId}`;

    const handleNewNotification = (newNotification: NotificationItem) => {
      // 1. Play subtle audio chime
      playNotificationSound();

      // 2. Trigger notification toast
      toast(newNotification.title || "New Notification", {
        description: newNotification.message || "You have a new update.",
        action: {
          label: "View",
          onClick: () => {
            const resolvedPath = resolveNotificationPath(newNotification.path);
            navigate(resolvedPath);
          },
        },
      });

      // 3. Refetch notifications query
      void refetch();
    };

    socket.on(eventName, handleNewNotification);

    return () => {
      socket.off(eventName, handleNewNotification);
      socket.disconnect();
    };
  }, [userId, refetch, navigate]);

  // Close on outside click or escape
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleNotificationClick = (notification: NotificationItem) => {
    setOpen(false);

    if (!notification.seen) {
      void readNotification({ id: notification._id });
    }

    const targetPath = resolveNotificationPath(notification.path);
    navigate(targetPath);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    void readNotification({ id })
      .unwrap()
      .then(() => toast.success("Marked as read."))
      .catch(() => toast.error("Failed to update notification."));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    void deleteNotification({ id })
      .unwrap()
      .then(() => toast.success("Notification removed."))
      .catch(() => toast.error("Failed to delete notification."));
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
    if (!allNotifications.length) return;
    toast.promise(clearAllNotifications().unwrap(), {
      loading: "Clearing all notifications…",
      success: "All notifications cleared.",
      error: "Couldn't clear notifications.",
    });
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Topbar Bell Button */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-600 transition-all duration-200",
          "hover:border-[#0B3D2E]/30 hover:bg-slate-100 hover:text-[#0B3D2E] active:scale-95",
          open && "border-[#0B3D2E] bg-emerald-50 text-[#0B3D2E] shadow-sm",
        )}
      >
        <Badge
          count={unreadCount}
          size="small"
          overflowCount={99}
          offset={[2, -2]}
          style={{
            backgroundColor: "#0B3D2E",
            boxShadow: "0 0 0 2px #ffffff",
            fontSize: "10px",
            fontWeight: 700,
          }}
        >
          <BellOutlined className="text-[17px]" />
        </Badge>
      </button>

      {/* Popover Card */}
      {open && (
        <div className="absolute right-0 top-12 z-50 flex w-95 max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:w-102.5">
          {/* Header */}
          <div className="relative border-b border-slate-100 px-4 py-3.5 bg-linear-to-r from-slate-50/80 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Notifications
                </h3>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    All caught up
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Tooltip title="Mark all as read">
                    <Button
                      size="small"
                      type="text"
                      icon={<CheckOutlined />}
                      loading={isMarkingAll}
                      onClick={handleReadAll}
                      className="h-7 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800!"
                    >
                      Read all
                    </Button>
                  </Tooltip>
                )}

                {allNotifications.length > 0 && (
                  <Popconfirm
                    title="Clear all notifications?"
                    description="This will permanently delete all your notifications."
                    okText="Clear All"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleClearAll}
                  >
                    <Tooltip title="Clear all history">
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={isClearingAll}
                        className="h-7 w-7 rounded-lg hover:bg-rose-50"
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
              </div>
            </div>

            {/* Segmented Filter: All vs Unread */}
            <div className="mt-2.5">
              <Segmented
                value={activeTab}
                onChange={(val) => setActiveTab(val as "all" | "unread")}
                size="small"
                block
                options={[
                  { label: `All (${allNotifications.length})`, value: "all" },
                  { label: `Unread (${unreadCount})`, value: "unread" },
                ]}
                className="bg-slate-100/90 text-xs p-0.5"
              />
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-95 overflow-y-auto divide-y divide-slate-100">
            {isLoading && allNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Spin
                  indicator={
                    <LoadingOutlined className="text-[#0B3D2E] text-2xl" spin />
                  }
                />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0B3D2E]">
                  <BellOutlined className="text-xl" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {activeTab === "unread"
                    ? "No unread notifications"
                    : "All caught up!"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {activeTab === "unread"
                    ? "You have read all received alerts."
                    : "No notifications found in your inbox."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const unread = !notification.seen;
                const visual = getNotificationVisualMeta(
                  notification.title,
                  notification.path,
                );

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-3 p-3.5 transition-all duration-150",
                      unread
                        ? "bg-emerald-50/40 hover:bg-emerald-50/75"
                        : "bg-white hover:bg-slate-50",
                    )}
                  >
                    {/* Left Category Icon */}
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm shadow-xs",
                        visual.bgClass,
                        visual.borderClass,
                      )}
                    >
                      {visual.icon}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <p
                          className={cn(
                            "text-xs leading-snug line-clamp-1",
                            unread
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-700",
                          )}
                        >
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      {notification.message && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                          {notification.message}
                        </p>
                      )}

                      {/* Path preview badge & hover actions */}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium border",
                            visual.badgeClass,
                          )}
                        >
                          {visual.category}
                        </span>

                        {/* Quick action buttons on hover */}
                        <div
                          className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {unread && (
                            <Tooltip title="Mark as read">
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleMarkAsRead(e, notification._id)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              >
                                <CheckOutlined className="text-[10px]" />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, notification._id)}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-400 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <DeleteOutlined className="text-[10px]" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator dot */}
                    {unread && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Popover Footer */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3D2E] hover:text-emerald-700 transition"
            >
              <span>View all notifications</span>
              <ArrowRightOutlined className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
