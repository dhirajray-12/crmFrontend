import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Globe,
  Laptop,
  Loader2,
  LogOut,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useToastStore } from "@/Store/toast.store";
import { getSessionHeaders, handleExpiredSession } from "@/utils/session";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { Panel } from "@/pages/ClientPage/DashboardComponents/ui/Panel";
import { SectionHeader } from "@/pages/ClientPage/DashboardComponents/ui/SectionHeader";
import { StatCell, StatRow } from "@/pages/ClientPage/DashboardComponents/ui/StatTile";
import { Pill, type PillTone } from "@/pages/ClientPage/DashboardComponents/ui/Pill";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

type PanelMode = "client" | "admin";

interface DeviceSessionRecord {
  id: string;
  sessionId: string;
  deviceId: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  isTrusted: boolean;
  isBlocked: boolean;
  status: "active" | "logged_out" | "forced_logout" | "blocked" | "expired";
  lastActiveAt: string;
  loggedInAt: string;
  forcedLogoutAt?: string | null;
  blockedAt?: string | null;
  isCurrentSession?: boolean;
}

interface DeviceSecurityPanelProps {
  mode?: PanelMode;
  clientId?: string;
  className?: string;
}

const statusTone: Record<DeviceSessionRecord["status"], PillTone> = {
  active: "emerald",
  logged_out: "neutral",
  forced_logout: "amber",
  blocked: "rose",
  expired: "amber",
};

const deviceIconMap = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
  bot: ShieldAlert,
  unknown: Globe,
} as const;

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

