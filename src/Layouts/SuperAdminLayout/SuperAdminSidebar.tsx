import React from "react";
import { NavLink } from "react-router-dom";
import { X, Settings, LogOut, KeyRound, ShieldAlert } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SuperAdminSidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navItems = [
    {
      name: "Configuration",
      path: "/superadmin/configuration",
      icon: Settings,
      description: "Leverage & groups",
    },
    {
      name: "Billing Suspension",
      path: "/superadmin/billing-suspension",
      icon: ShieldAlert,
      description: "Due dates & locks",
    },
    {
      name: "Admin Credentials",
      path: "/superadmin/edit-admin-credentials",
      icon: KeyRound,
      description: "Email & password",
    },
  ];

  const { mutate: logout } = useLogout();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar-shell fixed z-50 flex h-full w-72 transform flex-col transition-transform duration-300 lg:static lg:w-72
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-3 py-4 sm:px-4">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-hover shadow-lg shadow-accent-glow sm:h-11 sm:w-11">
              <span className="text-base font-black tracking-wide text-accent-foreground sm:text-lg">
                SA
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-heading sm:text-xl">
                TestCRM Super Admin
              </h2>
              <p className="text-xs text-subtle sm:text-sm">Control Center</p>
            </div>
          </div>

          <button
            className="rounded-xl p-1 text-subtle transition-colors hover:bg-surface hover:text-heading lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 sm:p-4">
          {navItems.map(({ name, path, icon: Icon, description }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `admin-nav-item group flex w-full items-center space-x-3 rounded-2xl p-3 ${
                  isActive ? "is-active" : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`sidebar-icon-motion flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
                      isActive
                        ? "is-active border-white/40 bg-white/20"
                        : "border-border bg-surface"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-accent-foreground" : "text-accent"}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium sm:text-base">
                      {name}
                    </div>
                    <div
                      className={`mt-1 truncate text-[11px] ${isActive ? "text-accent-foreground/80" : "text-subtle"}`}
                    >
                      {description}
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            className="admin-nav-item group flex w-full items-center gap-3 rounded-2xl p-3 text-left text-[#8f473c] dark:text-[#cf958c] hover:border-red-200 hover:bg-red-50 hover:text-[#7f2f24] dark:text-[#da8b81]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50">
              <LogOut className="h-4 w-4 text-[#b55b4c] dark:text-[#cf958c]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Logout</div>
              <div className="mt-1 text-[11px] text-[#9a6a63] dark:text-[#ca9891]">End session</div>
            </div>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;
