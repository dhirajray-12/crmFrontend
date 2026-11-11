import { Bell } from "lucide-react";
import { useAuthStore } from "@/Store/auth.store";
import { useNotificationStore } from "@/Store/notification.store";

interface NotificationBellButtonProps {
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
  labelClassName?: string;
}

export const NotificationBellButton = ({
  className = "",
  iconClassName = "h-5 w-5",
  showLabel = false,
  labelClassName = "",
}: NotificationBellButtonProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const userId = useAuthStore((state) => state.user?._id);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isPanelOpen = useNotificationStore((state) => state.isPanelOpen);
  const setPanelOpen = useNotificationStore((state) => state.setPanelOpen);
  const canAccessNotifications = isInitialized && isAuthenticated && !!userId;

  if (!canAccessNotifications) {
    return null;
  }

  return (
    <button
      onClick={() => setPanelOpen(!isPanelOpen)}
      className={`relative ${className}`}
    >
      <Bell className={iconClassName} />
      {showLabel && <span className={labelClassName}>Notifications</span>}
      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-[10px] font-bold text-accent-foreground shadow-accent-glow">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};
