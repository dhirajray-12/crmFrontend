import { AxiosError, AxiosHeaders, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/Store/auth.store";
import { getLoginRedirectByRole } from "@/utils/authRedirect";
import { getDeviceId, getDeviceName } from "@/utils/deviceIdentity";
import { ensureCsrfToken, CSRF_HEADER_NAME } from "@/utils/csrf";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

let refreshPromise: Promise<boolean> | null = null;

const getActiveRole = () => sessionStorage.getItem("active_role") || "";

const getAuthStore = () => useAuthStore.getState();

export const getSessionHeaders = async (
  headers?: HeadersInit,
): Promise<HeadersInit> => {
  const nextHeaders = new Headers(headers);
  const activeRole = getActiveRole();

  if (activeRole && !nextHeaders.has("X-Active-Role")) {
    nextHeaders.set("X-Active-Role", activeRole);
  }

  if (!nextHeaders.has("X-Device-Id")) {
    nextHeaders.set("X-Device-Id", getDeviceId());
  }

  if (!nextHeaders.has("X-Device-Name")) {
    nextHeaders.set("X-Device-Name", getDeviceName());
  }

  const csrfToken = await ensureCsrfToken();

  if (csrfToken && !nextHeaders.has(CSRF_HEADER_NAME)) {
    nextHeaders.set(CSRF_HEADER_NAME, csrfToken);
  }

  return nextHeaders;
};

export const tryRefreshSession = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: await getSessionHeaders({
          "Content-Type": "application/json",
        }),
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json().catch(() => null);
      const refreshedUser = payload?.user;

      if (refreshedUser) {
        const authStore = getAuthStore();
        authStore.setAuth(refreshedUser);
      }

      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const fetchWithSessionRefresh = async (
  input: string,
  init: RequestInit = {},
  hasRetried = false,
): Promise<Response> => {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: await getSessionHeaders(init.headers),
  });

  if (response.status !== 401 || hasRetried) {
    return response;
  }

  const refreshed = await tryRefreshSession();

  if (!refreshed) {
    return response;
  }

  return fetchWithSessionRefresh(input, init, true);
};

export const withAxiosSessionRefresh = async (
  error: AxiosError,
  retryRequest: (config: AxiosRequestConfig) => Promise<unknown>,
) => {
  const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

  if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
    throw error;
  }

  originalRequest._retry = true;
  const refreshed = await tryRefreshSession();

  if (!refreshed) {
    throw error;
  }

  await applySessionHeadersToAxiosConfig(originalRequest);

  return retryRequest(originalRequest);
};

export const applySessionHeadersToAxiosConfig = async <
  T extends AxiosRequestConfig,
>(
  config: T,
): Promise<T> => {
  const sessionHeaders = Object.fromEntries(
    new Headers(await getSessionHeaders(config.headers as HeadersInit)).entries(),
  );
  const existingHeaders =
    config.headers instanceof AxiosHeaders
      ? config.headers.toJSON()
      : ((config.headers as Record<string, string> | undefined) ?? {});

  config.withCredentials = true;
  config.headers = AxiosHeaders.from({
    ...existingHeaders,
    ...sessionHeaders,
  });

  return config;
};

export const handleExpiredSession = async () => {
  const authStore = getAuthStore();
  const redirectPath = getLoginRedirectByRole(
    sessionStorage.getItem("active_role") || authStore.activeRole || authStore.user?.role,
  );

  await authStore.logout();

  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = redirectPath;
  }
};
