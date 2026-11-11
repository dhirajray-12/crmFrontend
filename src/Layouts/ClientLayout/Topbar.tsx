import { useAuthStore } from "@/Store/auth.store";
import { useProfileStore } from "@/Store/profile.store";
import { NotificationBellButton } from "@/components/Common/NotificationBellButton";
import { useAppTour } from "@/components/AppTour/AppTourProvider";
import { useLogout } from "@/hooks/useLogout";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateAccountModalProps from "../../pages/ClientPage/DashboardComponents/CreateAccountModalprops";
import DepositModal from "../../pages/ClientPage/DashboardComponents/DepositModal";
import WithdrawalForm from "../../pages/ClientPage/DashboardComponents/WithdrawalForm";
import "../../styles/animatedSky.css";

interface TopbarProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Account {
  _id: string;
  account: string;
  balance: string;
  color: string;
  accountType: string;
  accountNumber: string;
}

interface WithdrawalAPIResponse {
  success: boolean;
  data: any;
  count?: number;
}

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  BASIC: "from-blue-300 to-indigo-500",
  PRIME: "from-yellow-300 to-orange-500",
  ALPHA: "from-green-300 to-emerald-500",
  PROEDGE: "from-purple-300 to-indigo-500",
  INFINITY: "from-pink-300 to-purple-500",
};

