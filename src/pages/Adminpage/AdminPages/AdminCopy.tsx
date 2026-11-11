import { useCopyTradingStore } from "@/Store/copyTrading.store";
import { useToastStore } from "@/Store/toast.store";
import {
  useCopyTradingStats,
  useMastersAndCopiers,
  useTradeHistory,
  useUnlinkCopier,
} from "@/hooks/useCopyTradingQueries";
import type { Copier, Master, Trade } from "@/types/copyTrading.types";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Coins,
  Crown,
  ExternalLink,
  Gem,
  Link2Off,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const compactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const formatDate = (value?: string) => {
  if (!value || value === "N/A") return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: getConfiguredTimezone(),
  });
};

const getProfitTone = (value: number) =>
  value >= 0
    ? {
        text: "text-[#2f5e33] dark:text-[#91ca96]",
        soft: "bg-[#edf7ee] border-[#c7ddc8]",
      }
    : {
        text: "text-[#7a2a2a] dark:text-[#d58686]",
        soft: "bg-surface-strong border-border",
      };

const DashboardShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="admin-page min-h-screen p-3 sm:p-5 lg:p-7"
    style={{
      background: `
        radial-gradient(circle at top left, rgba(239,227,202,0.55), transparent 28%),
        radial-gradient(circle at top right, rgba(222,204,168,0.32), transparent 24%),
        linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
      `,
    }}
  >
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      }}
    />
    <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-5">
      {children}
    </div>
  </div>
);

const LoadingView = () => (
  <DashboardShell>
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="rounded-[30px] border border-border bg-surface-strong px-8 py-10 text-center shadow-[0_20px_50px_rgba(102,76,36,0.12)]">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-[3px] border-accent border-t-transparent" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-body">
          Loading Copy Desk
        </p>
        <p className="mt-3 text-sm text-body">
          Syncing masters, copiers, and trade activity.
        </p>
      </div>
    </div>
  </DashboardShell>
);

const ErrorView = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <DashboardShell>
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-xl rounded-[30px] border border-border bg-surface-strong p-8 shadow-[0_20px_50px_rgba(122,42,42,0.12)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a3a3a] dark:text-[#cf8c8c]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Feed Unavailable
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-heading">
          Copy trading data could not be loaded
        </h2>
        <p className="mt-3 text-sm leading-6 text-body">{error}</p>
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  </DashboardShell>
);

