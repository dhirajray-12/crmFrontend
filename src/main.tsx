// src/main.tsx
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";
import "./index.css";
import { GlobalErrorBoundary } from "@/components/ErrorBoundary/GlobalErrorBoundary";
import { useErrorStore } from "@/Store/error.store";
import { installCsrfProtection } from "@/utils/csrf";

installCsrfProtection();

// Configure QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // CHANGE THESE VALUES:
      staleTime: 15 * 60 * 1000, // ⬅️ WAS: 5 minutes, NOW: 15 minutes
      gcTime: 30 * 60 * 1000, // ⬅️ WAS: 10 minutes, NOW: 30 minutes

      // KEEP THESE THE SAME:
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 403) return false;
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        const errorStore = useErrorStore.getState();
        errorStore.handleApiError(error, "mutation");
      },
    },
  },
});

// Add global query error handler
queryClient.getQueryCache().config.onError = (error: any) => {
  const errorStore = useErrorStore.getState();
  errorStore.handleApiError(error, "query");
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <GlobalErrorBoundary>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </GlobalErrorBoundary>
  </QueryClientProvider>,
);
