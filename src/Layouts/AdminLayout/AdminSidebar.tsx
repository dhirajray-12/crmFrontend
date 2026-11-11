import React, { useState } from "react";
import {
  Home, Users, DollarSign, CreditCard, Repeat, UserCheck, Copy, HelpCircle, ChevronDown, ChevronRight, X, Mail, ShieldCheck, PieChart,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/Store/auth.store";
import { useNotificationStore } from "@/Store/notification.store";
import { PERMISSIONS } from "@/Constants/permissions";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SubmenuItem {
  label: string;
  path: string;
  permission?: string;
  adminOnly?: boolean;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  hasSubmenu?: boolean;
  submenu?: SubmenuItem[];
  permission?: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <Home className="w-5 h-5" />,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    key: "clients",
    label: "Clients",
    path: "/admin/client-page",
    icon: <Users className="w-5 h-5" />,
    permission: PERMISSIONS.CLIENTS_VIEW,
  },
  {
    key: "kyc-verification",
    label: "KYC Verification",
    path: "/admin/kyc-verification",
    icon: <UserCheck className="w-5 h-5" />,
    permission: PERMISSIONS.KYC_VIEW,
  },
  {
    key: "deposits",
    label: "Deposits",
    path: "/admin/deposits",
    icon: <DollarSign className="w-5 h-5" />,
    permission: PERMISSIONS.DEPOSITS_VIEW,
  },
  {
    key: "withdrawals",
    label: "Withdrawals",
    path: "/admin/withdrawals",
    icon: <CreditCard className="w-5 h-5" />,
    permission: PERMISSIONS.WITHDRAWALS_VIEW,
  },
  {
    key: "add-payments",
    label: "Add Payments",
    path: "/admin/add-payments",
    icon: <CreditCard className="w-5 h-5" />,
    permission: PERMISSIONS.PAYMENTS_VIEW,
  },
  {
    key: "transactions",
    label: "Transactions",
    path: "/admin/Admin-transaction-page",
    icon: <Repeat className="w-5 h-5" />,
    permission: PERMISSIONS.TRANSACTIONS_VIEW,
  },
  {
    key: "ib-partners",
    label: "IB Partners",
    icon: <UserCheck className="w-5 h-5" />,
    hasSubmenu: true,
    submenu: [
      {
        label: "Partners",
        path: "/admin/Partners",
        permission: PERMISSIONS.IB_PARTNERS_VIEW,
      },
      {
        label: "IB Configuration",
        path: "/admin/IB-Configuration",
        permission: PERMISSIONS.IB_CONFIGURATION_VIEW,
      },
      {
        label: "IB Withdrawal",
        path: "/admin/IB-Withdrawals",
        permission: PERMISSIONS.IB_WITHDRAWAL_VIEW,
      },
    ],
  },
  {
    key: "copy-trading",
    label: "Copy Trading",
    icon: <Copy className="w-5 h-5" />,
    hasSubmenu: true,
    submenu: [
      {
        label: "Copier Page",
        path: "/admin/admin-Copy-page",
        permission: PERMISSIONS.COPY_COPIER_VIEW,
      },
      {
        label: "Masters Page",
        path: "/admin/Admin-masters-page",
        permission: PERMISSIONS.COPY_MASTERS_VIEW,
      },
      {
        label: "Rating Page",
        path: "/admin/Admin-rating-page",
        permission: PERMISSIONS.COPY_RATING_VIEW,
      },
    ],
  },
  {
    key: "pamm",
    label: "PAMM",
    path: "/admin/admin-pamm-page",
    icon: <PieChart className="w-5 h-5" />,
    permission: PERMISSIONS.PAMM_VIEW,
  },
  {
    key: "email-logs",
    label: "Email Logs",
    path: "/admin/email-logs",
    icon: <Mail className="w-5 h-5" />,
    permission: PERMISSIONS.EMAIL_LOGS_VIEW,
  },
  {
    key: "support",
    label: "Support",
    path: "/admin/Admin-customer-support",
    icon: <HelpCircle className="w-5 h-5" />,
    permission: PERMISSIONS.SUPPORT_VIEW,
  },
  {
    key: "subadmins",
    label: "Subadmins",
    path: "/admin/subadmins",
    icon: <ShieldCheck className="w-5 h-5" />,
    adminOnly: true,
  },
];

