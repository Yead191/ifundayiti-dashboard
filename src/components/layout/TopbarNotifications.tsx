import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Spin } from "antd";
import { BellOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";
import {
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  type NotificationItem,
} from "@/redux/features/notification/notificationApi";
import { SOCKET_URL, TOKEN_KEY } from "@/config";
import { cn, formatDateTime } from "@/lib/utils";
import { resolveNotificationPath } from "@/lib/notificationPath";

const PAGE_SIZE = 10;

interface TopbarNotificationsProps {
  userId?: string;
}

export function TopbarNotifications({ userId }: TopbarNotificationsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data: notificationRes,
    refetch: refetchNotifications,
    isFetching,
    isLoading,
  } = useGetNotificationsQuery(
    { page, limit: PAGE_SIZE },
    { skip: !userId }
  );

  const [readNotification] = useReadNotificationMutation();
  const [readAllNotifications] = useReadAllNotificationsMutation();

  const notifications = notificationRes?.data?.data ?? [];
  const unreadCount = notificationRes?.data?.unreadCount ?? 0;
  const pagination = notificationRes?.pagination;
  const hasMore = (pagination?.page ?? 1) < (pagination?.totalPage ?? 1);

  const resetAndRefetch = useCallback(() => {
    setPage(1);
    // When already on page 1, force a refetch; otherwise page change triggers merge reset.
    if (page === 1) {
      void refetchNotifications();
    }
  }, [page, refetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem(TOKEN_KEY),
      },
    });

    const eventName = `getNotification::${userId}`;
    socket.on(eventName, resetAndRefetch);

    return () => {
      socket.off(eventName, resetAndRefetch);
      socket.disconnect();
    };
  }, [resetAndRefetch, userId]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
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

  // Infinite scroll — load next page when the sentinel enters the list viewport.
  useEffect(() => {
    if (!open || !hasMore) return;
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !isFetching) {
          setPage((current) => current + 1);
        }
      },
      { root, rootMargin: "80px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, isFetching, notifications.length]);

  const handleNotificationClick = (notification: NotificationItem) => {
    setOpen(false);

    const targetPath = resolveNotificationPath(notification.path);
    if (targetPath) {
      navigate(targetPath);
    }

    if (!notification.seen) {
      readNotification({ id: notification._id })
        .unwrap()
        .catch(() => {
          toast.error("Couldn't mark notification as read.");
        });
    }
  };

  const handleReadAll = () => {
    if (!notifications.length || unreadCount === 0) return;
    setPage(1);

    toast.promise(readAllNotifications().unwrap(), {
      loading: "Marking all as read…",
      success: "All notifications marked as read.",
      error: "Couldn't update notifications.",
    });
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) setPage(1);
            return next;
          });
        }}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full text-mist-400 transition",
          "hover:bg-white/5 hover:text-cloud-100",
          open && "bg-violet-600/15 text-violet-glow"
        )}
      >
        <Badge
          count={unreadCount}
          size="small"
          overflowCount={99}
          offset={[-2, 2]}
          style={{
            backgroundColor: "#8131F0",
            boxShadow: "0 0 0 2px #090b1b",
          }}
        >
          <BellOutlined className="text-[16px]" />
        </Badge>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 flex w-88 flex-col overflow-hidden rounded-2xl border border-navy-700/70 bg-linear-to-b from-[#171b3a] to-[#10132c] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)] sm:w-96">
          <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-violet-600/25 blur-[50px]" />
          <div className="pointer-events-none absolute -left-8 top-20 h-28 w-28 rounded-full bg-warning/8 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3 border-b border-navy-700/60 px-4 py-3.5">
            <div>
              <p className="font-display text-sm font-semibold text-cloud-100">Notifications</p>
              <p className="mt-0.5 text-xs text-mist-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
                {pagination?.total != null ? ` · ${pagination.total} total` : ""}
              </p>
            </div>
            <Button
              size="small"
              type="text"
              icon={<CheckOutlined />}
              onClick={handleReadAll}
              disabled={!unreadCount || isFetching}
              className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow! disabled:text-mist-600!"
            >
              Read all
            </Button>
          </div>

          <div ref={listRef} className="relative max-h-112 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Spin indicator={<LoadingOutlined className="text-violet-glow" spin />} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-800/80 text-mist-500">
                  <BellOutlined className="text-lg" />
                </span>
                <p className="mt-3 text-sm font-medium text-cloud-100">No notifications</p>
                <p className="mt-1 text-xs text-mist-500">New alerts will show up here.</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => {
                  const unread = !notification.seen;
                  return (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "block w-full border-b border-navy-700/50 px-4 py-3.5 text-left transition last:border-b-0",
                        unread ? "bg-violet-600/8 hover:bg-violet-600/14" : "hover:bg-white/3"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            unread
                              ? "bg-violet-glow shadow-[0_0_8px_rgba(157,92,245,0.65)]"
                              : "bg-navy-600"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm leading-snug",
                                unread
                                  ? "font-semibold text-cloud-100"
                                  : "font-medium text-mist-300"
                              )}
                            >
                              {notification.title}
                            </p>
                            <span className="shrink-0 text-[10px] text-mist-600">
                              {formatDateTime(notification.createdAt)}
                            </span>
                          </div>
                          {notification.message && (
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mist-400">
                              {notification.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div ref={sentinelRef} className="flex h-10 items-center justify-center">
                  {isFetching && hasMore && (
                    <Spin size="small" indicator={<LoadingOutlined className="text-violet-glow" spin />} />
                  )}
                  {!hasMore && notifications.length > 0 && (
                    <span className="text-[11px] text-mist-600">End of notifications</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
