import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { NotificationBellButton } from "@/components/Common/NotificationBellButton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Users,
  Briefcase,
  CheckSquare,
  BarChart3,
  CandlestickChart,
  Settings,
  Info,
  Handshake,
  AlignHorizontalDistributeCenter,
  BanknoteIcon as BanknoteArrowUp,
  BanknoteIcon as BanknoteArrowDown,
  Send as SendHorizonal,
  LayoutGrid as GalleryHorizontalEnd,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/Store/auth.store";
import { useNotificationStore } from "@/Store/notification.store";

interface SidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const menuItems = [
  {
    name: "Dashboard",
    icon: Home,
    dropdown: [],
    path: "/client/dashboard",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Open New Account",
    icon: Briefcase,
    dropdown: [],
    path: "/client/open-account",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "My Trading Accounts",
    icon: Users,
    dropdown: [],
    path: "/client/account-list",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Trading Stats",
    icon: AlignHorizontalDistributeCenter,
    dropdown: [],
    path: "/client/trading-contest",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Deposit",
    icon: BanknoteArrowUp,
    dropdown: [],
    path: "/client/deposit",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Withdrawal",
    icon: BanknoteArrowDown,
    dropdown: [],
    path: "/client/withdrawal",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Transfer",
    icon: SendHorizonal,
    dropdown: [],
    path: "/client/transfer",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Transaction History",
    icon: GalleryHorizontalEnd,
    dropdown: [],
    path: "/client/transfer-history",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Partners Zone",
    icon: CheckSquare,
    gradient: "from-accent via-accent to-accent-hover",
    dropdown: [
      { label: "Create Partner Account", path: "/client/partner/create" },
      { label: "Partner Dashboard", path: "/client/partner/dashboard" },
      { label: "IB Commission", path: "/client/partner/commission" },
      { label: "IB Withdrawal", path: "/client/partner/withdrawal" },
    ],
  },
  {
    name: "Copy Trading",
    icon: BarChart3,
    gradient: "from-accent via-accent to-accent-hover",
    dropdown: [
      { label: "Rating", path: "/client/copy/rating" },
      { label: "Master", path: "/client/copy/master" },
      { label: "Copier", path: "/client/copy/copier" },
      { label: "Terms & Conditions", path: "/client/copy/terms" },
    ],
  },
  {
    name: "PAMM",
    icon: BarChart3,
    gradient: "from-accent via-accent to-accent-hover",
    dropdown: [
      { label: "Funds", path: "/client/pamm/funds" },
      { label: "My Investments", path: "/client/pamm/my-investments" },
      { label: "My Fund", path: "/client/pamm/my-fund" },
    ],
  },
  {
    name: "Trading Platforms",
    icon: Settings,
    dropdown: [],
    path: "/client/platforms",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Trade View",
    icon: CandlestickChart,
    dropdown: [],
    path: "/client/trade-view",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Refer a Friend",
    icon: Handshake,
    dropdown: [],
    path: "/client/refer",
    gradient: "from-accent via-accent to-accent-hover",
  },
  {
    name: "Customer Support",
    icon: Info,
    gradient: "from-accent via-accent to-accent-hover",
    dropdown: [{ label: "My Inquiry", path: "/client/support" }],
  },
];