export const AdminSidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const notifications = useNotificationStore((state) => state.notifications);
  const isAgent = user?.role === "agent";
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const userPermissions = user?.permissions || [];

  const canAccess = (permission?: string, adminOnly?: boolean) => {
    if (adminOnly) return isAdmin;
    if (!permission) return true;
    if (isAdmin) return true;
    if (user?.role === "subadmin") return userPermissions.includes(permission);
    return false;
  };

  const visibleMenuItems = isAgent
    ? menuItems.filter((item) => item.key === "support")
    : menuItems
        .filter((item) => canAccess(item.permission, item.adminOnly))
        .map((item) =>
          item.submenu
            ? {
                ...item,
                submenu: item.submenu.filter((sub) =>
                  canAccess(sub.permission, sub.adminOnly),
                ),
              }
            : item,
        )
        .filter((item) => !item.hasSubmenu || (item.submenu?.length ?? 0) > 0);

  const getUnreadCountForMenuKey = (menuKey: string) => {
    const menuTypeMap: Record<string, string[]> = {
      deposits: ["deposit_status"],
      withdrawals: ["withdrawal_status"],
      support: ["ticket_update"],
      clients: ["new_signup", "profile_update"],
    };

    const matchingTypes = menuTypeMap[menuKey] || [];
    return notifications.filter(
      (item) => !item.read && matchingTypes.includes(item.type),
    ).length;
  };

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar-shell fixed lg:static z-50 h-full w-72 sm:w-80 lg:w-72 transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-4 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-hover shadow-lg shadow-accent-glow sm:h-11 sm:w-11">
              <span className="text-base font-black tracking-wide text-accent-foreground sm:text-lg">
                TC
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-heading sm:text-xl">
                TestCRM Admin
              </h2>
              <p className="text-xs text-subtle sm:text-sm">Operations Center</p>
            </div>
          </div>

          <button
            className="rounded-xl p-1 text-subtle transition-colors hover:bg-surface hover:text-heading lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-78px)] space-y-1.5 overflow-y-auto p-3 sm:h-[calc(100vh-84px)] sm:p-4">
          {visibleMenuItems.map((item) => {
            const isActiveParent = item.path && pathname === item.path;
            const isSubmenuActive =
              item.submenu?.some((sub) => sub.path === pathname) ?? false;
            const menuUnreadCount = getUnreadCountForMenuKey(item.key);

            return (
              <div key={item.key}>
                {item.hasSubmenu ? (
                  <div>
                    {/* Parent */}
                    <button
                      onClick={() => toggleExpanded(item.key)}
                      className={`admin-nav-item group flex w-full items-center justify-between rounded-2xl p-2.5 sm:p-3 ${expandedItems.includes(item.key) || isSubmenuActive
                        ? "is-active"
                        : ""
                        }`}
                    >
                      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                        <div
                          className={`sidebar-icon-motion flex-shrink-0 ${expandedItems.includes(item.key) || isSubmenuActive ? "is-active" : ""}`}
                        >
                          {item.icon}
                        </div>
                        <span className="truncate text-sm font-medium sm:text-base">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex-shrink-0">
                        {expandedItems.includes(item.key) ? (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                    </button>

                    {/* Submenu */}
                    {expandedItems.includes(item.key) && item.submenu && (
                      <div className="mt-1.5 ml-6 space-y-1 sm:mt-2 sm:ml-8">
                        {item.submenu.map((sub) => {
                          const isActiveSub = pathname === sub.path;

                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`admin-nav-subitem block rounded-xl px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${isActiveSub
                                ? "is-active"
                                : ""
                                }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path || "#"}
                    onClick={() => setSidebarOpen(false)}
                    className={`admin-nav-item group flex w-full items-center space-x-2.5 rounded-2xl p-2.5 sm:space-x-3 sm:p-3 ${isActiveParent
                      ? "is-active"
                      : ""
                      }`}
                  >
                    <div
                      className={`sidebar-icon-motion flex-shrink-0 ${isActiveParent ? "is-active" : ""}`}
                    >
                      {item.icon}
                    </div>
                    <span className="flex items-center gap-2 truncate text-sm font-medium sm:text-base">
                      {item.label}
                      {menuUnreadCount > 0 && (
                        <span className="admin-badge rounded-full px-2 py-0.5 text-[10px] font-bold text-heading">
                          {menuUnreadCount > 99 ? "99+" : menuUnreadCount}
                        </span>
                      )}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
