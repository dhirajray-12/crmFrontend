import { useToastStore } from "@/Store/toast.store";
import {
  Activity,
  ArrowLeft,
  Award,
  DollarSign,
  Filter,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UserAccount {
  _id: string;
  mt5Account: string;
  accountType: string;
  updatedAt: string;
}

interface MasterTrader {
  id: string;
  name: string;
  avatar: string;
  expertise:
    | "legend"
    | "expert"
    | "vertical_take_off"
    | "young_talent"
    | "new_comers";
  riskScore: number;
  growth: string;
  profitLoss: number;
  copiers: number;
  fees: string;
  capital: string;
  minInvestment: number;
  activeSince: string;
  description?: string;
  telegramLink?: string | null;
  performance?: {
    profit: string;
    copier: number;
    profitAndLoss: string;
  };
  accountDetails?: {
    unrealizedProfit: number;
    accountBalance: string;
    masterTraderBonus: string;
    lever: string;
  };
  riskManagement?: {
    maxUnrealizedLoss: number;
    maxLossDuration: string;
  };
  activityData?: {
    [key: string]: Array<{ date: string; value: number; profit: number }>;
  };
  trades?: Array<{
    id: string;
    symbol: string;
    type: string;
    openTime: string;
    closeTime: string;
    duration: string;
    profit: number;
  }>;
  stats?: unknown;
}

interface FilterState {
  expertise: string;
  maxRiskScore: string;
  minGrowth: string;
  minCopiers: string;
  feeType: string;
  sortBy: string;
}

interface SetupCopyingData {
  masterAccount: string;
  copierAccount: string;
  minInvestment: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const apiService = {
  getAllMasters: async (): Promise<ApiResponse<MasterTrader[]>> => {
    const response = await fetch(`${API_BASE_URL}/copy-rating/masters`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch masters");
    return response.json();
  },

  getUserAccounts: async (): Promise<ApiResponse<UserAccount[]>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/copy-accounts`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch user accounts");
    return response.json();
  },

  getMasterDetails: async (
    masterId: string,
  ): Promise<ApiResponse<MasterTrader>> => {
    const response = await fetch(
      `${API_BASE_URL}/copy-rating/master/${masterId}`,
      {
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch master details");
    return response.json();
  },

  setupCopying: async (
    data: SetupCopyingData,
  ): Promise<ApiResponse<unknown>> => {
    const response = await fetch(`${API_BASE_URL}/copy-rating/setup-copying`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to setup copying");
    return response.json();
  },

  deleteMaster: async (masterId: string): Promise<ApiResponse<unknown>> => {
    const response = await fetch(`${API_BASE_URL}/copy-rating/master/${masterId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete master");
    }
    return response.json();
  },
};

const pageBackgroundStyle = {
  background: `
    radial-gradient(circle at top left, rgba(239, 227, 202, 0.55), transparent 28%),
    radial-gradient(circle at top right, rgba(222, 204, 168, 0.32), transparent 24%),
    linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
  `,
};

const modalSurfaceStyle = {
  background: "linear-gradient(160deg, var(--surface-strong) 0%, var(--surface-strong) 100%)",
  boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
};

const contentSurfaceClassName =
  "rounded-[30px] border border-border bg-surface-strong p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08)] sm:p-6";

const elevatedSurfaceClassName =
  "rounded-[30px] border border-border bg-surface p-5 shadow-[0_18px_34px_rgba(116,93,56,0.08),0_30px_70px_rgba(116,93,56,0.12)] ring-1 ring-white/65 dark:ring-white/10 sm:p-6";

const SummaryTile = ({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
}) => (
  <div className="rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)]">
    <div className="mb-3 flex items-center justify-between">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
        {label}
      </div>
      <Icon className="h-4 w-4 text-body" />
    </div>
    <div className="text-2xl font-semibold tracking-tight text-heading">
      {value}
    </div>
    <div className="mt-1 text-sm text-body">{detail}</div>
  </div>
);

const expertiseConfig: Record<
  MasterTrader["expertise"],
  {
    label: string;
    icon: string;
    tone: string;
    tint: string;
    border: string;
  }
> = {
  legend: {
    label: "Legend",
    icon: "I",
    tone: "#fdf5e0",
    tint: "#7a5a10",
    border: "var(--border)",
  },
  expert: {
    label: "Expert",
    icon: "II",
    tone: "#f3f0ea",
    tint: "#5a4020",
    border: "var(--border)",
  },
  vertical_take_off: {
    label: "Vertical Take Off",
    icon: "III",
    tone: "#edf5e8",
    tint: "#3f5a20",
    border: "#c9ddb8",
  },
  young_talent: {
    label: "Young Talent",
    icon: "IV",
    tone: "#f8efe8",
    tint: "#7a4a2a",
    border: "var(--border)",
  },
  new_comers: {
    label: "New Comers",
    icon: "V",
    tone: "#f7f3ed",
    tint: "#6b5a45",
    border: "var(--border)",
  },
};

const formatCurrency = (value: number | string | undefined) => {
  const numeric =
    typeof value === "string"
      ? Number(value.toString().replace(/,/g, ""))
      : value ?? 0;

  if (Number.isNaN(numeric)) return "$0";
  return `$${numeric.toLocaleString()}`;
};

const parseGrowth = (value: string) => parseFloat(value.replace("%", "")) || 0;

const getRiskMeta = (score: number) => {
  if (score <= 3) {
    return {
      label: "Low risk",
      bg: "#edf8e8",
      text: "#2a5a1a",
      border: "#b9d8a8",
    };
  }
  if (score <= 6) {
    return {
      label: "Balanced",
      bg: "#fdf5d8",
      text: "#7a5010",
      border: "var(--border)",
    };
  }
  return {
    label: "High risk",
    bg: "#fbeee8",
    text: "#7a2a2a",
    border: "#ddb8b0",
  };
};

interface SetupCopyingModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterAccount: string;
  masterName: string;
  minInvestment: number;
  onSuccess: () => void;
}

const SetupCopyingModal = ({
  isOpen,
  onClose,
  masterAccount,
  masterName,
  minInvestment,
  onSuccess,
}: SetupCopyingModalProps) => {
  const addToast = useToastStore((state) => state.addToast);
  const [copierAccount, setCopierAccount] = useState("");
  const [investment, setInvestment] = useState(minInvestment.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setInvestment(minInvestment.toString());
    setCopierAccount("");
    setError("");
    void fetchUserAccounts();
  }, [isOpen, minInvestment]);

  const fetchUserAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await apiService.getUserAccounts();
      setUserAccounts(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load your accounts";
      addToast("error", message);
      setError(message);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await apiService.setupCopying({
        masterAccount,
        copierAccount,
        minInvestment: parseFloat(investment),
      });
      addToast("success", "Copy trading setup successful");
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to setup copying";
      addToast("error", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(44,31,14,0.65)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border overflow-hidden"
        style={modalSurfaceStyle}
      >
        <div
          className="relative border-b border-border p-5 sm:p-6"
          style={{
            background: "linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 55%, var(--surface-strong) 100%)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-accent opacity-10" />
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-accent">
                  Copy Allocation
                </p>
                <h3 className="mt-1 font-['Cormorant_Garamond',_serif] text-xl font-light text-heading">
                  Setup Copy Trading
                </h3>
                <p className="mt-1 font-['Lato',_sans-serif] text-xs text-subtle">
                  Assign one of your accounts to this master strategy
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-heading transition-colors hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-xl border p-3"
              style={{ background: "var(--surface-strong)", borderColor: "var(--border)" }}
            >
              <p className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-accent">
                Master
              </p>
              <p className="mt-1 break-words font-['Cormorant_Garamond',_serif] text-lg font-semibold text-heading">
                {masterName}
              </p>
            </div>
            <div
              className="rounded-xl border p-3"
              style={{ background: "var(--surface-strong)", borderColor: "var(--border)" }}
            >
              <p className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-accent">
                Minimum Investment
              </p>
              <p className="mt-1 font-['Cormorant_Garamond',_serif] text-lg font-semibold text-heading">
                {formatCurrency(minInvestment)}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-surface-strong p-4">
            <label className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
              Select Your Account
            </label>
            {loadingAccounts ? (
              <div className="rounded-xl border border-border bg-surface-strong px-4 py-3 text-sm text-body">
                Loading accounts...
              </div>
            ) : userAccounts.length === 0 ? (
              <div className="rounded-xl border border-[#ddb8b0] bg-surface-strong px-4 py-3 text-sm text-[#7a2a2a] dark:text-[#d58686]">
                No accounts found. Please create an account first.
              </div>
            ) : (
              <select
                value={copierAccount}
                onChange={(e) => setCopierAccount(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading font-['Lato',_sans-serif] focus:border-accent focus:outline-none"
              >
                <option value="">Select an account</option>
                {userAccounts.map((account) => (
                  <option key={account._id} value={account.mt5Account}>
                    {account.mt5Account} - {account.accountType}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-surface-strong p-4">
            <label className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
              Investment Amount
            </label>
            <input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              min={minInvestment}
              step="0.01"
              className="w-full rounded-xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading font-['Lato',_sans-serif] focus:border-accent focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[#ddb8b0] bg-surface-strong px-4 py-3 text-sm text-[#7a2a2a] dark:text-[#d58686]">
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm text-heading transition-all hover:bg-surface font-['Lato',_sans-serif]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || userAccounts.length === 0 || !copierAccount}
              className="flex-1 rounded-xl py-2.5 text-sm transition-all hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 font-['Lato',_sans-serif]"
              style={{
                background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                color: "var(--heading)",
              }}
            >
              {loading ? "Setting up..." : "Confirm Allocation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FilterPanelProps {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  onApply: () => void;
  onReset: () => void;
}

const FilterPanel = ({
  filters,
  setFilters,
  onApply,
  onReset,
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectClassName =
    "w-full rounded-xl border border-border bg-surface-strong px-3.5 py-2.5 text-sm text-heading font-['Lato',_sans-serif] focus:border-accent focus:outline-none";
  const inputClassName =
    "w-full rounded-xl border border-border bg-surface-strong px-3.5 py-2.5 text-sm text-heading placeholder:text-accent font-['Lato',_sans-serif] focus:border-accent focus:outline-none";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-border bg-[rgba(255,253,250,0.88)] dark:bg-surface-strong px-4 py-3 text-sm text-heading transition-all hover:bg-surface font-['Lato',_sans-serif]"
        style={{ boxShadow: "0 2px 12px rgba(139,100,40,0.07)" }}
      >
        <Filter className="h-4 w-4 text-body" />
        Curate View
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border p-5"
            style={modalSurfaceStyle}
          >
            <div className="mb-4">
              <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-accent">
                Filter Deck
              </p>
              <h3 className="mt-1 font-['Cormorant_Garamond',_serif] text-2xl font-light text-heading">
                Master Criteria
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                  Expertise Level
                </label>
                <select
                  value={filters.expertise}
                  onChange={(e) =>
                    setFilters({ ...filters, expertise: e.target.value })
                  }
                  className={selectClassName}
                >
                  <option value="">All Levels</option>
                  <option value="legend">Legend</option>
                  <option value="expert">Expert</option>
                  <option value="vertical_take_off">Vertical Take Off</option>
                  <option value="young_talent">Young Talent</option>
                  <option value="new_comers">New Comers</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                  Max Risk Score
                </label>
                <select
                  value={filters.maxRiskScore}
                  onChange={(e) =>
                    setFilters({ ...filters, maxRiskScore: e.target.value })
                  }
                  className={selectClassName}
                >
                  <option value="">Any Risk</option>
                  <option value="3">Low (1-3)</option>
                  <option value="5">Balanced (4-5)</option>
                  <option value="10">High (6-10)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                  Minimum Growth
                </label>
                <input
                  type="number"
                  value={filters.minGrowth}
                  onChange={(e) =>
                    setFilters({ ...filters, minGrowth: e.target.value })
                  }
                  placeholder="0"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="mb-2 block font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                  Minimum Copiers
                </label>
                <input
                  type="number"
                  value={filters.minCopiers}
                  onChange={(e) =>
                    setFilters({ ...filters, minCopiers: e.target.value })
                  }
                  placeholder="0"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="mb-2 block font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                  Fee Type
                </label>
                <select
                  value={filters.feeType}
                  onChange={(e) =>
                    setFilters({ ...filters, feeType: e.target.value })
                  }
                  className={selectClassName}
                >
                  <option value="">All</option>
                  <option value="FREE">Free Only</option>
                  <option value="PAID">Paid Only</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className={selectClassName}
                >
                  <option value="growth">Growth</option>
                  <option value="copiers">Copiers</option>
                  <option value="profitLoss">Profit/Loss</option>
                  <option value="riskScore">Risk Score</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm text-heading transition-all hover:bg-surface font-['Lato',_sans-serif]"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  onApply();
                  setIsOpen(false);
                }}
                className="flex-1 rounded-xl py-2.5 text-sm transition-all hover:opacity-85 font-['Lato',_sans-serif]"
                style={{
                  background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                  color: "var(--heading)",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CopyTradingRating = () => {
  const [timeFilter, setTimeFilter] = useState("1M");
  const [activeTab, setActiveTab] = useState<"closed" | "open">("closed");
  const queryClient = useQueryClient();
  const [selectedMaster, setSelectedMaster] = useState<MasterTrader | null>(null);
  const [filteredMasters, setFilteredMasters] = useState<MasterTrader[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    expertise: "",
    maxRiskScore: "",
    minGrowth: "",
    minCopiers: "",
    feeType: "",
    sortBy: "growth",
  });
  const addToast = useToastStore((state) => state.addToast);

  const {
    data: masters = [],
    isLoading: loading,
    error: mastersQueryError,
  } = useQuery({
    queryKey: ["adminCopyMasters"],
    queryFn: async () => {
      const response = await apiService.getAllMasters();
      return response.data || [];
    },
    staleTime: 15 * 1000,
  });
  const error =
    mastersQueryError instanceof Error
      ? mastersQueryError.message
      : mastersQueryError
        ? "Failed to fetch masters"
        : "";

  useEffect(() => {
    if (!mastersQueryError) return;
    addToast("error", error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mastersQueryError]);

  const invalidateMasters = () =>
    queryClient.invalidateQueries({ queryKey: ["adminCopyMasters"] });

  useEffect(() => {
    applyFilters();
  }, [masters, searchQuery, filters]);

  const fetchMasterDetails = async (masterId: string) => {
    try {
      const response = await apiService.getMasterDetails(masterId);
      setSelectedMaster(response.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch master details";
      addToast("error", message);
    }
  };

  const applyFilters = () => {
    let filtered = [...masters];

    if (searchQuery) {
      filtered = filtered.filter(
        (master) =>
          master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          master.id.includes(searchQuery),
      );
    }

    if (filters.expertise) {
      filtered = filtered.filter((master) => master.expertise === filters.expertise);
    }

    if (filters.maxRiskScore) {
      filtered = filtered.filter(
        (master) => master.riskScore <= parseInt(filters.maxRiskScore),
      );
    }

    if (filters.minGrowth) {
      filtered = filtered.filter(
        (master) => parseGrowth(master.growth) >= parseFloat(filters.minGrowth),
      );
    }

    if (filters.minCopiers) {
      filtered = filtered.filter(
        (master) => master.copiers >= parseInt(filters.minCopiers),
      );
    }

    if (filters.feeType) {
      filtered =
        filters.feeType === "FREE"
          ? filtered.filter((master) => master.fees === "FREE")
          : filtered.filter((master) => master.fees !== "FREE");
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "growth":
          return parseGrowth(b.growth) - parseGrowth(a.growth);
        case "copiers":
          return b.copiers - a.copiers;
        case "profitLoss":
          return b.profitLoss - a.profitLoss;
        case "riskScore":
          return a.riskScore - b.riskScore;
        default:
          return 0;
      }
    });

    setFilteredMasters(filtered);
  };

  const resetFilters = () => {
    setFilters({
      expertise: "",
      maxRiskScore: "",
      minGrowth: "",
      minCopiers: "",
      feeType: "",
      sortBy: "growth",
    });
    setSearchQuery("");
  };

  const handleSuccess = () => {
    invalidateMasters();
  };

  const handleDeleteMaster = async (masterId: string, e: MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this master trader?")) return;

    try {
      await apiService.deleteMaster(masterId);
      addToast("success", "Master deleted successfully!");

      if (selectedMaster?.id === masterId) {
        setSelectedMaster(null);
      }

      invalidateMasters();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete master";
      addToast("error", message);
    }
  };

  const freeStrategies = masters.filter((master) => master.fees === "FREE").length;
  const highRiskStrategies = masters.filter((master) => master.riskScore > 6).length;
  const topGrowthMaster = [...filteredMasters].sort(
    (a, b) => parseGrowth(b.growth) - parseGrowth(a.growth),
  )[0];

  const selectedPerformancePeriods = selectedMaster?.activityData
    ? Object.keys(selectedMaster.activityData)
    : [];
  const availablePeriods =
    selectedPerformancePeriods.length > 0
      ? selectedPerformancePeriods
      : ["1W", "1M", "3M", "6M", "ALL"];
  const chartPeriod = selectedMaster?.activityData?.[timeFilter]
    ? timeFilter
    : availablePeriods[0];
  const chartData = selectedMaster?.activityData?.[chartPeriod] || [];

  useEffect(() => {
    if (!selectedMaster) return;
    const periods = selectedMaster.activityData
      ? Object.keys(selectedMaster.activityData)
      : [];
    if (periods[0] && !selectedMaster.activityData?.[timeFilter]) {
      setTimeFilter(periods[0]);
    }
  }, [selectedMaster, timeFilter]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6 font-['Cormorant_Garamond',_'Georgia',_serif]"
        style={pageBackgroundStyle}
      >
        <div
          className="rounded-2xl border border-border px-8 py-6 text-center bg-[rgba(255,253,250,0.88)] dark:bg-surface-strong"
          style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.09)" }}
        >
          <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-accent">
            Admin Rating
          </p>
          <p className="mt-2 text-2xl font-light text-heading">
            Loading masters...
          </p>
        </div>
      </div>
    );
  }

  if (error && !masters.length) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6 font-['Cormorant_Garamond',_'Georgia',_serif]"
        style={pageBackgroundStyle}
      >
        <div
          className="rounded-2xl border border-[#ddb8b0] px-8 py-6 text-center"
          style={{ background: "var(--surface-strong)", boxShadow: "0 10px 30px rgba(122,42,42,0.08)" }}
        >
          <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-[#b07a7a]">
            Data Error
          </p>
          <p className="mt-2 text-2xl font-light text-[#7a2a2a] dark:text-[#d58686]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Cormorant_Garamond',_'Georgia',_serif]"
      style={pageBackgroundStyle}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <section className={elevatedSurfaceClassName}>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                <Award className="h-3.5 w-3.5" />
                Copy Strategy Desk
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
                Master rating and allocation overview
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-body font-['Lato',_sans-serif]">
                Review master trader performance, compare risk posture, and open
                detailed strategy profiles from the same warm operations theme
                used across admin support.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
                  Total Masters
                </p>
                <p className="mt-1 text-2xl font-semibold text-heading">
                  {masters.length}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-body">
                  Visible Now
                </p>
                <p className="mt-1 text-2xl font-semibold text-heading">
                  {filteredMasters.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {!selectedMaster ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryTile
                label="Strategy Pool"
                value={String(masters.length)}
                detail={`${filteredMasters.length} visible after current filters`}
                icon={Users}
              />
              <SummaryTile
                label="Free Access"
                value={String(freeStrategies)}
                detail="Masters available without strategy fees"
                icon={DollarSign}
              />
              <SummaryTile
                label="High Risk"
                value={String(highRiskStrategies)}
                detail="Profiles above a risk score of 6"
                icon={Shield}
              />
              <SummaryTile
                label="Top Growth"
                value={topGrowthMaster?.growth || "N/A"}
                detail={
                  topGrowthMaster
                    ? `${topGrowthMaster.name} leads the visible list`
                    : "Apply fewer filters to compare more masters"
                }
                icon={TrendingUp}
              />
            </section>

            <section className={contentSurfaceClassName}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                    <Filter className="h-3.5 w-3.5" />
                    Strategy Filters
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading">
                    Search and narrow the rating board
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-body font-['Lato',_sans-serif]">
                    Filter by expertise, risk, copier count, and fee structure
                    before opening a full master profile.
                  </p>
                </div>

                <div className="flex-1 lg:max-w-xl">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                    <input
                      type="text"
                      placeholder="Search master by name or account..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-surface-strong py-3 pl-10 pr-4 text-sm text-heading placeholder:text-accent font-['Lato',_sans-serif] focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    onApply={applyFilters}
                    onReset={resetFilters}
                  />
                  <button
                    onClick={resetFilters}
                    className="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading transition-all hover:bg-surface-strong font-['Lato',_sans-serif]"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </section>

            {filteredMasters.length === 0 ? (
              <section className="rounded-[30px] border border-border bg-surface-strong/65 p-10 text-center shadow-[0_18px_34px_rgba(116,93,56,0.08)] backdrop-blur-sm sm:p-14">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                  No Matches
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading">
                  No master traders fit this view
                </h2>
                <p className="mt-2 text-sm text-body font-['Lato',_sans-serif]">
                  Adjust the curation rules or reset the filters to recover the full deck.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 font-['Lato',_sans-serif]"
                >
                  Reset Filters
                </button>
              </section>
            ) : (
              <section className="rounded-[30px] border border-border bg-surface-strong/65 p-4 shadow-[0_18px_34px_rgba(116,93,56,0.08)] backdrop-blur-sm sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                      Strategy Board
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-heading">
                      Visible master trader profiles
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface-strong px-3 py-2 text-sm font-medium text-body">
                    {filteredMasters.length} shown
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMasters.map((master) => {
                  const expertise = expertiseConfig[master.expertise] || expertiseConfig.new_comers;
                  const risk = getRiskMeta(master.riskScore);

                  return (
                    <div
                      key={master.id}
                      onClick={() => void fetchMasterDetails(master.id)}
                      className="group rounded-[28px] border border-border bg-surface-strong p-0 text-left shadow-[0_16px_30px_rgba(141,109,60,0.08)] transition-all duration-200 hover:-translate-y-0.5"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          void fetchMasterDetails(master.id);
                        }
                      }}
                    >
                      <div className="relative overflow-hidden rounded-[28px] border border-transparent">
                        <div
                          className="relative border-b border-border p-5"
                          style={{
                            background:
                              "radial-gradient(circle at top right, var(--hero-glow-1), transparent 30%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 100%)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => void handleDeleteMaster(master.id, e)}
                            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-strong text-[#7a2a2a] dark:text-[#d58686] opacity-100 transition-all hover:bg-surface-strong sm:opacity-0 sm:group-hover:opacity-100"
                            title="Delete Master"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="flex items-start gap-4 pr-12">
                            <div
                              className="flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl font-semibold"
                              style={{
                                background: "var(--surface-strong)",
                                color: "var(--heading)",
                                borderColor: "var(--border)",
                              }}
                            >
                              {master.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-['Lato',_sans-serif] text-xs uppercase tracking-[0.25em] text-accent">
                                MT5 {master.id}
                              </p>
                              <h3 className="mt-1 truncate text-2xl font-light text-heading">
                                {master.name}
                              </h3>
                              <div
                                className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1"
                                style={{
                                  background: expertise.tone,
                                  color: expertise.tint,
                                  borderColor: expertise.border,
                                }}
                              >
                                <span className="font-['Cinzel',_serif] text-[11px] uppercase tracking-widest">
                                  {expertise.icon}
                                </span>
                                <span className="font-['Lato',_sans-serif] text-xs uppercase tracking-wide">
                                  {expertise.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 p-5">
                          <div className="grid grid-cols-2 gap-3">
                            <div
                              className="rounded-xl border p-3"
                              style={{ background: "var(--surface-strong)", borderColor: "var(--border)" }}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-heading" />
                                <span className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                                  Copiers
                                </span>
                              </div>
                              <p className="text-2xl font-light text-heading">
                                {master.copiers}
                              </p>
                            </div>

                            <div
                              className="rounded-xl border p-3"
                              style={{
                                background: risk.bg,
                                borderColor: risk.border,
                              }}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4" style={{ color: risk.text }} />
                                <span
                                  className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest"
                                  style={{ color: risk.text }}
                                >
                                  Risk
                                </span>
                              </div>
                              <p className="text-2xl font-light" style={{ color: risk.text }}>
                                {master.riskScore}/10
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div
                              className="rounded-xl border p-3"
                              style={{
                                background: "color-mix(in srgb, #b9d8a8 22%, var(--surface-strong))",
                                borderColor: "color-mix(in srgb, #b9d8a8 45%, var(--border))",
                              }}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-[#2a5a1a] dark:text-[#97da81]" />
                                <span className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-[#3a6a2a] dark:text-[#9cd18a]">
                                  Growth
                                </span>
                              </div>
                              <p className="text-2xl font-light text-[#2a5a1a] dark:text-[#97da81]">
                                {master.growth}
                              </p>
                            </div>

                            <div
                              className="rounded-xl border p-3"
                              style={{ background: "var(--surface-strong)", borderColor: "var(--border)" }}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-heading" />
                                <span className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                                  Fee
                                </span>
                              </div>
                              <p className="truncate text-2xl font-light text-heading">
                                {master.fees}
                              </p>
                            </div>
                          </div>

                          <div
                            className="rounded-xl border p-4"
                            style={{ background: "var(--surface-strong)", borderColor: "var(--border)" }}
                          >
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <span className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                                Profit & Loss
                              </span>
                              <span className="font-['Lato',_sans-serif] text-xs text-body">
                                Since {master.activeSince}
                              </span>
                            </div>
                            <p className="text-3xl font-light text-heading">
                              {formatCurrency(master.profitLoss)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedMaster(null)}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading transition-all hover:bg-surface-strong font-['Lato',_sans-serif]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Masters
            </button>

            <div className="overflow-hidden rounded-[30px] border border-border bg-surface-strong shadow-[0_18px_34px_rgba(116,93,56,0.08)]">
              <div
                className="border-b border-border p-6 sm:p-8"
                style={{
                  background:
                    "radial-gradient(circle at top right, var(--hero-glow-1), transparent 28%), radial-gradient(circle at top left, var(--hero-glow-2), transparent 34%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 52%, var(--surface) 100%)",
                }}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-border bg-surface-strong text-3xl font-semibold text-heading">
                      {selectedMaster.avatar}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-accent">
                          MT5 {selectedMaster.id}
                        </p>
                        <h2 className="mt-1 text-4xl font-light text-heading">
                          {selectedMaster.name}
                        </h2>
                        <p className="mt-3 max-w-2xl font-['Lato',_sans-serif] text-sm leading-relaxed text-body">
                          {selectedMaster.description || "No description available for this master."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <div
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                          style={{
                            background: expertiseConfig[selectedMaster.expertise].tone,
                            color: expertiseConfig[selectedMaster.expertise].tint,
                            borderColor: expertiseConfig[selectedMaster.expertise].border,
                          }}
                        >
                          <Award className="h-4 w-4" />
                          <span className="font-['Lato',_sans-serif] text-xs uppercase tracking-wide">
                            {expertiseConfig[selectedMaster.expertise].label}
                          </span>
                        </div>

                        <div
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                          style={{
                            background: getRiskMeta(selectedMaster.riskScore).bg,
                            color: getRiskMeta(selectedMaster.riskScore).text,
                            borderColor: getRiskMeta(selectedMaster.riskScore).border,
                          }}
                        >
                          <Shield className="h-4 w-4" />
                          <span className="font-['Lato',_sans-serif] text-xs uppercase tracking-wide">
                            {getRiskMeta(selectedMaster.riskScore).label} · {selectedMaster.riskScore}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setShowCopyModal(true)}
                      className="rounded-xl px-5 py-3 text-sm transition-all hover:opacity-85 font-['Lato',_sans-serif]"
                      style={{
                        background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                        color: "var(--heading)",
                      }}
                    >
                      Copy This Master
                    </button>
                    {selectedMaster.telegramLink && (
                      <a
                        href={selectedMaster.telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-strong px-5 py-3 text-sm text-heading transition-all hover:bg-surface font-['Lato',_sans-serif]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Telegram
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-b border-border p-6 sm:grid-cols-2 xl:grid-cols-5 sm:p-8">
                {[
                  {
                    label: "Capital",
                    value: formatCurrency(selectedMaster.capital),
                    bg: "color-mix(in srgb, #e8d8b8 22%, var(--surface-strong))",
                    border: "var(--border)",
                    text: "var(--heading)",
                  },
                  {
                    label: "Min Investment",
                    value: formatCurrency(selectedMaster.minInvestment),
                    bg: "color-mix(in srgb, #e8d090 22%, var(--surface-strong))",
                    border: "var(--border)",
                    text: "var(--heading)",
                  },
                  {
                    label: "Copiers",
                    value: selectedMaster.copiers.toLocaleString(),
                    bg: "color-mix(in srgb, #d8c8a8 22%, var(--surface-strong))",
                    border: "var(--border)",
                    text: "var(--heading)",
                  },
                  {
                    label: "Fee Structure",
                    value: selectedMaster.fees,
                    bg: "color-mix(in srgb, #b9d8a8 22%, var(--surface-strong))",
                    border: "color-mix(in srgb, #b9d8a8 45%, var(--border))",
                    text: "var(--status-green)",
                  },
                  {
                    label: "Active Since",
                    value: selectedMaster.activeSince,
                    bg: "color-mix(in srgb, #ddb8b0 22%, var(--surface-strong))",
                    border: "color-mix(in srgb, #ddb8b0 45%, var(--border))",
                    text: "var(--status-red)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border p-4"
                    style={{ background: item.bg, borderColor: item.border }}
                  >
                    <p className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-accent">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-light" style={{ color: item.text }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div
                  className="rounded-2xl border border-border p-5 sm:p-6"
                  style={{ background: "var(--surface-strong)" }}
                >
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-accent">
                        Performance
                      </p>
                      <h3 className="mt-1 flex items-center gap-2 text-3xl font-light text-heading">
                        <Activity className="h-6 w-6 text-body" />
                        Performance Overview
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availablePeriods.map((period) => (
                        <button
                          key={period}
                          onClick={() => setTimeFilter(period)}
                          className="rounded-xl px-3.5 py-2 text-xs transition-all font-['Lato',_sans-serif]"
                          style={
                            chartPeriod === period
                              ? {
                                  background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                                  color: "var(--heading)",
                                }
                              : {
                                  background: "var(--surface-strong)",
                                  color: "var(--heading)",
                                  border: "1px solid var(--border)",
                                }
                          }
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 grid gap-3 md:grid-cols-3">
                    {[
                      {
                        label: "Profit %",
                        value: selectedMaster.performance?.profit || "N/A",
                        bg: "color-mix(in srgb, #b9d8a8 22%, var(--surface-strong))",
                        border: "color-mix(in srgb, #b9d8a8 45%, var(--border))",
                        text: "var(--status-green)",
                      },
                      {
                        label: "No. of Copiers",
                        value: String(selectedMaster.performance?.copier || 0),
                        bg: "color-mix(in srgb, #e8d090 22%, var(--surface-strong))",
                        border: "var(--border)",
                        text: "var(--heading)",
                      },
                      {
                        label: "Total P&L",
                        value: formatCurrency(
                          selectedMaster.performance?.profitAndLoss || "0",
                        ),
                        bg: "color-mix(in srgb, #e0c0a0 22%, var(--surface-strong))",
                        border: "var(--border)",
                        text: "var(--heading)",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border p-4 sm:p-5"
                        style={{ background: item.bg, borderColor: item.border }}
                      >
                        <p className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body">
                          {item.label}
                        </p>
                        <p className="mt-2 text-4xl font-light" style={{ color: item.text }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {chartData.length > 0 ? (
                    <div
                      className="rounded-2xl border border-border p-4 sm:p-6"
                      style={{ background: "var(--surface-strong)" }}
                    >
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--heading)" />
                          <XAxis dataKey="date" stroke="var(--body)" />
                          <YAxis stroke="var(--body)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--surface-strong)",
                              border: "1px solid var(--border)",
                              borderRadius: "12px",
                              color: "var(--heading)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="url(#masterRatingGradient)"
                            strokeWidth={3}
                            dot={{ fill: "var(--heading)", r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <defs>
                            <linearGradient
                              id="masterRatingGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#4a3218" />
                              <stop offset="100%" stopColor="#c4a055" />
                            </linearGradient>
                          </defs>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-surface-strong px-6 py-10 text-center">
                      <p className="font-['Lato',_sans-serif] text-sm text-body">
                        No chart data available for this period.
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="rounded-2xl border border-border p-5 sm:p-6"
                  style={{ background: "var(--surface-strong)" }}
                >
                  <div className="mb-5">
                    <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-accent">
                      Account Detail
                    </p>
                    <h3 className="mt-1 text-3xl font-light text-heading">
                      Master Account Metrics
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {[
                      {
                        label: "Unrealized Profit",
                        value: formatCurrency(selectedMaster.accountDetails?.unrealizedProfit),
                        bg: "color-mix(in srgb, #b9d8a8 22%, var(--surface-strong))",
                        border: "color-mix(in srgb, #b9d8a8 45%, var(--border))",
                        text: "var(--status-green)",
                      },
                      {
                        label: "Account Balance",
                        value: formatCurrency(selectedMaster.accountDetails?.accountBalance),
                        bg: "color-mix(in srgb, #e8d8b8 22%, var(--surface-strong))",
                        border: "var(--border)",
                        text: "var(--heading)",
                      },
                      {
                        label: "Master Trader Bonus",
                        value: formatCurrency(selectedMaster.accountDetails?.masterTraderBonus),
                        bg: "color-mix(in srgb, #e8d090 22%, var(--surface-strong))",
                        border: "var(--border)",
                        text: "var(--heading)",
                      },
                      {
                        label: "Leverage",
                        value: `1:${selectedMaster.accountDetails?.lever || "100"}`,
                        bg: "color-mix(in srgb, #d8c8a8 22%, var(--surface-strong))",
                        border: "var(--border)",
                        text: "var(--heading)",
                      },
                      {
                        label: "Max Unrealized Loss",
                        value: formatCurrency(selectedMaster.riskManagement?.maxUnrealizedLoss),
                        bg: "color-mix(in srgb, #ddb8b0 22%, var(--surface-strong))",
                        border: "color-mix(in srgb, #ddb8b0 45%, var(--border))",
                        text: "var(--status-red)",
                      },
                      {
                        label: "Max Loss Duration",
                        value: selectedMaster.riskManagement?.maxLossDuration || "N/A",
                        bg: "color-mix(in srgb, #e0c0a0 22%, var(--surface-strong))",
                        border: "var(--border)",
                        text: "var(--heading)",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border p-4"
                        style={{ background: item.bg, borderColor: item.border }}
                      >
                        <p className="font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-accent">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-light" style={{ color: item.text }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl border border-border p-5 sm:p-6"
                  style={{ background: "var(--surface-strong)" }}
                >
                  <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-['Cinzel',_serif] text-xs uppercase tracking-[0.3em] text-accent">
                        Trade Flow
                      </p>
                      <h3 className="mt-1 text-3xl font-light text-heading">
                        Market Activity
                      </h3>
                    </div>

                    <div className="flex gap-2 overflow-x-auto">
                      {(["closed", "open"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className="rounded-xl px-4 py-2 text-sm transition-all whitespace-nowrap font-['Lato',_sans-serif]"
                          style={
                            activeTab === tab
                              ? {
                                  background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                                  color: "var(--heading)",
                                }
                              : {
                                  background: "var(--surface-strong)",
                                  color: "var(--heading)",
                                  border: "1px solid var(--border)",
                                }
                          }
                        >
                          {tab === "closed" ? "Recent Trades" : "Open Positions"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {selectedMaster.trades && selectedMaster.trades.length > 0 ? (
                      <table className="min-w-[640px] w-full">
                        <thead>
                          <tr className="border-b border-border">
                            {["Symbol", "Type", "Duration", "Profit/Loss"].map((header, index) => (
                              <th
                                key={header}
                                className={`px-4 py-3 font-['Lato',_sans-serif] text-xs uppercase tracking-widest text-body ${
                                  index === 3 ? "text-right" : "text-left"
                                }`}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMaster.trades.map((trade) => {
                            const isProfit = trade.profit >= 0;
                            return (
                              <tr
                                key={trade.id}
                                className="border-b border-border transition-colors hover:bg-surface-strong"
                              >
                                <td className="px-4 py-4 text-heading font-['Lato',_sans-serif] font-semibold">
                                  {trade.symbol}
                                </td>
                                <td className="px-4 py-4">
                                  <span
                                    className="inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-widest font-['Lato',_sans-serif]"
                                    style={
                                      trade.type === "buy"
                                        ? {
                                            background: "var(--surface-strong)",
                                            color: "var(--status-green)",
                                            border: "1px solid #b9d8a8",
                                          }
                                        : {
                                            background: "var(--surface-strong)",
                                            color: "var(--status-red)",
                                            border: "1px solid #ddb8b0",
                                          }
                                    }
                                  >
                                    {trade.type}
                                  </span>
                                </td>
                                <td className="px-4 py-4 font-['Lato',_sans-serif] text-sm text-body">
                                  {trade.duration}
                                </td>
                                <td
                                  className="px-4 py-4 text-right font-['Lato',_sans-serif] text-sm font-semibold"
                                  style={{ color: isProfit ? "#2a5a1a" : "#7a2a2a" }}
                                >
                                  {isProfit ? "+" : ""}
                                  {formatCurrency(trade.profit)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="rounded-2xl border border-border bg-surface-strong px-6 py-10 text-center">
                        <p className="font-['Lato',_sans-serif] text-sm text-body">
                          {activeTab === "closed"
                            ? "No recent trades available."
                            : "No open positions available."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <SetupCopyingModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        masterAccount={selectedMaster?.id || ""}
        masterName={selectedMaster?.name || ""}
        minInvestment={selectedMaster?.minInvestment || 100}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CopyTradingRating;
