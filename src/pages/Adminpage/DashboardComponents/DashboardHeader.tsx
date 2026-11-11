import React, { useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  Clock3,
  Wifi,
  RefreshCw,
  AlertTriangle,
  BellRing,
} from "lucide-react";
import type { CurrentSuspensionState } from "@/hooks/useBillingSuspension";
import { useAPI } from "../../../API/api";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

const compact = (n: number, currency = false) => {
  const f = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: n >= 1000 ? 1 : 2,
  }).format(n);
  return currency ? `$${f}` : f;
};

type RealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "failed";

interface DashboardHeaderProps {
  realtimeStatus?: RealtimeStatus;
  realtimeMessage?: string;
  paymentAlertState?: CurrentSuspensionState | null;
}

const realtimeMeta: Record<
  RealtimeStatus,
  { label: string; detail: string; live: boolean }
> = {
  idle: {
    label: "Idle",
    detail: "Awaiting session.",
    live: false,
  },
  connecting: {
    label: "Connecting",
    detail: "Establishing feed.",
    live: false,
  },
  connected: {
    label: "Live sync on",
    detail: "Live and synced.",
    live: true,
  },
  reconnecting: {
    label: "Retrying",
    detail: "Reconnecting.",
    live: false,
  },
  disconnected: {
    label: "Disconnected",
    detail: "Updates paused.",
    live: false,
  },
  failed: {
    label: "Failed",
    detail: "Retrying.",
    live: false,
  },
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  realtimeStatus = "connecting",
  realtimeMessage,
  paymentAlertState,
}) => {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: getConfiguredTimezone(),
    }),
  );

  const { dashboardAPI } = useAPI();
  const [stats, setStats] = useState<{
    clients: { total: number; today: number };
    equity: { total: number };
    kyc: { pending: number; today: number };
    alerts: { active: number };
  } | null>(null);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch header stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleRefresh = () => fetchStats();
    window.addEventListener("crm:admin-dashboard-refresh", handleRefresh);

    const id = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: getConfiguredTimezone(),
        }),
      );
    }, 15_000);
    return () => {
      clearInterval(id);
      window.removeEventListener("crm:admin-dashboard-refresh", handleRefresh);
    };
  }, []);

  const rt = realtimeMeta[realtimeStatus];

  const alert = paymentAlertState?.isSuspended
    ? {
        label: "Suspended",
        message: paymentAlertState.adminMessage,
        Icon: AlertTriangle,
        bg: "bg-surface-strong border-border text-[#7a3a25] dark:text-[#d99a7a]",
      }
    : paymentAlertState?.reminders?.inGrace
      ? {
          label: "Grace period",
          message: `Payment overdue${paymentAlertState.dueDateKey ? ` since ${paymentAlertState.dueDateKey}` : ""}. Resolve before suspension.`,
          Icon: BellRing,
          bg: "bg-surface-strong border-border text-body",
        }
      : paymentAlertState?.reminders?.dueSoon
        ? {
            label: "Payment due",
            message: `Payment is due${paymentAlertState.dueDateKey ? ` on ${paymentAlertState.dueDateKey}` : " soon"}.`,
            Icon: BellRing,
            bg: "bg-[#f5f8fd] dark:bg-surface-strong border-[#c8d9ef] dark:border-border text-[#2e4f7a] dark:text-[#7ba7d9]",
          }
        : null;

  const ticker = [
    {
      num: stats ? stats.clients.total.toLocaleString() : "...",
      label: "Total clients",
      delta: stats ? `+${stats.clients.today} today` : "...",
      color: "text-[#5f8e72]",
    },
    {
      label: "Open equity",
      num: stats ? compact(stats.equity.total, true) : "...",
      delta: "",
      color: "text-[#5f8e72]",
    },
    {
      num: stats ? stats.kyc.pending.toLocaleString() : "...",
      label: "Pending KYC",
      delta: stats ? `${stats.kyc.today} new` : "...",
      color: "text-[#b97d70]",
    },
    {
      num: stats ? stats.alerts.active.toLocaleString() : "...",
      label: "Active alerts",
      delta: stats?.alerts.active === 0 ? "All clear" : "Needs review",
      color: stats?.alerts.active === 0 ? "text-subtle" : "text-[#b97d70]",
    },
  ];

  return (
    <section className="bg-surface-strong border border-border rounded-2xl overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-[22px] py-[18px] border-b border-border flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-subtle">
            <Activity className="h-3 w-3" />
            Admin <span className="text-heading">/</span> Overview
          </div>
          <h1 className="mt-1 text-lg font-semibold text-[#162033] dark:text-heading leading-tight">
            Operations
          </h1>
          <p className="mt-0.5 text-[12px] text-body">
            Clients, flow, and security.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium border ${
              rt.live
                ? "bg-[#f0f9f2] dark:bg-surface-strong border-[#c5dfc9] dark:border-border text-[#3d6b44] dark:text-[#8ab88a]"
                : "bg-surface-strong border-border text-body"
            }`}
          >
            {rt.live && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-[#5f8e72] opacity-60" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-[#5f8e72]" />
              </span>
            )}
            {rt.live ? "Live sync on" : rt.label}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium bg-surface-strong border border-border text-body">
            <Clock3 className="h-3.5 w-3.5 text-accent" />
            {time}
          </span>

          <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border bg-surface-strong text-body hover:bg-surface-strong transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Three stat cells */}
      <div className="grid grid-cols-3 divide-x divide-[#ebdcb9] dark:divide-border border-b border-border">
        {[
          {
            bar: "#5f8e72",
            label: "Signal",
            Icon: Wifi,
            value: realtimeMessage || rt.label,
            hint: rt.detail,
          },
          {
            bar: "#7ea6c7",
            label: "Session",
            Icon: ShieldCheck,
            value: "Guard active",
            hint: "Active session guard.",
          },
          {
            bar: "#b48551",
            label: "Admin time",
            Icon: Clock3,
            value: time,
            hint: "Current server time.",
          },
        ].map(({ bar, label, Icon, value, hint }) => (
          <div key={label} className="px-5 py-4">
            <div className="w-5 h-0.5 mb-2.5" style={{ background: bar }} />
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-subtle mb-1.5">
              {label}
            </p>
            <div className="flex items-center gap-2 text-[15px] font-medium text-[#162033] dark:text-heading">
              <Icon className="h-4 w-4 text-accent" />
              {value}
            </div>
            <p className="mt-1 text-[12px] text-body">{hint}</p>
          </div>
        ))}
      </div>

      {/* Ticker row */}
      <div className="grid grid-cols-4 divide-x divide-[#ebdcb9] dark:divide-border">
        {ticker.map(({ num, label, delta, color }) => (
          <div key={label} className="px-[18px] py-3 flex flex-col gap-0.5">
            <div className="text-base font-medium text-[#162033] dark:text-heading">{num}</div>
            <div className="text-[11px] text-subtle">{label}</div>
            <div className={`text-[11px] font-medium ${color}`}>{delta}</div>
          </div>
        ))}
      </div>

      {/* Payment alert */}
      {alert && (
        <div
          className={`flex items-center gap-2.5 px-5 py-2.5 border-t border-border text-[13px] ${alert.bg}`}
        >
          <alert.Icon className="h-4 w-4 flex-shrink-0" />
          <span>
            <span className="font-medium">{alert.label} — </span>
            {alert.message}
          </span>
        </div>
      )}
    </section>
  );
};
