import axios from "axios";
import type { AppNotification } from "@/Store/notification.store";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getRequestConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    "x-active-role": sessionStorage.getItem("active_role") || "",
  },
  withCredentials: true,
});

export const notificationService = {
  async fetchUnreadCount(): Promise<number> {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/unread-count`,
      getRequestConfig(),
    );

    return response?.data?.data?.unreadCount ?? 0;
  },

  async fetchNotifications(
    page = 1,
    limit = 20,
  ): Promise<{
    notifications: AppNotification[];
    unreadCount: number;
    hasMore: boolean;
  }> {
    const response = await axios.get(
      `${API_BASE_URL}/notifications?page=${page}&limit=${limit}`,
      getRequestConfig(),
    );

    const pagination = response?.data?.data?.pagination;

    return {
      notifications: response?.data?.data?.notifications ?? [],
      unreadCount: response?.data?.data?.unreadCount ?? 0,
      hasMore: pagination ? pagination.current < pagination.pages : false,
    };
  },

  async markAsRead(notificationId: string) {
    return axios.patch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      getRequestConfig(),
    );
  },

  async markAllAsRead() {
    return axios.patch(
      `${API_BASE_URL}/notifications/mark-all-read`,
      {},
      getRequestConfig(),
    );
  },

  async deleteNotification(notificationId: string) {
    return axios.delete(
      `${API_BASE_URL}/notifications/${notificationId}`,
      getRequestConfig(),
    );
  },
};