const iconAnimations = [
  { hover: { scale: [1, 1.3, 1], transition: { duration: 0.6 } } },
  {
    hover: {
      y: [0, -8, 0],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5 },
    },
  },
  {
    hover: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 0.7 },
    },
  },
  {
    hover: {
      x: [0, -3, 3, -3, 3, 0],
      scale: 1.15,
      transition: { duration: 0.5 },
    },
  },
  {
    hover: {
      y: [0, -10, -5],
      rotate: [0, -10, 0],
      transition: { duration: 0.6 },
    },
  },
  {
    hover: { y: [0, 10, 5], rotate: [0, 10, 0], transition: { duration: 0.6 } },
  },
  {
    hover: {
      rotate: [0, 15, -15, 10, -10, 0],
      x: [0, 5, -5, 0],
      transition: { duration: 0.7 },
    },
  },
  {
    hover: {
      rotate: [0, -5, 5, -5, 5, 0],
      scale: [1, 1.15, 1.1, 1.15, 1],
      transition: { duration: 0.8 },
    },
  },
  {
    hover: {
      rotateY: [0, 180],
      scale: [1, 1.2, 1],
      transition: { duration: 0.6 },
    },
  },
  {
    hover: {
      rotate: [0, -360],
      scale: [1, 1.25, 1],
      transition: { duration: 0.8 },
    },
  },
  { hover: { rotate: [0, 180, 360], transition: { duration: 1 } } },
  {
    hover: {
      x: [0, -5, 5, -5, 5, 0],
      rotate: [0, -15, 15, 0],
      transition: { duration: 0.6 },
    },
  },
  {
    hover: {
      scale: [1, 1.4, 1.2, 1.4, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 0.7 },
    },
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [animationsReady, setAnimationsReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const { user } = useAuthStore();
  const notifications = useNotificationStore((state) => state.notifications);

  const getUnreadCountForMenu = (menuName: string) => {
    const menuTypeMap: Record<string, string[]> = {
      Deposit: ["deposit_status"],
      Withdrawal: ["withdrawal_status"],
      "Customer Support": ["ticket_update"],
      "Open New Account": ["account_created"],
      Transfer: ["transfer_success"],
      "My Trading Accounts": ["password_changed", "account_created"],
      "Refer a Friend": ["new_referral"],
    };

    const matchingTypes = menuTypeMap[menuName] || [];
    return notifications.filter(
      (item) => !item.read && matchingTypes.includes(item.type),
    ).length;
  };

  useEffect(() => {
    if (sidebarOpen) {
      const timer = setTimeout(() => setAnimationsReady(true), 150);
      return () => clearTimeout(timer);
    } else {
      setAnimationsReady(false);
    }
  }, [sidebarOpen]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };
  const handleLogout = () => {
    logout();
  };
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ✅ FIXED: Sidebar - Separate logic for desktop and mobile */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? "5rem" : "18rem",
          // ✅ Desktop: always visible (x: 0)
          // ✅ Mobile: slide in/out based on sidebarOpen
          x: window.innerWidth >= 1024 ? 0 : sidebarOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="
          client-theme-surface-strong client-sidebar-shell
          fixed lg:relative
          inset-y-0 left-0 z-50
          m-0 flex h-screen max-h-screen flex-col overflow-hidden rounded-[28px] border border-border
          lg:h-full lg:max-h-full
        "
        style={{
          backdropFilter:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? "blur(20px)"
              : "none",
        }}
      >
        {/* Header */}
        <div className="relative z-10 flex h-22 flex-shrink-0 items-center justify-between border-b border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--heading)_6%,transparent),color-mix(in_srgb,var(--heading)_2%,transparent))] px-4">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-gradient-to-br from-accent to-accent-hover shadow-accent-glow">
                  <User className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <span className="block text-lg font-bold text-heading">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-xs text-subtle">Client workspace</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 cursor-pointer rounded-2xl border border-border bg-surface p-2 text-heading transition-colors hover:bg-surface-strong"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto px-3 py-4 sidebar-scroll">
          {menuItems.map(
            ({ name, icon: Icon, dropdown, path, gradient }, index) => {
              const hasDropdown = dropdown.length > 0;
              const isMenuActive = path
                ? isActive(path)
                : dropdown.some((item) => isActive(item.path));
              const menuUnreadCount = getUnreadCountForMenu(name);

              return (
                <div key={name}>
                  {!hasDropdown ? (
                    <motion.button
                      onClick={() => path && handleNavigation(path)}
                      onMouseEnter={() => setHoveredItem(name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-sm font-medium text-heading transition-all duration-200 border relative overflow-hidden group cursor-pointer ${
                        isMenuActive
                          ? "border-border bg-[linear-gradient(90deg,color-mix(in_srgb,var(--heading)_8%,transparent),color-mix(in_srgb,var(--heading)_3%,transparent))] shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
                          : "border-transparent bg-[linear-gradient(90deg,color-mix(in_srgb,var(--heading)_3%,transparent),color-mix(in_srgb,var(--heading)_1%,transparent))] hover:border-border hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--heading)_6%,transparent),color-mix(in_srgb,var(--heading)_2%,transparent))]"
                      }`}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: hoveredItem === name || isMenuActive ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                         className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-40`}
                      />

                      {animationsReady &&
                        (hoveredItem === name || isMenuActive) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ duration: 0.2 }}
                             className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-45`}
                          />
                        )}

                      <motion.div
                        animate={
                          animationsReady && hoveredItem === name
                            ? iconAnimations[index].hover
                            : { scale: 1 }
                        }
                        className={`sidebar-icon-motion flex-shrink-0 relative z-10 ${isMenuActive ? "is-active" : ""}`}
                      >
                        <Icon size={18} />
                      </motion.div>

                      {!collapsed && (
                        <motion.span className="relative z-10 flex items-center gap-2 truncate font-semibold">
                          <span>{name}</span>
                          {menuUnreadCount > 0 && (
                             <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
                              {menuUnreadCount > 99 ? "99+" : menuUnreadCount}
                            </span>
                          )}
                        </motion.span>
                      )}

                      {animationsReady && hoveredItem === name && (
                        <motion.div
                          className="absolute inset-0 z-20 pointer-events-none"
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 0.5,
                          }}
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                          }}
                        />
                      )}
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => toggleDropdown(name)}
                        onMouseEnter={() => setHoveredItem(name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`flex items-center justify-between w-full px-3 py-3 rounded-2xl text-sm font-medium text-heading transition-all duration-200 border relative overflow-hidden group cursor-pointer ${
                          isMenuActive
                            ? "border-border bg-surface-strong shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
                            : "border-transparent hover:border-border hover:bg-surface"
                        }`}
                        whileHover={{ scale: 1.02, x: 3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity:
                              hoveredItem === name || isMenuActive ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                           className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-35`}
                        />

                        {animationsReady &&
                          (hoveredItem === name || isMenuActive) && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              transition={{ duration: 0.2 }}
                               className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-40`}
                            />
                          )}

                        <div className="flex items-center gap-3 relative z-10">
                          <motion.div
                            animate={
                              animationsReady && hoveredItem === name
                                ? iconAnimations[index].hover
                                : { scale: 1 }
                            }
                            className={`sidebar-icon-motion flex-shrink-0 ${isMenuActive ? "is-active" : ""}`}
                          >
                            <Icon size={18} />
                          </motion.div>

                          {!collapsed && (
                            <span className="truncate font-semibold">
                              {name}
                            </span>
                          )}
                        </div>

                        {!collapsed && (
                          <motion.div
                            animate={{
                              rotate: openDropdown === name ? 180 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0 relative z-10"
                          >
                            <ChevronDown size={16} />
                          </motion.div>
                        )}

                        {animationsReady && hoveredItem === name && (
                          <motion.div
                            className="absolute inset-0 z-20 pointer-events-none"
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              repeatDelay: 0.5,
                            }}
                            style={{
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            }}
                          />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {openDropdown === name && !collapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 mt-1 space-y-1 overflow-hidden"
                          >
                            {dropdown.map((item, subIndex) => (
                              <motion.button
                                key={item.path}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{
                                  delay: subIndex * 0.05,
                                  duration: 0.2,
                                }}
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full text-left text-sm font-medium rounded-xl px-3 py-2.5 transition-all duration-200 border relative overflow-hidden cursor-pointer ${
                                  isActive(item.path)
                                    ? "border-border bg-surface-strong text-heading"
                                    : "border-transparent text-heading/80 hover:border-border hover:bg-surface hover:text-heading"
                                }`}
                                whileHover={{ scale: 1.02, x: 3 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {item.label}
                                <motion.div
                                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r"
                                  initial={{ scaleY: 0 }}
                                  animate={{
                                    scaleY: isActive(item.path) ? 1 : 0,
                                  }}
                                  whileHover={{ scaleY: 1 }}
                                />
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              );
            },
          )}
        </nav>

        {/* Footer */}
        <div className="relative z-10 flex-shrink-0 border-t border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--heading)_4%,transparent),color-mix(in_srgb,var(--heading)_2%,transparent))] p-4">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <NotificationBellButton
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-heading/90 transition-all hover:bg-surface-strong hover:text-heading"
                iconClassName="h-4 w-4"
                showLabel
                labelClassName="flex-1 text-left"
              />
              <button
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-700 dark:text-rose-300 transition-all hover:bg-rose-500/10 hover:text-rose-200"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              <NotificationBellButton
                className="cursor-pointer rounded-xl p-2 text-heading/80 transition-all hover:bg-surface-strong hover:text-heading"
                iconClassName="h-[18px] w-[18px]"
              />
              <button
                onClick={handleLogout}
                className="cursor-pointer rounded-xl p-2 text-rose-700 dark:text-rose-300 transition-all hover:bg-rose-500/10 hover:text-rose-200"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      <style>{`
        @media (min-width: 1024px) {
          .client-sidebar-shell::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at 18% 25%, rgba(56,189,248,0.16), transparent 28%),
              radial-gradient(circle at 82% 78%, rgba(148,163,184,0.12), transparent 34%);
            animation: sidebarLightSweep 18s linear infinite;
            z-index: 0;
            pointer-events: none;
          }
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--accent-color) 45%, transparent);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--accent-color) 65%, transparent);
        }

        @keyframes sidebarLightSweep {
          0% { transform: translateX(-20%) translateY(-20%); }
          50% { transform: translateX(20%) translateY(20%); }
          100% { transform: translateX(-20%) translateY(-20%); }
        }
      `}</style>
    </>
  );
}
