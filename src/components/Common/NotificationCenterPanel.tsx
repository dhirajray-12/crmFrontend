import { useCallback, useEffect, useMemo, useRef } from "react";
import { CheckCheck, ExternalLink, Trash2, X, Bell } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/Store/auth.store";
import { useNotificationStore } from "@/Store/notification.store";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

const getNotificationSource = (type: string) => {
  switch (type) {
    case "deposit_status":
      return "Deposit";
    case "withdrawal_status":
      return "Withdrawal";
    case "ticket_update":
      return "Support";
    case "account_created":
      return "Account";
    case "transfer_success":
      return "Transfer";
    case "profile_update":
      return "Profile";
    case "password_changed":
      return "Security";
    case "new_signup":
      return "Signup";
    case "new_referral":
      return "Referral";
    default:
      return "System";
  }
};

const getRelativeTime = (createdAt?: string, timeAgo?: string) => {
  if (timeAgo) return timeAgo;
  if (!createdAt) return "Just now";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { timeZone: getConfiguredTimezone() });
};

export const NotificationCenterPanel = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const userId = useAuthStore((state) => state.user?._id);
  const {
    isPanelOpen,
    setPanelOpen,
    notifications,
    setNotifications,
    appendNotifications,
    setUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    isLoading,
    setLoading,
    isLoadingMore,
    setLoadingMore,
    page,
    hasMore,
  } = useNotificationStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );
  const canAccessNotifications = isInitialized && isAuthenticated && !!userId;

  useEffect(() => {
    if (!canAccessNotifications) {
      setPanelOpen(false);
      return;
    }

    if (!isPanelOpen) return;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const result = await notificationService.fetchNotifications(1);
        if (!isMounted) return;
        setNotifications(result.notifications, result.hasMore);
        setUnreadCount(result.unreadCount);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [
    canAccessNotifications,
    isPanelOpen,
    setLoading,
    setNotifications,
    setPanelOpen,
    setUnreadCount,
  ]);

  const reloadNotifications = async () => {
    const result = await notificationService.fetchNotifications(1);
    setNotifications(result.notifications, result.hasMore);
    setUnreadCount(result.unreadCount);
  };

  // Infinite scroll: fetch the next page once the user nears the bottom of
  // the panel's own scroll container, instead of loading the whole history
  // up front.
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await notificationService.fetchNotifications(nextPage);
      appendNotifications(result.notifications, result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [appendNotifications, hasMore, isLoadingMore, page, setLoadingMore]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
    if (nearBottom) {
      void loadMore();
    }
  }, [loadMore]);

  const handleMarkAsRead = async (notificationId: string) => {
    markNotificationRead(notificationId);

    try {
      await notificationService.markAsRead(notificationId);
    } catch {
      await reloadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    markAllNotificationsRead();

    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch {
      await reloadNotifications();
    }
  };

  const handleDelete = async (notificationId: string) => {
    removeNotification(notificationId);

    try {
      await notificationService.deleteNotification(notificationId);
    } catch {
      await reloadNotifications();
    }
  };

  if (!canAccessNotifications || !isPanelOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
        onClick={() => setPanelOpen(false)}
      />

      <div className="fixed right-3 top-20 z-[100] w-[calc(100vw-24px)] max-w-md overflow-hidden rounded-3xl border border-border bg-surface-strong shadow-2xl backdrop-blur-xl sm:right-6">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-heading">
                Notifications
              </h3>
              <p className="text-xs text-body">
                {unreadNotifications} unread
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleMarkAllAsRead()}
              className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-heading transition hover:bg-surface-strong"
            >
              <span className="inline-flex items-center gap-2">
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </span>
            </button>
            <button
              onClick={() => setPanelOpen(false)}
              className="rounded-xl p-2 text-body transition hover:bg-surface-strong hover:text-heading"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[70vh] overflow-y-auto"
        >
          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-border bg-surface-strong/60 p-4"
                >
                  <div className="mb-3 h-3 w-24 rounded bg-surface" />
                  <div className="mb-2 h-4 w-2/3 rounded bg-surface" />
                  <div className="h-3 w-full rounded bg-surface" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-strong text-body">
                <Bell className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-heading">
                No notifications yet
              </h4>
              <p className="mt-2 text-sm text-body">
                New client and admin updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-2xl border p-4 transition ${
                    notification.read
                      ? "border-border bg-surface-strong"
                      : "border-accent/30 bg-accent-soft"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                          {getNotificationSource(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <h4 className="truncate text-sm font-semibold text-heading">
                        {notification.title}
                      </h4>
                    </div>

                    <div className="shrink-0 text-[11px] text-body">
                      {getRelativeTime(
                        notification.createdAt,
                        notification.timeAgo,
                      )}
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-heading">
                    {notification.message}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() =>
                        !notification.read &&
                        void handleMarkAsRead(notification._id)
                      }
                      className="text-xs font-medium text-body transition hover:text-heading"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {notification.read ? "Viewed" : "Mark as read"}
                      </span>
                    </button>

                    <button
                      onClick={() => void handleDelete(notification._id)}
                      className="rounded-xl p-2 text-body transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-body">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  Loading more…
                </div>
              )}

              {!hasMore && !isLoadingMore && (
                <p className="py-3 text-center text-[11px] text-body">
                  You've reached the beginning of your notifications.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
