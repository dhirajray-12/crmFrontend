import {
  AdminProfilePopup,
  type TopbarProps,
} from "@/AdminComponents/AdminProfilePopUp/AdminProfilePopup";
import { NotificationBellButton } from "@/components/Common/NotificationBellButton";
import { useAppTour } from "@/components/AppTour/AppTourProvider";
import { useAuthStore } from "@/Store/auth.store";
import { useLogout } from "@/hooks/useLogout";
import { ChevronDown, LogOut, Menu, Search, Sparkles, User } from "lucide-react";
import React, { useState } from "react";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const AdminTopbar: React.FC<TopbarProps> = ({ setSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // ← new
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const { hasTour, showLauncher, startCurrentTour, toursDisabled, toggleToursDisabled } =
    useAppTour();

  const name = user?.firstName + " " + user?.lastName || "Admin User";
  const order = ["state", "name"];
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: getConfiguredTimezone(),
      })
    : "Unknown";

  const address = order
    .map((key) => user?.country?.[key as any])
    .filter(Boolean)
    .join(", ");

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* ── Admin Profile Popup ── */}
      <AdminProfilePopup
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        name={name}
        role={
          (user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "Admin") || "Administrator"
        }
        email={user?.email || "admin@company.io"}
        status={
          (user?.status
            ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
            : "Deactivated") || "Deactivated"
        } // ← new
        address={address || "Unknown"}
        createdAt={createdAt || new Date().toISOString()}
      />

      <header className="admin-topbar-shell sticky top-0 z-40 flex w-full items-center justify-between px-3 py-3 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
          <button
            className="shrink-0 rounded-xl p-1.5 transition-colors hover:bg-surface sm:p-2 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-body sm:h-6 sm:w-6" />
          </button>

          <h1 className="hidden truncate text-base font-bold tracking-tight text-heading sm:block sm:text-lg md:text-xl">
            Admin Dashboard
          </h1>
          <h1 className="truncate text-sm font-bold tracking-tight text-heading sm:hidden">
            Dashboard
          </h1>
        </div>

        <div className="relative mx-2 max-w-xs flex-1 sm:mx-3 sm:max-w-sm md:mx-4 md:max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="admin-input w-full rounded-2xl py-2 pr-3 pl-8 text-xs focus:outline-none sm:py-2.5 sm:pr-4 sm:pl-10 sm:text-sm"
          />
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-subtle sm:left-3 sm:h-4 sm:w-4" />
        </div>

        <div className="relative flex shrink-0 items-center space-x-2 sm:space-x-3 md:space-x-4">
          {hasTour && showLauncher && (
            <button
              type="button"
              onClick={startCurrentTour}
              className="hidden items-center gap-2 rounded-2xl bg-linear-to-r from-accent to-accent-hover px-3 py-2 text-sm font-medium text-accent-foreground shadow-lg shadow-accent-glow transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              <Sparkles className="h-4 w-4" />
              Guide
            </button>
          )}

          <NotificationBellButton
            className="relative rounded-2xl border border-border bg-surface-strong p-2 text-body shadow-sm transition-colors hover:bg-surface"
            iconClassName="w-5 h-5"
          />

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex cursor-pointer items-center space-x-1.5 rounded-2xl border border-border bg-surface-strong px-2 py-1.5 shadow-sm transition-colors hover:bg-surface sm:space-x-2 sm:px-3"
            >
              <User className="h-4 w-4 shrink-0 text-body sm:h-5 sm:w-5" />
              <span className="hidden text-xs font-medium capitalize text-heading sm:text-sm md:block">
                {user?.role || "Admin"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-subtle sm:h-4 sm:w-4" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  onClick={() => setIsProfileOpen(false)}
                />

                <div className="absolute right-0 z-50 mt-2 w-40 rounded-2xl border border-border bg-surface-strong/95 shadow-2xl shadow-accent-glow backdrop-blur sm:w-44 md:w-48">
                  <ul className="flex flex-col py-1">
                    <li
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsPopupOpen(true);
                      }}
                      className="cursor-pointer px-3 py-2 text-xs text-body transition-colors hover:bg-surface sm:px-4 sm:text-sm"
                    >
                      Profile
                    </li>
                    <li
                      onClick={() => {
                        setIsProfileOpen(false);
                        toggleToursDisabled();
                      }}
                      className="cursor-pointer px-3 py-2 text-xs text-body transition-colors hover:bg-surface sm:px-4 sm:text-sm"
                    >
                      {toursDisabled ? "Enable Tours" : "Disable Tours"}
                    </li>
                    <li className="border-t border-border"></li>
                    <li
                      onClick={handleLogout}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 sm:px-4 sm:text-sm"
                    >
                      <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Logout</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
