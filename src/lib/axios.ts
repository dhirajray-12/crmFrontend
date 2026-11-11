// Based on your existing axiosInstance.ts
import axios from "axios";
import {
  applySessionHeadersToAxiosConfig,
  handleExpiredSession,
  withAxiosSessionRefresh,
} from "@/utils/session";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // NEW for cookies
});

api.interceptors.request.use(async (config) => {
  return applySessionHeadersToAxiosConfig(config);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      return await withAxiosSessionRefresh(error, (config) => api(config));
    } catch (refreshError: any) {
      if (refreshError.response?.status === 401) {
        await handleExpiredSession();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