const Surface = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`overflow-hidden rounded-[28px] border border-border bg-surface-strong shadow-[0_18px_36px_rgba(102,76,36,0.10),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_18px_36px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
  >
    {children}
  </section>
);

const MiniStat = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) => (
  <div className="rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)]">
    <div className="mb-3 flex items-center gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/80 dark:border-border shadow-sm"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
        {label}
      </span>
    </div>
    <div className="text-2xl font-semibold tracking-tight text-heading">
      {value}
    </div>
  </div>
);

const SectionHeading = ({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-heading">
        {title}
      </h2>
      <p className="mt-1 text-sm text-body">{text}</p>
    </div>
    {action}
  </div>
);

const EmptyPanel = ({
  title,
  text,
}: {
  title: string;
  text: string;
}) => (
  <div className="rounded-[24px] border border-dashed border-border bg-[rgba(255,250,241,0.66)] dark:bg-surface-strong px-6 py-10 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-strong text-body">
      <Sparkles className="h-5 w-5" />
    </div>
    <h3 className="text-lg font-semibold text-heading">{title}</h3>
    <p className="mt-2 text-sm text-body">{text}</p>
  </div>
);

const HeaderButton = ({
  onClick,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) => (
  <button
    onClick={onClick}
    className={
      variant === "primary"
        ? "inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-heading shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
        : "inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm font-semibold text-body transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface-strong"
    }
  >
    {children}
  </button>
);

const MasterLedgerCard = ({
  master,
  onOpen,
}: {
  master: Master;
  onOpen: (master: Master) => void;
}) => {
  const profitTone = getProfitTone(master.profit);

  return (
    <article className="group rounded-[26px] border border-border bg-surface-strong p-5 shadow-[0_16px_30px_rgba(141,109,60,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_24px_36px_rgba(141,109,60,0.14)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-body">
              <Crown className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-heading">
                {master.name}
              </h3>
              <p className="text-sm text-subtle">Master #{master.account}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Copiers
              </div>
              <div className="mt-1 text-xl font-semibold text-heading">
                {master.noCopiers}
              </div>
            </div>
            <div className={`rounded-2xl border px-4 py-3 ${profitTone.soft}`}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Total Profit
              </div>
              <div className={`mt-1 text-xl font-semibold ${profitTone.text}`}>
                {currency(master.profit)}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Commission
              </div>
              <div className="mt-1 text-xl font-semibold text-heading">
                {master.commission}%
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Paid Out
              </div>
              <div className="mt-1 text-xl font-semibold text-body">
                {currency(master.commissionPaid)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 xl:w-[220px]">
          <div className="rounded-2xl border border-border bg-[rgba(255,249,239,0.85)] dark:bg-surface-strong p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
              Started
            </div>
            <div className="mt-1 text-sm font-medium text-body">
              {formatDate(master.started)}
            </div>
          </div>
          <button
            onClick={() => onOpen(master)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent bg-surface px-4 py-3 text-sm font-semibold text-heading transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_14px_26px_rgba(102,76,36,0.14)]"
          >
            Open Copier Desk
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

const CopierLine = ({
  copier,
  masterAccount,
  isUnlinking,
  onViewTrades,
  onUnlink,
}: {
  copier: Copier;
  masterAccount: string;
  isUnlinking: boolean;
  onViewTrades: (copier: Copier, masterAccount: string) => void;
  onUnlink: (account: string) => void;
}) => {
  const profitTone = getProfitTone(copier.profit);

  return (
    <div className="rounded-[26px] border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-body shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                Copier Account
              </div>
              <div className="mt-1 text-lg font-semibold text-heading">
                {copier.account}
              </div>
              <div className="mt-1 text-sm text-subtle">
                Linked under master #{masterAccount} since{" "}
                {formatDate(copier.joinedDate)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onViewTrades(copier, masterAccount)}
              className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-surface-strong px-4 py-2.5 text-sm font-semibold text-body transition-all duration-300 hover:-translate-y-0.5 hover:border-accent"
            >
              <BarChart3 className="h-4 w-4" />
              Open Trade Ledger
            </button>
            <button
              onClick={() => onUnlink(copier.account)}
              disabled={isUnlinking}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#dfb8b8] bg-surface-strong px-4 py-2.5 text-sm font-semibold text-[#8a3a3a] dark:text-[#cf8c8c] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c98f8f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Link2Off className="h-4 w-4" />
              {isUnlinking ? "Unlinking..." : "Remove Link"}
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Balance
              </div>
              <div className="mt-1 text-lg font-semibold text-heading">
                {currency(copier.balance)}
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Equity
              </div>
              <div className="mt-1 text-lg font-semibold text-heading">
                {currency(copier.equity ?? copier.balance)}
              </div>
            </div>
          </div>
          <div>
            <div className={`rounded-2xl border px-4 py-3 ${profitTone.soft}`}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Profit
              </div>
              <div className={`mt-1 text-lg font-semibold ${profitTone.text}`}>
                {currency(copier.profit)}
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Commission Paid
              </div>
              <div className="mt-1 text-lg font-semibold text-body">
                {currency(copier.commissionPaid)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TradeLine = ({ trade }: { trade: Trade }) => {
  const positive = trade.profit >= 0;

  return (
    <div className="grid gap-3 rounded-[22px] border border-border bg-surface-strong p-4 shadow-[0_14px_24px_rgba(141,109,60,0.06)] sm:grid-cols-[1.1fr_auto]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-heading">
            {trade.symbol}
          </span>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
              trade.type === "BUY"
                ? "border border-[#c4dbc9] bg-[#eef8f2] text-[#3f6f53]"
                : "border border-border bg-surface-strong text-[#87534a] dark:text-[#ca9991]"
            }`}
          >
            {trade.type}
          </span>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-body sm:grid-cols-2">
          <div>Volume: {trade.volume}</div>
          <div>Opened: {trade.openTime}</div>
          <div>Open Price: {trade.openPrice}</div>
          <div>Current Price: {trade.currentPrice}</div>
        </div>
      </div>

      <div className="flex items-center sm:justify-end">
        <div
          className={`rounded-2xl border px-4 py-3 text-right ${
            positive
              ? "border-[#c7ddc8] bg-[#edf7ee]"
              : "border-border bg-surface-strong"
          }`}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
            Profit
          </div>
          <div
            className={`mt-1 text-lg font-semibold ${
              positive ? "text-[#2f5e33] dark:text-[#91ca96]" : "text-[#7a2a2a] dark:text-[#d58686]"
            }`}
          >
            {currency(trade.profit)}
          </div>
        </div>
      </div>
    </div>
  );
};

