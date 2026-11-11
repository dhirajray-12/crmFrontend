import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/Store/auth.store";
import { useNotificationStore } from "@/Store/notification.store";
import { useToastStore } from "@/Store/toast.store";
import { notificationService } from "@/services/notification.service";
import { getSocketServerUrl } from "@/utils/socketUrl";
import {
  emitClientRealtimeEvent,
  getClientRealtimeSocket,
  subscribeToClientRealtime,
} from "@/lib/clientRealtimeSocket";

const mapNotificationToToastType = (
  notification: any,
): "success" | "error" | "info" | "warning" => {
  const priority = String(notification?.priority ?? "").toLowerCase();
  if (priority === "high" || priority === "urgent") return "warning";

  const text = `${notification?.type ?? ""} ${notification?.title ?? ""} ${notification?.message ?? ""}`.toLowerCase();
  if (/(reject|fail|declin|error|suspend)/.test(text)) return "error";
  if (/(approv|success|complet|credited|created)/.test(text)) return "success";
  return "info";
};

export const useNotificationTabBadge = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?._id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const activeRole = useAuthStore(
    (state) => state.activeRole ?? state.user?.role ?? undefined,
  );
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const prependNotification = useNotificationStore(
    (state) => state.prependNotification,
  );
  const markNotificationRead = useNotificationStore(
    (state) => state.markNotificationRead,
  );
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const resetStore = useNotificationStore((state) => state.resetStore);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const addToast = useToastStore((state) => state.addToast);
  const baseTitleRef = useRef<string>("CRM");
  const socketUrl = getSocketServerUrl();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!baseTitleRef.current || baseTitleRef.current === "CRM") {
      baseTitleRef.current = document.title || "CRM";
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const baseTitle = baseTitleRef.current || "CRM";
    if (!isInitialized || !isAuthenticated || !userId) {
      document.title = baseTitle;
      return;
    }

    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
  }, [isAuthenticated, isInitialized, unreadCount, userId]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || !userId) {
      resetStore();
      return;
    }

    let isMounted = true;

    const syncNotifications = async () => {
      try {
        const result = await notificationService.fetchNotifications(1, 50);
        if (isMounted) {
          setNotifications(result.notifications);
          setUnreadCount(result.unreadCount);
        }
      } catch {
        if (isMounted) {
          resetStore();
        }
      }
    };

    void syncNotifications();

    const identity = { userId, serverUrl: socketUrl, activeRole };

    const requestNotificationCount = () => {
      emitClientRealtimeEvent(identity, "getNotificationCount");
    };

    const handleNotificationCount = (data: { count?: number }) => {
      setUnreadCount(data?.count ?? 0);
    };

    const handleNewNotification = (notification: any) => {
      prependNotification({
        _id: notification.id || notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        createdAt: notification.createdAt || new Date().toISOString(),
        timeAgo: notification.timeAgo,
        read: false,
        data: notification.data,
      });

      const toastMessage = notification.title
        ? notification.message
          ? `${notification.title}: ${notification.message}`
          : notification.title
        : notification.message || "You have a new notification";
      addToast(mapNotificationToToastType(notification), toastMessage);

      if (notification?.type === "deposit_status") {
        const keysToRefresh = [
          "deposits",
          "dashboard",
          "dashboardData",
          "transactions",
          "accountTransactions",
          "accountActivity",
          "accounts",
          "availableBalances",
        ];

        keysToRefresh.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: [key],
            exact: false,
            refetchType: "active",
          });
        });
      }
    };

    const handleNotificationRead = (payload: { notificationId?: string }) => {
      if (payload?.notificationId) {
        markNotificationRead(payload.notificationId);
      }
    };

    const handleAllNotificationsRead = () => {
      useNotificationStore.getState().markAllNotificationsRead();
    };

    const handleNotificationDeleted = (payload: { notificationId?: string }) => {
      if (payload?.notificationId) {
        removeNotification(payload.notificationId);
      }
      void syncNotifications();
    };

    const handleConnect = () => {
      requestNotificationCount();
    };

    const unsubscribers = [
      subscribeToClientRealtime(identity, "connect", () => handleConnect()),
      subscribeToClientRealtime(identity, "notificationCount", (data) =>
        handleNotificationCount(data),
      ),
      subscribeToClientRealtime(identity, "newNotification", (notification) =>
        handleNewNotification(notification),
      ),
      subscribeToClientRealtime(identity, "notificationRead", (payload) =>
        handleNotificationRead(payload),
      ),
      subscribeToClientRealtime(identity, "allNotificationsRead", () =>
        handleAllNotificationsRead(),
      ),
      subscribeToClientRealtime(identity, "notificationDeleted", (payload) =>
        handleNotificationDeleted(payload),
      ),
    ];

    if (getClientRealtimeSocket(identity).connected) {
      requestNotificationCount();
    }

    const handleWindowFocus = () => {
      void syncNotifications();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [
    isAuthenticated,
    isInitialized,
    userId,
    activeRole,
    socketUrl,
    setUnreadCount,
    prependNotification,
    markNotificationRead,
    removeNotification,
    resetStore,
    setNotifications,
    queryClient,
    addToast,
  ]);
};
