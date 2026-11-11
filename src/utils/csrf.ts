import axios from "axios";

const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

export const getCsrfToken = (): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
};

let csrfFetchPromise: Promise<void> | null = null;

// Guarantees a csrf_token cookie exists before a mutating request goes out,
// instead of relying on some earlier GET having happened to seed it first
// (e.g. a session that predates this cookie, or a mutating call being the
// very first request the app makes). GET /auth/csrf-token is a safe method
// so it's exempt from CSRF verification itself; its only job is to let the
// backend's ensureCsrfCookie middleware set the cookie.
export const ensureCsrfToken = async (): Promise<string | null> => {
  const existing = getCsrfToken();
  if (existing) return existing;

  if (!csrfFetchPromise) {
    csrfFetchPromise = fetch(`${API_BASE_URL}/auth/csrf-token`, {
      credentials: "include",
    })
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        csrfFetchPromise = null;
      });
  }

  await csrfFetchPromise;
  return getCsrfToken();
};

const isApiRequest = (url: string): boolean => {
  try {
    return (
      new URL(url, window.location.origin).origin ===
      new URL(API_BASE_URL, window.location.origin).origin
    );
  } catch {
    return url.startsWith(API_BASE_URL);
  }
};

// Backend validates state-changing requests with a double-submit CSRF
// cookie/header pair. Requests are made through a mix of the shared axios
// instances, the raw `axios` default import, and plain `fetch`, so instead
// of touching every call site we patch the two entry points those all
// funnel through.
export const installCsrfProtection = () => {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const isRequestObject =
      typeof Request !== "undefined" && input instanceof Request;
    const url = typeof input === "string" ? input : input.toString();
    const method = (
      init.method ||
      (isRequestObject ? (input as Request).method : "GET")
    ).toUpperCase();

    if (MUTATING_METHODS.has(method) && isApiRequest(url)) {
      const token = await ensureCsrfToken();

      if (token) {
        const headers = new Headers(
          init.headers ?? (isRequestObject ? (input as Request).headers : undefined),
        );
        headers.set(CSRF_HEADER_NAME, token);
        init = { ...init, headers };
      }
    }

    return nativeFetch(input, init);
  };

  axios.interceptors.request.use(async (config) => {
    const method = (config.method || "get").toUpperCase();

    if (MUTATING_METHODS.has(method)) {
      const token = await ensureCsrfToken();

      if (token) {
        config.headers = config.headers || {};
        (config.headers as Record<string, string>)[CSRF_HEADER_NAME] = token;
      }
    }

    return config;
  });
};