const CopyTradingCRM = () => {
  const store = useCopyTradingStore();
  const addToast = useToastStore((state) => state.addToast);
  const [copierPage, setCopierPage] = useState(1);

  const {
    data: masters = [],
    isLoading,
    error: queryError,
    refetch,
  } = useMastersAndCopiers();

  const { data: stats = store.stats } = useCopyTradingStats();

  const { data: tradesData } = useTradeHistory(
    store.selectedCopier ? [parseInt(store.selectedCopier.account)] : [],
    store.view === "trades" && !!store.selectedCopier,
  );

  const unlinkMutation = useUnlinkCopier();

  useEffect(() => {
    if (masters.length > 0) {
      store.setMasters(masters);
    }
  }, [masters]);

  useEffect(() => {
    setCopierPage(1);
  }, [store.selectedMaster?.id, store.selectedMaster?.copiers.length]);

  useEffect(() => {
    if (tradesData) {
      store.setMasterTrades(tradesData.masterTrades);
      store.setCopierTrades(tradesData.copierTrades);
    }
  }, [tradesData]);

  const handleViewCopiers = (master: Master) => {
    store.setSelectedMaster(master);
    store.setView("copiers");
  };

  const handleViewTrades = (copier: Copier, masterAccount: string) => {
    store.setSelectedCopier({ ...copier, masterAccount });
    store.setView("trades");
  };

  const handleUnlinkCopier = async (account: string) => {
    if (!confirm("Are you sure you want to unlink this copier account?")) {
      return;
    }

    try {
      store.setUnlinkingAccount(account);
      await unlinkMutation.mutateAsync({ mt5Account: account });
      addToast("success", "Copier account unlinked successfully!");

      if (store.selectedCopier?.account === account) {
        store.resetToMain();
      }
    } catch (err: any) {
      addToast("error", err.message || "Failed to unlink copier");
    } finally {
      store.setUnlinkingAccount(null);
    }
  };

  const handleBack = () => {
    if (store.view === "trades") {
      store.setView("copiers");
      store.setSelectedCopier(null);
    } else {
      store.resetToMain();
    }
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (queryError) {
    return <ErrorView error={queryError.message} onRetry={() => refetch()} />;
  }

  const avgCommission = store.masters.length
    ? store.masters.reduce((sum, master) => sum + master.commission, 0) /
      store.masters.length
    : 0;

  const selectedMaster = store.selectedMaster;
  const selectedCopier = store.selectedCopier;
  const topMaster = [...store.masters].sort((a, b) => b.profit - a.profit)[0];
  const isSparseRoster = store.masters.length <= 1;
  const copiersPerPage = 3;
  const totalCopierPages = Math.max(
    1,
    Math.ceil((selectedMaster?.copiers.length ?? 0) / copiersPerPage),
  );
  const visibleCopiers =
    selectedMaster?.copiers.slice(
      (copierPage - 1) * copiersPerPage,
      copierPage * copiersPerPage,
    ) ?? [];
  const totalSelectedCopierBalance =
    selectedMaster?.copiers.reduce((sum, copier) => sum + copier.balance, 0) ??
    0;
  const totalSelectedCopierEquity =
    selectedMaster?.copiers.reduce(
      (sum, copier) => sum + (copier.equity ?? copier.balance),
      0,
    ) ?? 0;
  const profitableCopiers =
    selectedMaster?.copiers.filter((copier) => copier.profit >= 0).length ?? 0;
  const underwaterCopiers =
    selectedMaster?.copiers.filter((copier) => copier.profit < 0).length ?? 0;
  const topCopier =
    selectedMaster?.copiers
      ?.slice()
      .sort((a, b) => (b.equity ?? b.balance) - (a.equity ?? a.balance))[0] ??
    null;
  const latestCopier =
    selectedMaster?.copiers
      ?.slice()
      .sort(
        (a, b) =>
          new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime(),
      )[0] ?? null;

  return (
    <DashboardShell>
      <Surface className="relative p-5 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-accent via-surface to-accent-hover" />
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-surface-strong/90 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-2 h-36 w-36 rounded-full bg-surface/45 blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                <Activity className="h-3.5 w-3.5" />
                Copy Trading Operations
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
                {store.view === "main" && "Master network command center"}
                {store.view === "copiers" &&
                  `${selectedMaster?.name ?? "Master"} copier desk`}
                {store.view === "trades" &&
                  `Trade ledger for ${selectedCopier?.account ?? "copier"}`}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-body sm:text-base">
                {store.view === "main" &&
                  "Review master performance, copier exposure, and commission flow from one admin surface built around the dashboard theme."}
                {store.view === "copiers" &&
                  "Inspect every linked copier under this master, then drill directly into mirrored trade activity or remove accounts when needed."}
                {store.view === "trades" &&
                  "Compare copied execution against source activity with a side-by-side ledger for the selected account."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {store.view !== "main" && (
                <HeaderButton onClick={handleBack} variant="secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </HeaderButton>
              )}
              <HeaderButton
                onClick={() => {
                  window.location.href = "/client/copy/rating";
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Browse Masters
              </HeaderButton>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat
              label="Masters"
              value={String(store.masters.length)}
              icon={Crown}
              accent="#8a6a3a"
            />
            <MiniStat
              label="Copier Links"
              value={String(stats.totalCopiers)}
              icon={Users}
              accent="#426a91"
            />
            <MiniStat
              label="Capital Tracked"
              value={currency(stats.totalInvestment)}
              icon={Wallet}
              accent="#4f7e62"
            />
            <MiniStat
              label="Profit Pool"
              value={currency(stats.totalProfit)}
              icon={TrendingUp}
              accent="#7b6aa6"
            />
          </div>
        </div>
      </Surface>

      {store.view === "main" && (
        <div
          className={
            isSparseRoster
              ? "grid gap-5"
              : "grid gap-5 xl:grid-cols-[1.6fr_0.9fr]"
          }
        >
          <Surface className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="Master Roster"
              title="Performance-first lineup"
              text="Each card summarises the master’s copier load, profit output, commission rate, and payout history."
            />

            <div className="mt-6 space-y-4">
              {store.masters.length === 0 ? (
                <EmptyPanel
                  title="No masters connected"
                  text="This workspace does not have copy masters available yet."
                />
              ) : (
                store.masters.map((master) => (
                  <MasterLedgerCard
                    key={master.id}
                    master={master}
                    onOpen={handleViewCopiers}
                  />
                ))
              )}
            </div>
          </Surface>

          <div
            className={
              isSparseRoster
                ? "grid gap-5 xl:grid-cols-2"
                : "flex flex-col gap-5"
            }
          >
            <Surface className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="Desk Summary"
                title="Operational snapshot"
                text="High-signal metrics aligned with the admin dashboard language."
              />

              <div className="mt-6 grid gap-3">
                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                    <Gem className="h-4 w-4" />
                    Commission Average
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-heading">
                    {avgCommission.toFixed(1)}%
                  </div>
                  <p className="mt-2 text-sm text-body">
                    Average master commission across the active network.
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                    Best Performer
                  </div>
                  {topMaster ? (
                    <>
                      <div className="mt-2 text-xl font-semibold text-heading">
                        {topMaster.name}
                      </div>
                      <div className="mt-1 text-sm text-subtle">
                        {topMaster.noCopiers} copiers linked
                      </div>
                      <div className="mt-4 inline-flex rounded-full border border-[#c4dbc9] bg-[#eef8f2] px-3 py-1 text-sm font-semibold text-[#3f6f53]">
                        {currency(topMaster.profit)} profit
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-body">
                      No performance data available.
                    </p>
                  )}
                </div>

                <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                    Commission Paid
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-heading">
                    {currency(stats.commissionPaid)}
                  </div>
                  <p className="mt-2 text-sm text-body">
                    Total commission disbursed across linked copiers.
                  </p>
                </div>
              </div>
            </Surface>

            <Surface className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="Exposure"
                title="Capital concentration"
                text="A fast read on how much capital is flowing through the copy desk."
              />
              <div className="mt-6 space-y-4">
                {store.masters.slice(0, 3).map((master) => {
                  const capital = master.copiers.reduce(
                    (sum, copier) => sum + copier.balance,
                    0,
                  );
                  return (
                    <div key={master.id}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-body">
                          {master.name}
                        </span>
                        <span className="font-semibold text-body">
                          {compactNumber(capital)}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-accent to-accent-hover"
                          style={{
                            width: `${Math.min(
                              100,
                              stats.totalInvestment
                                ? (capital / stats.totalInvestment) * 100
                                : 0,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Surface>
          </div>
        </div>
      )}

      {store.view === "copiers" && selectedMaster && (
        <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
          <Surface className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="Copier Registry"
              title={`Linked accounts for ${selectedMaster.name}`}
              text="Balance, equity, profit, and onboarding timing for each linked copier."
              action={
                selectedMaster.copiers.length > copiersPerPage ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1.5 text-xs font-semibold text-body shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    Page {copierPage} of {totalCopierPages}
                  </div>
                ) : undefined
              }
            />

            <div className="mt-6 rounded-[28px] border border-border bg-surface p-5 shadow-[0_18px_32px_rgba(102,76,36,0.10)]">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
                    <Crown className="h-3.5 w-3.5" />
                    Active Master Desk
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-heading">
                    {selectedMaster.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-body">
                    Master #{selectedMaster.account} is currently managing{" "}
                    {selectedMaster.noCopiers} linked copier accounts. Use this
                    desk to inspect exposure, jump to trade activity, or remove
                    links when operational action is needed.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-2">
                  <MiniStat
                    label="Linked Copiers"
                    value={String(selectedMaster.noCopiers)}
                    icon={Users}
                    accent="#426a91"
                  />
                  <MiniStat
                    label="Master Profit"
                    value={currency(selectedMaster.profit)}
                    icon={TrendingUp}
                    accent="#4f7e62"
                  />
                  <MiniStat
                    label="Commission Rate"
                    value={`${selectedMaster.commission}%`}
                    icon={Coins}
                    accent="#8a6a3a"
                  />
                  <MiniStat
                    label="Commission Paid"
                    value={currency(selectedMaster.commissionPaid)}
                    icon={Wallet}
                    accent="#7b6aa6"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {selectedMaster.copiers.length === 0 ? (
                <EmptyPanel
                  title="No copiers linked"
                  text="This master does not currently have copier accounts."
                />
              ) : (
                visibleCopiers.map((copier) => (
                  <CopierLine
                    key={copier.id}
                    copier={copier}
                    masterAccount={selectedMaster.account}
                    onViewTrades={handleViewTrades}
                    onUnlink={handleUnlinkCopier}
                    isUnlinking={store.unlinkingAccount === copier.account}
                  />
                ))
              )}
            </div>

            {selectedMaster.copiers.length > copiersPerPage && (
              <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-border bg-[rgba(255,250,241,0.7)] dark:bg-surface-strong px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-body">
                  Showing{" "}
                  <span className="font-semibold text-heading">
                    {(copierPage - 1) * copiersPerPage + 1}
                  </span>
                  {" - "}
                  <span className="font-semibold text-heading">
                    {Math.min(
                      copierPage * copiersPerPage,
                      selectedMaster.copiers.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-heading">
                    {selectedMaster.copiers.length}
                  </span>{" "}
                  copier accounts
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCopierPage((page) => Math.max(1, page - 1))
                    }
                    disabled={copierPage === 1}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-2.5 text-sm font-semibold text-body transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCopierPage((page) =>
                        Math.min(totalCopierPages, page + 1),
                      )
                    }
                    disabled={copierPage === totalCopierPages}
                    className="inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </Surface>

          <div className="flex h-full flex-col gap-5">
            <Surface className="flex-1 p-5 sm:p-6">
              <SectionHeading
                eyebrow="Master Brief"
                title="Operator notes"
                text="Quick context for the selected master before taking action on linked accounts."
              />

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                    Master Account
                  </div>
                  <div className="mt-2 text-xl font-semibold text-heading">
                    {selectedMaster.account}
                  </div>
                  <p className="mt-2 text-sm text-body">
                    Started {formatDate(selectedMaster.started)} with{" "}
                    {selectedMaster.noCopiers} live copier links.
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                    Desk Focus
                  </div>
                  <div className="mt-2 text-xl font-semibold text-heading">
                    {selectedMaster.noCopiers > 0
                      ? "Review copier quality"
                      : "Await new copier links"}
                  </div>
                  <p className="mt-2 text-sm text-body">
                    Prioritize high-equity copiers, negative profit drift, and
                    unlink requests that may require manual follow-up.
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                    Largest Copier
                  </div>
                  {topCopier ? (
                    <>
                      <div className="mt-2 text-xl font-semibold text-heading">
                        {topCopier.account}
                      </div>
                      <div className="mt-1 text-sm text-subtle">
                        Equity {currency(topCopier.equity ?? topCopier.balance)}
                      </div>
                      <div className="mt-4 inline-flex rounded-full border border-[#bfd4e6] bg-[#eef5fc] px-3 py-1 text-sm font-semibold text-[#355877]">
                        {currency(topCopier.balance)} balance
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-body">
                      No copier exposure available.
                    </p>
                  )}
                </div>
              </div>
            </Surface>

            <Surface className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="Copier Health"
                title="Sidebar metrics"
                text="A denser read on balance concentration, equity, and profit mix for this master."
              />

              <div className="mt-6 grid gap-3">
                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                    Total Balance
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-heading">
                    {currency(totalSelectedCopierBalance)}
                  </div>
                  <p className="mt-2 text-sm text-body">
                    Combined live balance across all copier accounts.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                      Total Equity
                    </div>
                    <div className="mt-2 text-xl font-semibold text-heading">
                      {currency(totalSelectedCopierEquity)}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                      Latest Link
                    </div>
                    <div className="mt-2 text-xl font-semibold text-heading">
                      {latestCopier ? latestCopier.account : "N/A"}
                    </div>
                    <p className="mt-1 text-sm text-subtle">
                      {latestCopier ? formatDate(latestCopier.joinedDate) : ""}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-border bg-[rgba(255,250,241,0.72)] dark:bg-surface-strong p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
                      Profit Mix
                    </div>
                    <div className="text-xs font-semibold text-body">
                      {selectedMaster.noCopiers} accounts
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-body">Profitable</span>
                        <span className="font-semibold text-[#2f5e33] dark:text-[#91ca96]">
                          {profitableCopiers}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#e4eadf]">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[#87b69a] to-[#4f7e62]"
                          style={{
                            width: `${selectedMaster.noCopiers ? (profitableCopiers / selectedMaster.noCopiers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-body">Underwater</span>
                        <span className="font-semibold text-[#7a2a2a] dark:text-[#d58686]">
                          {underwaterCopiers}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-surface-strong">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[#cf9a8f] to-[#b26c5b]"
                          style={{
                            width: `${selectedMaster.noCopiers ? (underwaterCopiers / selectedMaster.noCopiers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Surface>
          </div>
        </div>
      )}

      {store.view === "trades" && selectedCopier && (
        <div className="grid gap-5">
          <Surface className="p-5 sm:p-6">
            <SectionHeading
              eyebrow="Copier Overview"
              title={`Execution mirror for account ${selectedCopier.account}`}
              text="Use this ledger to compare copied performance against source trade output."
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MiniStat
                label="Copier"
                value={selectedCopier.account}
                icon={Users}
                accent="#426a91"
              />
              <MiniStat
                label="Master"
                value={selectedCopier.masterAccount}
                icon={Crown}
                accent="#8a6a3a"
              />
              <MiniStat
                label="Balance"
                value={currency(selectedCopier.balance)}
                icon={Wallet}
                accent="#4f7e62"
              />
              <MiniStat
                label="Profit"
                value={currency(selectedCopier.profit)}
                icon={TrendingUp}
                accent="#7b6aa6"
              />
              <MiniStat
                label="Commission"
                value={currency(selectedCopier.commissionPaid)}
                icon={Coins}
                accent="#846038"
              />
            </div>
          </Surface>

          <div className="grid gap-5 xl:grid-cols-2">
            <Surface className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="Source Trades"
                title="Master trade stream"
                text="Trades originating from the selected master relationship."
              />
              <div className="mt-6 space-y-4">
                {store.masterTrades.length === 0 ? (
                  <EmptyPanel
                    title="No master trades"
                    text="No source trades are available for this copier selection."
                  />
                ) : (
                  store.masterTrades.map((trade) => (
                    <TradeLine key={trade.id} trade={trade} />
                  ))
                )}
              </div>
            </Surface>

            <Surface className="p-5 sm:p-6">
              <SectionHeading
                eyebrow="Mirrored Trades"
                title="Copier execution stream"
                text="Observed copied positions for the selected linked account."
              />
              <div className="mt-6 space-y-4">
                {store.copierTrades.length === 0 ? (
                  <EmptyPanel
                    title="No copier trades"
                    text="No mirrored trades are available for this account."
                  />
                ) : (
                  store.copierTrades.map((trade) => (
                    <TradeLine key={trade.id} trade={trade} />
                  ))
                )}
              </div>
            </Surface>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default CopyTradingCRM;
