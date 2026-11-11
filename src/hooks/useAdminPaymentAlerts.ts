import { useEffect, useMemo, useRef } from "react";
import { usePublicPlatformStatus } from "@/hooks/useBillingSuspension";
import { useAuthStore } from "@/Store/auth.store";
import { useToastStore } from "@/Store/toast.store";

export const useAdminPaymentAlerts = () => {
  const role = useAuthStore((state) => state.user?.role);
  const { data } = usePublicPlatformStatus();
  const addToast = useToastStore((state) => state.addToast);
  const lastToastKeyRef = useRef<string | null>(null);

  const alertState = useMemo(() => {
    const currentState = data?.currentState;
    if (!currentState) {
      return null;
    }

    if (currentState.isSuspended) {
      return {
        key: `suspended:${currentState.reason}:${currentState.dueDateKey || "none"}:${currentState.adminMessage}`,
        type: "error" as const,
        message: currentState.adminMessage,
      };
    }

    if (currentState.reminders?.inGrace) {
      return {
        key: `grace:${currentState.dueDateKey || "none"}:${currentState.overdueDays}`,
        type: "warning" as const,
        message: `Payment overdue. You are in grace period${currentState.dueDateKey ? ` until suspension for due date ${currentState.dueDateKey}` : ""}.`,
      };
    }

    if (currentState.reminders?.dueSoon) {
      return {
        key: `due-soon:${currentState.dueDateKey || "none"}:${currentState.daysUntilDue}`,
        type: "info" as const,
        message: `Payment due soon${currentState.dueDateKey ? ` on ${currentState.dueDateKey}` : ""}.`,
      };
    }

    return null;
  }, [data?.currentState]);

  useEffect(() => {
    if (!role || !["admin", "agent"].includes(role) || !alertState) {
      lastToastKeyRef.current = null;
      return;
    }

    if (lastToastKeyRef.current === alertState.key) {
      return;
    }

    lastToastKeyRef.current = alertState.key;
    addToast(alertState.type, alertState.message);
  }, [addToast, alertState, role]);

  return data?.currentState || null;
};