export default function Topbar({ setSidebarOpen }: TopbarProps) {
  const [search, setSearch] = useState("");
  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [openDepositModal, setOpenDepositModal] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(false);
  // const [sidebarOpen, setSidebarOpenLocal] = useState(false);

  const [availableBalances, setAvailableBalances] = useState<Account[]>([]);
  const [savedWallets, setSavedWallets] = useState<any>(null);

  useEffect(() => {
    setSavedWallets({
      usdt: "",
      eth: "",
      tron: "",
    });
  }, []);

  const profileRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { hasTour, showLauncher, startCurrentTour, toursDisabled, toggleToursDisabled } =
    useAppTour();

  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const setActiveSection = useProfileStore((state) => state.setActiveSection);

  useEffect(() => {
    fetchAccounts();
    fetchProfileWallets();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get<WithdrawalAPIResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/accounts`,
        {
          withCredentials: true,
        },
      );
      const formattedAccounts: Account[] = res.data.data.map((acc: any) => ({
        _id: acc._id,
        account: acc.mt5Account,
        balance: `$${acc.balance.toFixed(2)}`,
        color:
          ACCOUNT_TYPE_COLORS[acc.accountType] || "from-gray-300 to-gray-500",
        accountType: acc.accountType,
        accountNumber: acc.mt5Account,
      }));

      setAvailableBalances(formattedAccounts);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchProfileWallets = async () => {
    try {
      const res = await axios.get<WithdrawalAPIResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/profile`,
        {
          withCredentials: true,
        },
      );

      const w = res.data.data.walletDetails;

      if (w) {
        setSavedWallets({
          usdt: w.tetherWalletAddress || "",
          eth: w.ethWalletAddress || "",
          tron: w.trxWalletAddress || "",
        });
      }
    } catch (err) {
      console.error("Profile wallet fetch error:", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setOpenProfileMenu(false);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setOpenProfileMenu(false);
    logout();
  };

  const handleWithdrawalSuccess = () => {
    fetchAccounts();
  };

  // ✅ Toggle sidebar function
  const toggleSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen((prev) => !prev);
    }
  };

  return (
    <>
      <div className="client-theme-surface w-full rounded-3xl">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 gap-2">
          {/* ✅ Mobile Hamburger Button - now toggles sidebar */}
          <button
            className="shrink-0 rounded-xl border border-border bg-surface p-2 text-heading transition-colors hover:bg-surface-strong lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Search - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
              <input
                type="text"
                placeholder="Search accounts, transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="client-theme-input h-10 w-full rounded-xl pl-10 pr-4 text-sm transition-all duration-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
            {/* Desktop Action Buttons - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setOpenAccountModal(true)}
                className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2 text-sm font-medium text-accent shadow-accent-glow transition-colors hover:bg-accent-soft/70 focus:outline-none lg:px-4"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Open Account</span>
              </button>

              <button
                onClick={() => setOpenDepositModal(true)}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/[0.16] px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-100 shadow-[0_12px_30px_rgba(6,78,59,0.28)] transition-colors hover:bg-emerald-500/24 focus:outline-none lg:px-4"
              >
                <ArrowUpCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Deposit</span>
              </button>

              <button
                onClick={() => setOpenWithdrawModal(true)}
                className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/[0.16] px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-100 shadow-[0_12px_30px_rgba(76,5,25,0.28)] transition-colors hover:bg-rose-500/24 focus:outline-none lg:px-4"
              >
                <ArrowDownCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Withdraw</span>
              </button>
            </div>

            {/* Mobile Action Button - Shows menu icon on mobile */}
            <div className="md:hidden relative" ref={actionMenuRef}>
              <button
                onClick={() => setOpenActionMenu(!openActionMenu)}
                className="rounded-xl border border-border bg-surface p-2 text-heading shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition-colors hover:bg-surface-strong focus:outline-none"
              >
                <PlusCircle className="h-5 w-5" />
              </button>

              {/* Mobile Action Menu Dropdown */}
              {openActionMenu && (
                <div className="client-theme-surface-strong absolute right-0 z-[9999] mt-2 w-52 overflow-hidden rounded-2xl animate-in slide-in-from-top-2 duration-200 sm:w-48">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setOpenAccountModal(true);
                        setOpenActionMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-heading transition-colors hover:bg-surface-strong"
                    >
                      <PlusCircle className="h-4 w-4 text-accent" />
                      Open Account
                    </button>
                    <button
                      onClick={() => {
                        setOpenDepositModal(true);
                        setOpenActionMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-heading transition-colors hover:bg-surface-strong"
                    >
                      <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      Deposit
                    </button>
                    <button
                      onClick={() => {
                        setOpenWithdrawModal(true);
                        setOpenActionMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-heading transition-colors hover:bg-surface-strong"
                    >
                      <ArrowDownCircle className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                      Withdraw
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider - Hidden on mobile */}
            <div className="hidden md:block h-6 w-px bg-border mx-2"></div>

            <NotificationBellButton
              className="relative rounded-xl border border-border bg-surface p-2.5 text-heading transition-colors hover:bg-surface-strong"
              iconClassName="h-5 w-5"
            />

            {hasTour && showLauncher && (
              <button
                type="button"
                onClick={startCurrentTour}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft/70"
              >
                <Sparkles className="h-4 w-4" />
                Guide
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenProfileMenu(!openProfileMenu)}
                className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1.5 transition-colors hover:bg-surface-strong focus:outline-none sm:gap-2 sm:p-1"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center rounded-full border border-border bg-gradient-to-br from-accent to-accent-hover p-1 sm:h-10 sm:w-10">
                  <User className="h-5 w-6 sm:h-6 sm:w-8 text-accent-foreground" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-heading">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-subtle">{user?.email}</p>
                </div>
                <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-heading flex-shrink-0" />
              </button>

              {/* Profile Menu Dropdown */}
              {openProfileMenu && (
                <div className="client-theme-surface-strong absolute right-0 z-[9999] mt-2 w-56 overflow-hidden rounded-2xl animate-in slide-in-from-top-2 duration-200 sm:w-64">
                  {/* User Info */}
                  <div className="border-b border-border bg-surface px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center rounded-full border border-border bg-gradient-to-br from-accent to-accent-hover p-1">
                        <User className="h-6 w-8 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-heading">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="truncate text-xs text-subtle">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        toggleToursDisabled();
                        setOpenProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-heading transition-colors hover:bg-surface-strong"
                    >
                      <Sparkles className="h-4 w-4 text-subtle" />
                      {toursDisabled ? "Enable Tours" : "Disable Tours"}
                    </button>

                    <button
                      onClick={() => {
                        setActiveSection("personal");
                        navigate("/client/profile");
                        setOpenProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-heading transition-colors hover:bg-surface-strong"
                    >
                      <UserRound className="h-4 w-4 text-subtle" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setActiveSection("account");
                        navigate("/client/profile");
                        setOpenProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-heading transition-colors hover:bg-surface-strong"
                    >
                      <Settings className="h-4 w-4 text-subtle" />
                      Account Details
                    </button>

                    <button
                      onClick={() => {
                        setActiveSection("wallet");
                        navigate("/client/profile");
                        setOpenProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-heading transition-colors hover:bg-surface-strong"
                    >
                      <ArrowUpCircle className="h-4 w-4 text-subtle" />
                      Wallet Details
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border bg-surface">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-300 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Shows below main topbar on mobile */}
        <div className="md:hidden px-3 pb-3">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="client-theme-input h-10 w-full rounded-xl pl-10 pr-4 text-sm transition-all duration-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAccountModalProps
        open={openAccountModal}
        onClose={() => setOpenAccountModal(false)}
      />
      <DepositModal
        open={openDepositModal}
        onClose={() => setOpenDepositModal(false)}
      />

      <WithdrawalForm
        isOpen={openWithdrawModal}
        onClose={() => setOpenWithdrawModal(false)}
        availableBalances={availableBalances}
        onSuccess={handleWithdrawalSuccess}
        savedWallets={savedWallets}
      />
    </>
  );
}
