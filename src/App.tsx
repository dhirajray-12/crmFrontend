// src/App.tsx
import { ErrorDisplay } from "@/components/Common/ErrorDisplay";
import { NotificationCenterPanel } from "@/components/Common/NotificationCenterPanel";
import { AppTourProvider } from "@/components/AppTour/AppTourProvider";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthInitializer } from "./components/AuthInitializer/AuthInitializer";
import { Toast } from "./components/Common/Toast";
import { ImpersonationHandler } from "./components/IMP/ImpersonationHandler";
import { ThemeProvider } from "./components/ThemeProvider/ThemeProvider";
import { useNotificationTabBadge } from "./hooks/useNotificationTabBadge";
import { useRealtimeSync } from "./hooks/useRealtimeSync";
import AppRoutes from "./Routes/AppRoutes";

const REALTIME_EVENTS = [
  "deposit_updated",
  "withdrawal_updated",
  "transfer_updated",
  "account_updated",
  "commission_updated",
  "app_settings_updated",
];

const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.documentElement.classList.add("animations-ready");
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Initialize real-time sync
  useRealtimeSync({
    enabled: true,
    events: REALTIME_EVENTS,
  });
  useNotificationTabBadge();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppTourProvider>
          <ImpersonationHandler />
          <AuthInitializer>
            <AppRoutes />
            <NotificationCenterPanel />
            <Toast />
            <ErrorDisplay />
          </AuthInitializer>
        </AppTourProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
