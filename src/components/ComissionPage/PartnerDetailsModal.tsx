import { usePartnerTradesQuery } from "@/hooks/useCommissionQueries";
import { useCommissionStore } from "@/Store/commission.store";
import type {
  AccountTradeSummary,
  Trade,
} from "@/types/commissionPage.types";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const TRADES_PER_PAGE = 5;

export const PartnerDetailsModal = () => {
  const { selectedPartner, setSelectedPartner } = useCommissionStore();
  const { data, isLoading } = usePartnerTradesQuery(
    selectedPartner?._id || null,
  );
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const trades = data?.trades || [];
  const accountSummaries = data?.accountSummaries || [];
  const totals = data?.totals || {
    totalRebate: 0,
    totalVolume: 0,
    totalProfit: 0,
  };
  const filteredTrades =
    selectedAccount === "all"
      ? trades
      : trades.filter((trade) => String(trade.acNo) === selectedAccount);
  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / TRADES_PER_PAGE));
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * TRADES_PER_PAGE,
    currentPage * TRADES_PER_PAGE,
  );

  useEffect(() => {
    setSelectedAccount("all");
  }, [selectedPartner?._id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPartner?._id, selectedAccount]);

  useEffect(() => {
    if (
      selectedAccount !== "all" &&
      accountSummaries.length > 0 &&
      !accountSummaries.some((summary) => summary.acNo === selectedAccount)
    ) {
      setSelectedAccount("all");
    }
  }, [accountSummaries, selectedAccount]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (!selectedPartner) return null;

  return (
    <div
      data-voice-scope="partner details modal"
      className="fixed inset-0 z-50 bg-surface-strong backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className="flex h-full min-h-0 w-full flex-col overflow-hidden border border-border bg-surface-strong"
      >
        <div className="flex-shrink-0 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
                Partner trade history
              </p>
              <h2 className="mt-0.5 truncate text-base font-bold text-heading sm:text-lg">
                {selectedPartner.userId.firstName}{" "}
                {selectedPartner.userId.lastName}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-subtle sm:text-sm">
                <p className="truncate font-medium text-subtle">
                  {selectedPartner.userId.email}
                </p>
                <HeaderPill label="Level" value={`L${selectedPartner.level}`} />
                <HeaderPill
                  label="Country"
                  value={selectedPartner.country || "N/A"}
                />
                <HeaderPill
                  label="Referral"
                  value={selectedPartner.referralCode || "Unavailable"}
                  mono
                />
                <HeaderPill
                  label="Accounts"
                  value={String(
                    data?.partner?.accountCount || accountSummaries.length,
                  )}
                />
              </div>
            </div>
            <div className="flex flex-shrink-0 items-start gap-2">
              <div className="w-[190px] sm:w-[220px]">
                <label className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-subtle">
                Account Filter
                </label>
                <div className="relative">
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-surface-strong/[0.04] px-3.5 py-2 pr-10 text-xs font-medium text-heading outline-none transition focus:border-accent/40 sm:text-sm"
                  >
                    <option value="all" className="bg-surface-strong text-heading">
                      All Accounts
                    </option>
                    {accountSummaries.map((summary) => (
                      <option
                        key={summary.acNo}
                        value={summary.acNo}
                        className="bg-surface-strong text-heading"
                      >
                        {summary.acNo} ({summary.totalTrades} trades)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="mt-4 flex-shrink-0 rounded-lg p-1.5 text-subtle transition hover:bg-surface-strong/10 hover:text-heading"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <AccountSummaryStrip
          accountSummaries={accountSummaries}
          selectedAccount={selectedAccount}
          totals={totals}
          tradesCount={trades.length}
        />

        <TradesTable
          trades={paginatedTrades}
          isLoading={isLoading}
          selectedAccount={selectedAccount}
          currentPage={currentPage}
          totalPages={totalPages}
          totalTrades={filteredTrades.length}
          onPageChange={setCurrentPage}
        />
      </motion.div>
    </div>
  );
};

const HeaderPill = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/[0.04] px-3 py-1 text-xs text-subtle">
    <span className="uppercase tracking-[0.14em] text-subtle">{label}</span>
    <span className={`max-w-[180px] truncate text-heading ${mono ? "font-mono" : "font-semibold"}`}>
      {value}
    </span>
  </div>
);

const AccountSummaryStrip = ({
  accountSummaries,
  selectedAccount,
  totals,
  tradesCount,
}: {
  accountSummaries: AccountTradeSummary[];
  selectedAccount: string;
  totals: {
    totalRebate: number;
    totalVolume: number;
    totalProfit: number;
  };
  tradesCount: number;
}) => (
  <div className="flex-shrink-0 border-b border-border px-4 py-3 sm:px-6">
    <div className="mb-3">
      <p className="text-sm font-semibold text-heading">Account view</p>
      <p className="text-xs text-subtle">
        Review commission, volume, and trade totals for the selected scope.
      </p>
    </div>

    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <MiniSummaryCard
        label={selectedAccount === "all" ? "Accounts Scope" : "Selected Account"}
        value={selectedAccount === "all" ? "All Accounts" : selectedAccount}
        subValue={
          selectedAccount === "all"
            ? `${accountSummaries.length} tracked`
            : `${getSelectedTradeCount(selectedAccount, accountSummaries)} trades`
        }
        mono={selectedAccount !== "all"}
      />
      <MiniSummaryCard
        label="Commission"
        value={`$${getSelectedTotals(selectedAccount, totals, tradesCount, accountSummaries).totalRebate.toFixed(4)}`}
        subValue="Total rebate"
      />
      <MiniSummaryCard
        label="Volume"
        value={getSelectedTotals(selectedAccount, totals, tradesCount, accountSummaries).totalVolume.toFixed(2)}
        subValue="Closed volume"
      />
      <MiniSummaryCard
        label="Trades"
        value={getSelectedTotals(selectedAccount, totals, tradesCount, accountSummaries).totalTrades.toString()}
        subValue="Closed trades"
      />
    </div>
  </div>
);

const MiniSummaryCard = ({
  label,
  value,
  subValue,
  mono = false,
}: {
  label: string;
  value: string;
  subValue: string;
  mono?: boolean;
}) => (
  <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
    <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-subtle">
      {label}
    </p>
    <p className={`truncate text-sm font-bold text-heading sm:text-base ${mono ? "font-mono" : ""}`}>
      {value}
    </p>
    <p className="mt-1 text-xs text-subtle">{subValue}</p>
  </div>
);

const getSelectedTotals = (
  selectedAccount: string,
  totals: {
    totalRebate: number;
    totalVolume: number;
    totalProfit: number;
  },
  tradesCount: number,
  accountSummaries: AccountTradeSummary[],
) => {
  if (selectedAccount === "all") {
    return {
      totalRebate: totals.totalRebate,
      totalVolume: totals.totalVolume,
      totalProfit: totals.totalProfit,
      totalTrades: tradesCount,
    };
  }

  return (
    accountSummaries.find((summary) => summary.acNo === selectedAccount) || {
      totalRebate: 0,
      totalVolume: 0,
      totalProfit: 0,
      totalTrades: 0,
    }
  );
};

const getSelectedTradeCount = (
  selectedAccount: string,
  accountSummaries: AccountTradeSummary[],
) =>
  accountSummaries.find((summary) => summary.acNo === selectedAccount)
    ?.totalTrades || 0;

const TradesTable = ({
  trades,
  isLoading,
  selectedAccount,
  currentPage,
  totalPages,
  totalTrades,
  onPageChange,
}: {
  trades: Trade[];
  isLoading: boolean;
  selectedAccount: string;
  currentPage: number;
  totalPages: number;
  totalTrades: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-base font-bold text-heading sm:text-lg">
          <Activity className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
          <span className="truncate">
            {selectedAccount === "all"
              ? "Trade history"
              : `Trade history · ${selectedAccount}`}
          </span>
        </h3>
        <p className="mt-1 text-xs text-subtle">
          Most recent closed trades for the selected scope.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1 text-xs text-subtle">
          {totalTrades} row{totalTrades === 1 ? "" : "s"}
        </span>
        {totalTrades > TRADES_PER_PAGE ? (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-strong/[0.04] p-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md p-1.5 text-subtle transition hover:bg-surface-strong/[0.08] hover:text-heading disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[52px] text-center text-[11px] font-medium text-subtle">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md p-1.5 text-subtle transition hover:bg-surface-strong/[0.08] hover:text-heading disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
      {isLoading ? (
        <LoadingSpinner />
      ) : trades.length > 0 ? (
        <>
          <DesktopTradesTable trades={trades} />
          <MobileTradesList trades={trades} />
        </>
      ) : (
        <EmptyTradesState />
      )}
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex min-h-[240px] items-center justify-center py-12">
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4 text-heading">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <span className="text-sm font-medium">Loading trade details...</span>
    </div>
  </div>
);

const DesktopTradesTable = ({ trades }: { trades: Trade[] }) => (
  <div className="hidden overflow-x-auto md:block">
    <table className="w-full">
      <thead className="sticky top-0 z-10 bg-surface-strong">
        <tr className="border-b border-border">
          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            MT5 Account
          </th>
          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Symbol
          </th>
          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Volume
          </th>
          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Open Price
          </th>
          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Close Price
          </th>
          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Profit
          </th>
          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Commission
          </th>
          <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade, idx) => (
          <TradeRow key={idx} trade={trade} />
        ))}
      </tbody>
    </table>
  </div>
);

const TradeRow = ({ trade }: { trade: Trade }) => (
  <tr className="border-b border-border transition hover:bg-surface-strong/[0.03]">
    <td className="px-3 py-3 font-mono text-sm text-heading">{trade.acNo}</td>
    <td className="px-3 py-3 text-sm font-semibold text-heading">
      <span className="inline-flex rounded-md border border-border bg-surface-strong/[0.04] px-2 py-1">
        {trade.symbol}
      </span>
    </td>
    <td className="px-3 py-3 text-right text-sm text-heading">
      {trade.volume.toFixed(4)}
    </td>
    <td className="px-3 py-3 text-right text-sm text-subtle">
      {parseFloat(trade.openPrice).toFixed(5)}
    </td>
    <td className="px-3 py-3 text-right text-sm text-subtle">
      {parseFloat(trade.closePrice).toFixed(5)}
    </td>
    <td
      className={`px-3 py-3 text-right text-sm font-semibold ${
        trade.profit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
      }`}
    >
      ${trade.profit.toFixed(4)}
    </td>
    <td className="px-3 py-3 text-right text-sm font-bold text-emerald-700 dark:text-emerald-300">
      ${trade.rebate.toFixed(4)}
    </td>
    <td className="px-3 py-3 text-center">
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        <CheckCircle className="h-3 w-3" />
        {trade.status || "confirmed"}
      </span>
    </td>
  </tr>
);

const MobileTradesList = ({ trades }: { trades: Trade[] }) => (
  <div className="space-y-3 md:hidden">
    {trades.map((trade, idx) => (
      <MobileTradeCard key={idx} trade={trade} />
    ))}
  </div>
);

const MobileTradeCard = ({ trade }: { trade: Trade }) => (
  <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm font-bold text-heading">{trade.symbol}</span>
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        <CheckCircle className="h-3 w-3" />
        {trade.status || "confirmed"}
      </span>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-subtle">MT5 Account:</span>
        <span className="font-mono text-xs text-heading">{trade.acNo}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-subtle">Volume:</span>
        <span className="font-medium text-heading">
          {trade.volume.toFixed(4)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-subtle">Open Price:</span>
        <span className="text-subtle">
          {parseFloat(trade.openPrice).toFixed(5)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-subtle">Close Price:</span>
        <span className="text-subtle">
          {parseFloat(trade.closePrice).toFixed(5)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-subtle">Profit:</span>
        <span className={trade.profit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
          ${trade.profit.toFixed(4)}
        </span>
      </div>
      <div className="flex justify-between border-t border-border pt-2">
        <span className="text-subtle">Commission:</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-300">
          ${trade.rebate.toFixed(4)}
        </span>
      </div>
    </div>
  </div>
);

const EmptyTradesState = () => (
  <div className="py-12 text-center">
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg border border-border bg-surface-strong/[0.04] p-4">
        <Activity className="h-10 w-10 text-heading/30" />
      </div>
      <p className="text-sm font-medium text-subtle sm:text-base">
        No trades found for this partner
      </p>
      <p className="text-xs text-subtle sm:text-sm">
        Trades will appear here once this partner starts trading
      </p>
    </div>
  </div>
);
