import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Repeat,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface PerformanceData {
  deposits: { amount: number; count: number };
  withdrawals: { amount: number; count: number };
  transactions: number;
  newClients: number;
  ibPartners: number;
  date?: string;
}

interface ModalDetail {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  rows: { label: string; value: string; sub?: string }[];
  bigLabel: string;
  bigValue: string;
  badge?: { text: string; color: string; bg: string; border: string };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const fmtF = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const pct = (n: number) => Math.round(n) + "%";

// ─── Theme-derived status swatches ──────────────────────────────────────────
// The old modal/card chrome used fixed pastel hex values (mint green / pale
// pink / pale blue) that ignored the superadmin's chosen theme and accent,
// so they clashed badly in dark mode. These derive everything from the same
// --status-green/--status-red/--status-blue tokens (already theme-aware,
// see index.css) so the chrome always sits naturally on --surface-strong.
const tone = (statusVar: string) => ({
  text: `var(${statusVar})`,
  bg: `color-mix(in srgb, var(${statusVar}) 18%, var(--surface-strong))`,
  border: `color-mix(in srgb, var(${statusVar}) 45%, var(--border))`,
});
const greenTone = tone("--status-green");
const redTone = tone("--status-red");
const blueTone = tone("--status-blue");
// Neutral tile tone (Transactions/IB partners/acquisition) — derived from
// the superadmin's accent color instead of a fixed cream, so it never
// clashes with a dark or non-gold theme the way "#fdf0d8" did.
const amberTone = {
  text: "var(--accent-color)",
  bg: "color-mix(in srgb, var(--accent-color) 18%, var(--surface-strong))",
  border: "color-mix(in srgb, var(--accent-color) 45%, var(--border))",
};

// ─── Detail Modal ────────────────────────────────────────────────────────────
const DetailModal: React.FC<{ detail: ModalDetail; onClose: () => void }> = ({
  detail,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-4"
      style={{
        background: "rgba(28, 16, 4, 0.45)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up"
        style={{
          background: "var(--surface-strong)",
          border: `1px solid ${detail.borderColor}`,
          boxShadow: "0 20px 60px rgba(100,70,20,0.18)",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: detail.bgColor,
            borderBottom: `1px solid ${detail.borderColor}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--surface-strong)",
                border: `1px solid ${detail.borderColor}`,
              }}
            >
              {detail.icon}
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--heading)" }}
            >
              {detail.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: "transparent",
              border: `1px solid ${detail.borderColor}`,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = detail.bgColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X size={14} color="var(--accent-color)" />
          </button>
        </div>

        {/* Big number hero */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: `1px solid var(--border)` }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--accent-color)" }}
          >
            {detail.bigLabel}
          </p>
          <div className="flex items-end gap-3">
            <span
              className="text-4xl font-semibold tracking-tight"
              style={{ color: "var(--heading)", lineHeight: 1 }}
            >
              {detail.bigValue}
            </span>
            {detail.badge && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full mb-0.5"
                style={{
                  color: detail.badge.color,
                  background: detail.badge.bg,
                  border: `1px solid ${detail.badge.border}`,
                }}
              >
                {detail.badge.text}
              </span>
            )}
          </div>
        </div>

        {/* Rows */}
        <div className="px-5 py-4 space-y-3">
          {detail.rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl"
              style={{ background: "var(--surface-strong)", border: "1px solid var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--accent-color)" }}>
                {row.label}
              </span>
              <div className="text-right">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--heading)" }}
                >
                  {row.value}
                </span>
                {row.sub && (
                  <p className="text-xs" style={{ color: "var(--accent-color)" }}>
                    {row.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: detail.bgColor,
              color: "var(--body)",
              border: `1px solid ${detail.borderColor}`,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TodaysPerformanceCards: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [modal, setModal] = useState<ModalDetail | null>(null);
  const [data, setData] = useState<PerformanceData>({
    deposits: { amount: 0, count: 0 },
    withdrawals: { amount: 0, count: 0 },
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  });

  const fetchData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${apiUrl}/admin/dashboard/today-performance`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        if (res.status === 401)
          throw new Error("Unauthorised. Please log in again.");
        if (res.status === 403)
          throw new Error("Access denied. Admin privileges required.");
        throw new Error(`Error ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdated(new Date());
      } else throw new Error(json.message || "Failed to fetch data");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch performance data",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchData();
    const handler = () => void fetchData(true);
    window.addEventListener("crm:admin-dashboard-refresh", handler);
    return () =>
      window.removeEventListener("crm:admin-dashboard-refresh", handler);
  }, []);

  // ── Derived values ──
  const dep = data.deposits.amount;
  const depC = data.deposits.count;
  const wd = data.withdrawals.amount;
  const wdC = data.withdrawals.count;
  const tx = data.transactions;
  const nc = data.newClients;
  const ib = data.ibPartners;
  const net = dep - wd;
  const isPos = net >= 0;
  const depRate = tx > 0 ? (depC / tx) * 100 : 0;
  const wdRate = tx > 0 ? (wdC / tx) * 100 : 0;
  const avgDep = depC > 0 ? dep / depC : 0;
  const avgWd = wdC > 0 ? wd / wdC : 0;
  const acq = nc + ib;
  const clientPct = acq > 0 ? (nc / acq) * 100 : 0;
  const ibPct = acq > 0 ? (ib / acq) * 100 : 0;

  // ── Modal builders ──
  const openDeposits = () =>
    setModal({
      title: "Total deposits",
      icon: <TrendingUp size={16} color={greenTone.text} />,
      accentColor: greenTone.text,
      bgColor: greenTone.bg,
      borderColor: greenTone.border,
      bigLabel: "Total inflow today",
      bigValue: fmt(dep),
      badge: {
        text: `${depC} deposits`,
        color: greenTone.text,
        bg: greenTone.bg,
        border: greenTone.border,
      },
      rows: [
        { label: "Number of deposits", value: depC.toLocaleString() },
        { label: "Average ticket size", value: fmtF(avgDep) },
        { label: "Deposit share of transactions", value: pct(depRate) },
        {
          label: "Largest single deposit (est.)",
          value: fmtF(avgDep * 1.6),
          sub: "Estimated",
        },
      ],
    });

  const openWithdrawals = () =>
    setModal({
      title: "Total withdrawals",
      icon: <TrendingDown size={16} color={redTone.text} />,
      accentColor: redTone.text,
      bgColor: redTone.bg,
      borderColor: redTone.border,
      bigLabel: "Total outflow today",
      bigValue: fmt(wd),
      badge: {
        text: `${wdC} withdrawals`,
        color: redTone.text,
        bg: redTone.bg,
        border: redTone.border,
      },
      rows: [
        { label: "Number of withdrawals", value: wdC.toLocaleString() },
        { label: "Average ticket size", value: fmtF(avgWd) },
        { label: "Withdrawal share of transactions", value: pct(wdRate) },
        {
          label: "Net after withdrawals",
          value: fmt(dep - wd),
          sub: isPos ? "Surplus" : "Deficit",
        },
      ],
    });

  const openTransactions = () =>
    setModal({
      title: "Transactions",
      icon: <Repeat size={16} color="var(--heading)" />,
      accentColor: amberTone.text,
      bgColor: amberTone.bg,
      borderColor: amberTone.border,
      bigLabel: "Total transactions today",
      bigValue: tx.toLocaleString(),
      rows: [
        {
          label: "Deposits",
          value: depC.toLocaleString(),
          sub: pct(depRate) + " of total",
        },
        {
          label: "Withdrawals",
          value: wdC.toLocaleString(),
          sub: pct(wdRate) + " of total",
        },
        { label: "Avg deposit value", value: fmtF(avgDep) },
        { label: "Avg withdrawal value", value: fmtF(avgWd) },
      ],
    });

  const openClients = () =>
    setModal({
      title: "New clients",
      icon: <UserCheck size={16} color={blueTone.text} />,
      accentColor: blueTone.text,
      bgColor: blueTone.bg,
      borderColor: blueTone.border,
      bigLabel: "New clients today",
      bigValue: nc.toLocaleString(),
      badge: {
        text: "+" + nc + " today",
        color: blueTone.text,
        bg: blueTone.bg,
        border: blueTone.border,
      },
      rows: [
        { label: "New clients", value: nc.toLocaleString() },
        { label: "IB partners activated", value: ib.toLocaleString() },
        { label: "Total acquisition today", value: acq.toLocaleString() },
        { label: "IB share of acquisition", value: pct(ibPct) },
      ],
    });

  const netTone = isPos ? greenTone : redTone;
  const openNetFlow = () =>
    setModal({
      title: "Net capital flow",
      icon: isPos ? (
        <ArrowUpRight size={16} color={netTone.text} />
      ) : (
        <ArrowDownRight size={16} color={netTone.text} />
      ),
      accentColor: netTone.text,
      bgColor: netTone.bg,
      borderColor: netTone.border,
      bigLabel: "Net flow today",
      bigValue: (isPos ? "+" : "") + fmt(net),
      badge: {
        text: isPos ? "Surplus" : "Deficit",
        color: netTone.text,
        bg: netTone.bg,
        border: netTone.border,
      },
      rows: [
        { label: "Total deposits", value: fmt(dep) },
        { label: "Total withdrawals", value: fmt(wd) },
        {
          label: "Net difference",
          value: fmt(Math.abs(net)),
          sub: isPos ? "Surplus" : "Deficit",
        },
        {
          label: "Deposit-to-withdrawal ratio",
          value: wd > 0 ? (dep / wd).toFixed(2) + "x" : "—",
        },
      ],
    });

  const openAcquisition = () =>
    setModal({
      title: "Acquisition breakdown",
      icon: <Users size={16} color="var(--body)" />,
      accentColor: amberTone.text,
      bgColor: amberTone.bg,
      borderColor: amberTone.border,
      bigLabel: "Total new today",
      bigValue: acq.toLocaleString(),
      rows: [
        {
          label: "New clients",
          value: nc.toLocaleString(),
          sub: pct(clientPct) + " of total",
        },
        {
          label: "IB partners",
          value: ib.toLocaleString(),
          sub: pct(ibPct) + " of total",
        },
        {
          label: "Client to partner ratio",
          value: ib > 0 ? (nc / ib).toFixed(1) + ":1" : "—",
        },
        { label: "Total acquisition today", value: acq.toLocaleString() },
      ],
    });

  // ── Shared card style ──
  const cardBase =
    "bg-surface-strong rounded-xl border cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group";

  const today = new Date();

  // ── Loading ──
  if (loading) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center min-h-64 gap-4"
        style={{ background: "var(--surface-strong)", border: "1px solid var(--border)" }}
      >
        <Loader2 className="animate-spin" size={28} color="var(--accent-color)" />
        <p className="text-sm font-medium" style={{ color: "var(--accent-color)" }}>
          Loading today's performance…
        </p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center min-h-64 gap-4 text-center"
        style={{ background: "var(--surface-strong)", border: "1px solid var(--border)" }}
      >
        <AlertCircle size={28} color="#a32d2d" />
        <p className="text-base font-semibold" style={{ color: "var(--heading)" }}>
          Performance board unavailable
        </p>
        <p className="text-sm max-w-xs" style={{ color: "var(--accent-color)" }}>
          {error}
        </p>
        <button
          onClick={() => void fetchData()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: "var(--surface-strong)",
            border: "1px solid var(--border)",
            color: "var(--body)",
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {modal && <DetailModal detail={modal} onClose={() => setModal(null)} />}

      <div
        className="rounded-2xl"
        style={{ background: "var(--surface-strong)", border: "1px solid var(--border)" }}
      >
        {/* ── Header ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-4 sm:px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{
                  background: "#7a9e6e",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--accent-color)" }}
              >
                Live performance
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-semibold tracking-tight"
              style={{ color: "var(--heading)" }}
            >
              Today's Funding &amp; Growth Pulse
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--accent-color)" }}>
              Tap any card for a detailed breakdown
            </p>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-wrap">
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--body)",
              }}
            >
              <Calendar size={12} />
              {today.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                timeZone: getConfiguredTimezone(),
              })}
            </div>
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--body)",
              }}
            >
              <Clock size={12} />
              {lastUpdated.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: getConfiguredTimezone(),
              })}
            </div>
            <button
              onClick={() => void fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--body)",
              }}
            >
              <RefreshCw
                size={12}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-4 sm:p-6 space-y-3">
          {/* Net flow hero — full width */}
          <button
            onClick={openNetFlow}
            className={`${cardBase} w-full text-left`}
            style={{ border: "1px solid var(--border)" }}
          >
            <div
              className="h-1 rounded-t-xl"
              style={{ background: netTone.text }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: netTone.bg,
                  border: `1px solid ${netTone.border}`,
                }}
              >
                {isPos ? (
                  <ArrowUpRight size={18} color={netTone.text} />
                ) : (
                  <ArrowDownRight size={18} color={netTone.text} />
                )}
              </div>
              <div className="flex-1">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: "var(--accent-color)" }}
                >
                  Net capital flow
                </p>
                <p
                  className="text-3xl sm:text-4xl font-semibold tracking-tight"
                  style={{
                    color: netTone.text,
                    lineHeight: 1,
                  }}
                >
                  {isPos ? "+" : ""}
                  {fmt(net)}
                </p>
              </div>
              <div className="sm:w-48 space-y-2">
                <div>
                  <div
                    className="flex justify-between text-xs mb-1"
                    style={{ color: "var(--accent-color)" }}
                  >
                    <span>Deposit share</span>
                    <span style={{ color: "var(--status-green)", fontWeight: 500 }}>
                      {pct(depRate)}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--surface)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: greenTone.text,
                        width: `${Math.min(100, depRate)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div
                    className="flex justify-between text-xs mb-1"
                    style={{ color: "var(--accent-color)" }}
                  >
                    <span>Withdrawal share</span>
                    <span style={{ color: "var(--status-red)", fontWeight: 500 }}>
                      {pct(wdRate)}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--surface)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: redTone.text,
                        width: `${Math.min(100, wdRate)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Deposits + Withdrawals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={openDeposits}
              className={`${cardBase} text-left`}
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="h-1 rounded-t-xl"
                style={{ background: greenTone.text }}
              />
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--accent-color)" }}
                  >
                    <TrendingUp size={13} color={greenTone.text} />
                    Total inflow
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: greenTone.bg,
                      color: greenTone.text,
                      border: `1px solid ${greenTone.border}`,
                    }}
                  >
                    {depC} deposits
                  </span>
                </div>
                <p
                  className="text-3xl font-semibold tracking-tight"
                  style={{ color: "var(--heading)", lineHeight: 1 }}
                >
                  {fmt(dep)}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--accent-color)" }}>
                  avg {fmtF(avgDep)} per deposit
                </p>
              </div>
            </button>

            <button
              onClick={openWithdrawals}
              className={`${cardBase} text-left`}
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="h-1 rounded-t-xl"
                style={{ background: redTone.text }}
              />
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--accent-color)" }}
                  >
                    <TrendingDown size={13} color={redTone.text} />
                    Total outflow
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: redTone.bg,
                      color: redTone.text,
                      border: `1px solid ${redTone.border}`,
                    }}
                  >
                    {wdC} withdrawals
                  </span>
                </div>
                <p
                  className="text-3xl font-semibold tracking-tight"
                  style={{ color: "var(--heading)", lineHeight: 1 }}
                >
                  {fmt(wd)}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--accent-color)" }}>
                  avg {fmtF(avgWd)} per withdrawal
                </p>
              </div>
            </button>
          </div>

          {/* KPI tiles — 4 across on desktop, 2×2 on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Transactions",
                value: tx.toLocaleString(),
                icon: <Repeat size={15} color="var(--heading)" />,
                iconBg: amberTone.bg,
                onClick: openTransactions,
              },
              {
                label: "New clients",
                value: nc.toLocaleString(),
                icon: <UserCheck size={15} color={blueTone.text} />,
                iconBg: blueTone.bg,
                onClick: openClients,
              },
              {
                label: "IB partners",
                value: ib.toLocaleString(),
                icon: <Users size={15} color="var(--heading)" />,
                iconBg: amberTone.bg,
                onClick: openAcquisition,
              },
              {
                label: "Total acquired",
                value: acq.toLocaleString(),
                icon: <Activity size={15} color="var(--body)" />,
                iconBg: amberTone.bg,
                onClick: openAcquisition,
              },
            ].map((k) => (
              <button
                key={k.label}
                onClick={k.onClick}
                className={`${cardBase} text-left`}
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="px-4 py-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: k.iconBg }}
                  >
                    {k.icon}
                  </div>
                  <p
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: "var(--heading)", lineHeight: 1 }}
                  >
                    {k.value}
                  </p>
                  <p
                    className="text-xs font-medium uppercase tracking-wider mt-1.5"
                    style={{ color: "var(--accent-color)" }}
                  >
                    {k.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom detail row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Transaction mix */}
            <button
              onClick={openTransactions}
              className={`${cardBase} text-left`}
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="px-5 py-4">
                <div
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--accent-color)" }}
                >
                  <BarChart2 size={13} />
                  Transaction mix
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "var(--accent-color)" }}>Deposit rate</span>
                      <span style={{ color: "var(--status-green)", fontWeight: 600 }}>
                        {pct(depRate)}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: greenTone.text,
                          width: `${Math.min(100, depRate)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "var(--accent-color)" }}>Withdrawal rate</span>
                      <span style={{ color: "var(--status-red)", fontWeight: 600 }}>
                        {pct(wdRate)}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: redTone.text,
                          width: `${Math.min(100, wdRate)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="flex gap-3 mt-4 pt-4"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "var(--accent-color)" }}>
                      Avg deposit
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--heading)" }}
                    >
                      {fmt(avgDep)}
                    </p>
                  </div>
                  <div className="w-px" style={{ background: "var(--surface)" }} />
                  <div>
                    <p className="text-xs" style={{ color: "var(--accent-color)" }}>
                      Avg withdrawal
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--heading)" }}
                    >
                      {fmt(avgWd)}
                    </p>
                  </div>
                </div>
              </div>
            </button>

            {/* Acquisition split */}
            <button
              onClick={openAcquisition}
              className={`${cardBase} text-left`}
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="px-5 py-4">
                <div
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--accent-color)" }}
                >
                  <Users size={13} />
                  Acquisition split
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "var(--accent-color)" }}>New clients</span>
                      <span style={{ color: "var(--status-blue)", fontWeight: 600 }}>
                        {pct(clientPct)}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: blueTone.text,
                          width: `${Math.min(100, clientPct)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "var(--accent-color)" }}>IB partners</span>
                      <span style={{ color: "var(--heading)", fontWeight: 600 }}>
                        {pct(ibPct)}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: "var(--accent-color)",
                          width: `${Math.min(100, ibPct)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="flex gap-3 mt-4 pt-4"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "var(--accent-color)" }}>
                      Clients
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--heading)" }}
                    >
                      {nc}
                    </p>
                  </div>
                  <div className="w-px" style={{ background: "var(--surface)" }} />
                  <div>
                    <p className="text-xs" style={{ color: "var(--accent-color)" }}>
                      IB partners
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--heading)" }}
                    >
                      {ib}
                    </p>
                  </div>
                  <div className="w-px" style={{ background: "var(--surface)" }} />
                  <div>
                    <p className="text-xs" style={{ color: "var(--accent-color)" }}>
                      Total
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--heading)" }}
                    >
                      {acq}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--accent-color)" }}
          >
            <Zap size={12} />
            Reacts to real‑time admin dashboard events
          </div>
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--accent-color)" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#7a9e6e", display: "inline-block" }}
            />
            Live
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slide-up {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </>
  );
};

export default TodaysPerformanceCards;