const fetchJson = async (url: string, init: RequestInit = {}) => {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: await getSessionHeaders({
      "Content-Type": "application/json",
      ...init.headers,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
};

export default function DeviceSecurityPanel({
  mode = "client",
  clientId,
  className = "",
}: DeviceSecurityPanelProps) {
  const [sessions, setSessions] = useState<DeviceSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);
  const [clientLabel, setClientLabel] = useState("");
  const addToast = useToastStore((state) => state.addToast);

  const loadSessions = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      if (mode === "admin" && !clientId) {
        setSessions([]);
        return;
      }

      const url =
        mode === "client"
          ? `${API_BASE_URL}/client/dashboard/devices`
          : `${API_BASE_URL}/clients/${clientId}/devices`;

      const payload = await fetchJson(url);
      const nextSessions =
        mode === "client" ? payload.data ?? [] : payload.data?.sessions ?? [];

      setSessions(nextSessions);

      if (mode === "admin" && payload.data?.user) {
        const user = payload.data.user;
        setClientLabel(`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email);
      }
    } catch (error: any) {
      addToast("error", error.message || "Failed to load device sessions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [mode, clientId]);

  useRealtimeSync({
    events: ["deviceSessionUpdated", "sessionRevoked"],
    onEvent: (event, data) => {
      if (mode === "admin" && !clientId) return;

      if (event === "deviceSessionUpdated") {
        void loadSessions(true);
        return;
      }

      if (event === "sessionRevoked" && mode === "client") {
        const revoked = sessions.find(
          (session) => session.sessionId === data?.sessionId,
        );
        if (revoked?.isCurrentSession) {
          void handleExpiredSession();
        } else {
          void loadSessions(true);
        }
      }
    },
  });

  const stats = useMemo(() => {
    const trusted = sessions.filter((item) => item.isTrusted).length;
    const blocked = sessions.filter((item) => item.isBlocked).length;
    const active = sessions.filter((item) => item.status === "active").length;

    return { trusted, blocked, active };
  }, [sessions]);

  const handleClientAction = async (
    sessionId: string,
    action: "trust" | "logout",
    isTrusted?: boolean,
  ) => {
    setActionSessionId(sessionId);

    try {
      if (action === "trust") {
        await fetchJson(`${API_BASE_URL}/client/dashboard/devices/${sessionId}/trust`, {
          method: "PATCH",
          body: JSON.stringify({ isTrusted }),
        });
      } else {
        await fetchJson(`${API_BASE_URL}/client/dashboard/devices/${sessionId}/logout`, {
          method: "POST",
        });
      }

      addToast(
        "success",
        action === "trust" ? "Device trust updated" : "Session logged out",
      );
      await loadSessions(true);
    } catch (error: any) {
      addToast("error", error.message || "Action failed");
    } finally {
      setActionSessionId(null);
    }
  };

  const handleAdminAction = async (
    sessionId: string,
    action: "block" | "mark_safe" | "force_logout" | "trust",
    isTrusted?: boolean,
  ) => {
    if (!clientId) return;

    setActionSessionId(sessionId);

    try {
      await fetchJson(`${API_BASE_URL}/clients/${clientId}/devices/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ action, isTrusted }),
      });

      addToast(
        "success",
        action === "block"
          ? "Device blocked"
          : action === "mark_safe"
            ? "Device marked safe"
            : action === "force_logout"
              ? "Session logged out"
              : "Device trust updated",
      );
      await loadSessions(true);
    } catch (error: any) {
      addToast("error", error.message || "Action failed");
    } finally {
      setActionSessionId(null);
    }
  };

  return (
    <Panel className={className}>
      <SectionHeader
        icon={Shield}
        eyebrow="Device security"
        title={
          mode === "client"
            ? "Session security and device management"
            : `Client device management${clientLabel ? ` for ${clientLabel}` : ""}`
        }
        description="Review login devices, IPs, and last activity, and control trusted, blocked, and active sessions."
        action={
          <button
            type="button"
            onClick={() => loadSessions(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-subtle transition-colors hover:border-border hover:text-heading disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <div className="p-4 sm:p-5">
        <StatRow columns={3}>
          <StatCell label="Active" value={stats.active} tone="positive" />
          <StatCell label="Trusted" value={stats.trusted} />
          <StatCell label="Blocked" value={stats.blocked} tone={stats.blocked > 0 ? "negative" : "default"} />
        </StatRow>

        {loading ? (
          <div className="flex min-h-[160px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-strong/[0.03] px-4 py-8 text-center text-sm text-subtle">
            No device sessions found yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {sessions.map((session) => {
              const DeviceIcon = deviceIconMap[session.deviceType] || Globe;
              const busy = actionSessionId === session.sessionId;

              return (
                <div
                  key={session.sessionId}
                  className="rounded-xl border border-border bg-surface-strong/[0.03] p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <DeviceIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="truncate text-sm font-semibold text-heading">
                              {session.deviceName}
                            </h3>
                            {session.isCurrentSession && <Pill tone="sky">Current</Pill>}
                            {session.isTrusted && <Pill tone="emerald">Trusted</Pill>}
                            {session.isBlocked && <Pill tone="rose">Blocked</Pill>}
                            <Pill tone={statusTone[session.status]}>
                              {session.status.replace("_", " ")}
                            </Pill>
                          </div>
                          <p className="mt-1 text-xs text-subtle">
                            {session.browser} on {session.os}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                        <div className="rounded-lg bg-field p-2.5">
                          <div className="text-[10px] uppercase tracking-[0.08em] text-subtle">
                            IP address
                          </div>
                          <div className="mt-1 truncate text-xs font-medium text-heading">
                            {session.ipAddress || "Unknown"}
                          </div>
                        </div>
                        <div className="rounded-lg bg-field p-2.5">
                          <div className="text-[10px] uppercase tracking-[0.08em] text-subtle">
                            Location
                          </div>
                          <div className="mt-1 truncate text-xs font-medium text-heading">
                            {session.location || "Unknown"}
                          </div>
                        </div>
                        <div className="rounded-lg bg-field p-2.5">
                          <div className="text-[10px] uppercase tracking-[0.08em] text-subtle">
                            Last active
                          </div>
                          <div className="mt-1 truncate text-xs font-medium text-heading">
                            {formatDateTime(session.lastActiveAt)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-field p-2.5">
                          <div className="text-[10px] uppercase tracking-[0.08em] text-subtle">
                            Logged in
                          </div>
                          <div className="mt-1 truncate text-xs font-medium text-heading">
                            {formatDateTime(session.loggedInAt)}
                          </div>
                        </div>
                      </div>

                      {session.isBlocked && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          Blocked devices cannot log in again until an admin marks them safe.
                        </div>
                      )}
                    </div>

                    <div className="flex w-full shrink-0 flex-col gap-1.5 lg:w-44">
                      {mode === "client" ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleClientAction(session.sessionId, "trust", !session.isTrusted)
                            }
                            disabled={busy || session.isBlocked}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {session.isTrusted ? "Remove trust" : "Mark trusted"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClientAction(session.sessionId, "logout")}
                            disabled={
                              busy || session.status !== "active" || session.isCurrentSession
                            }
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-200 transition-colors hover:bg-amber-400/[0.18] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            {session.isCurrentSession ? "Current session" : "Force logout"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleAdminAction(session.sessionId, "trust", !session.isTrusted)
                            }
                            disabled={busy || session.isBlocked}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {session.isTrusted ? "Untrust" : "Trust"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAdminAction(
                                session.sessionId,
                                session.isBlocked ? "mark_safe" : "block",
                              )
                            }
                            disabled={busy}
                            className={cn(
                              "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                              session.isBlocked
                                ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-400/[0.18]"
                                : "border border-rose-400/25 bg-rose-400/10 text-rose-700 dark:text-rose-200 hover:bg-rose-400/[0.18]",
                            )}
                          >
                            {session.isBlocked ? (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldAlert className="h-3.5 w-3.5" />
                            )}
                            {session.isBlocked ? "Mark safe" : "Block device"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminAction(session.sessionId, "force_logout")}
                            disabled={busy || session.status !== "active"}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-200 transition-colors hover:bg-amber-400/[0.18] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Force logout
                          </button>
                        </>
                      )}

                      {busy && (
                        <div className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-surface-strong/5 px-3 py-1.5 text-[11px] text-subtle">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Updating
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}
