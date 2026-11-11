// src/API/axiosInstance.ts
import axios from "axios";
import { useErrorStore } from "@/Store/error.store";
import {
  applySessionHeadersToAxiosConfig,
  handleExpiredSession,
  withAxiosSessionRefresh,
} from "@/utils/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    "x-active-role": sessionStorage.getItem("active_role") || "",
  },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    return applySessionHeadersToAxiosConfig(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with centralized error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    try {
      return await withAxiosSessionRefresh(error, (config) => api(config));
    } catch (refreshError: any) {
      if (refreshError.response?.status === 401) {
        await handleExpiredSession();
      }
    }

    // Add to error store (but don't await to avoid blocking)
    const errorStore = useErrorStore.getState();
    errorStore.handleApiError(error, originalRequest?.url);

    return Promise.reject(error);
  }
);

export default api;
