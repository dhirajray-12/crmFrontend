import { create } from "zustand";

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  createdAt: string;
  timeAgo?: string;
  read?: boolean;
  data?: Record<string, any>;
}

interface NotificationState {
  unreadCount: number;
  notifications: AppNotification[];
  isPanelOpen: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasLoaded: boolean;
  page: number;
  hasMore: boolean;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  // Replaces the full list - used for the first page of a fresh load.
  setNotifications: (notifications: AppNotification[], hasMore?: boolean) => void;
  // Appends the next page onto the end (infinite scroll), de-duping by id.
  appendNotifications: (notifications: AppNotification[], hasMore: boolean) => void;
  prependNotification: (notification: AppNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (notificationId: string) => void;
  setPanelOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  resetStore: () => void;
}

const countUnread = (notifications: AppNotification[]) =>
  notifications.filter((item) => !item.read).length;

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  isPanelOpen: false,
  isLoading: false,
  isLoadingMore: false,
  hasLoaded: false,
  page: 1,
  hasMore: true,
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  resetUnreadCount: () => set({ unreadCount: 0 }),
  setNotifications: (notifications, hasMore = true) =>
    set({
      notifications,
      unreadCount: countUnread(notifications),
      hasLoaded: true,
      page: 1,
      hasMore,
    }),
  appendNotifications: (newNotifications, hasMore) =>
    set((state) => {
      const seen = new Set(state.notifications.map((item) => item._id));
      const merged = [
        ...state.notifications,
        ...newNotifications.filter((item) => !seen.has(item._id)),
      ];

      return {
        notifications: merged,
        unreadCount: countUnread(merged),
        page: state.page + 1,
        hasMore,
      };
    }),
  prependNotification: (notification) =>
    set((state) => {
      const exists = state.notifications.some(
        (item) => item._id === notification._id,
      );

      if (exists) {
        const notifications = state.notifications.map((item) =>
          item._id === notification._id ? { ...item, ...notification } : item,
        );

        return {
          notifications,
          unreadCount: countUnread(notifications),
        };
      }

      // No artificial cap here - infinite scroll means the user may have
      // loaded well past 50 already; trimming would silently drop history
      // they scrolled to see.
      const notifications = [notification, ...state.notifications];

      return {
        notifications,
        unreadCount: countUnread(notifications),
      };
    }),
  markNotificationRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((item) =>
        item._id === notificationId ? { ...item, read: true } : item,
      );

      return {
        notifications,
        unreadCount: countUnread(notifications),
      };
    }),
  markAllNotificationsRead: () =>
    set((state) => {
      const notifications = state.notifications.map((item) => ({
        ...item,
        read: true,
      }));

      return {
        unreadCount: 0,
        notifications,
      };
    }),
  removeNotification: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.filter(
        (item) => item._id !== notificationId,
      );

      return {
        notifications,
        unreadCount: countUnread(notifications),
      };
    }),
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingMore: (loading) => set({ isLoadingMore: loading }),
  resetStore: () =>
    set({
      unreadCount: 0,
      notifications: [],
      isPanelOpen: false,
      isLoading: false,
      isLoadingMore: false,
      hasLoaded: false,
      page: 1,
      hasMore: true,
    }),
}));
