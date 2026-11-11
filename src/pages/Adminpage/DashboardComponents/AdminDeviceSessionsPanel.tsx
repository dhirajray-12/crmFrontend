import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Laptop,
  Loader2,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Tablet,
  X,
  Activity,
  Lock,
  Unlock,
  MapPin,
  Clock,
  Wifi,
  Monitor,
  Filter,
} from "lucide-react";
import { useToastStore } from "@/Store/toast.store";
import { getSessionHeaders } from "@/utils/session";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const SESSIONS_PER_PAGE = 5;

interface DeviceSessionItem {
  id: string;
  sessionId: string;
  deviceId?: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isTrusted: boolean;
  isBlocked: boolean;
  status: "active" | "logged_out" | "forced_logout" | "blocked" | "expired";
  lastActiveAt: string;
  loggedInAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface PendingConfirmation {
  session: DeviceSessionItem;
  action: "block" | "mark_safe" | "force_logout" | "trust";
  isTrusted?: boolean;
  title: string;
  message: string;
  tone: "violet" | "rose" | "emerald" | "amber";
}

const getSessionUser = (session: Partial<DeviceSessionItem>) => ({
  id: session.user?.id || "",
  firstName: session.user?.firstName || "",
  lastName: session.user?.lastName || "",
  email: session.user?.email || "",
  role: session.user?.role || "",
});

const getClientName = (session: Partial<DeviceSessionItem>) => {
  const user = getSessionUser(session);
  return (
    `${user.firstName} ${user.lastName}`.trim() || user.email || "this client"
  );
};

const mergeSessionsWithExistingUsers = (
  nextSessions: Partial<DeviceSessionItem>[],
  previousSessions: DeviceSessionItem[],
): DeviceSessionItem[] => {
  const previousBySessionId = new Map(
    previousSessions.map((s) => [s.sessionId, s]),
  );
  const previousByDeviceId = new Map(
    previousSessions
      .filter((s) => s.deviceId)
      .map((s) => [s.deviceId as string, s]),
  );
  return nextSessions.map((session) => {
    const matched =
      (session.sessionId && previousBySessionId.get(session.sessionId)) ||
      (session.deviceId && previousByDeviceId.get(session.deviceId)) ||
      null;
    return {
      ...matched,
      ...session,
      deviceId: session.deviceId || matched?.deviceId,
      user: session.user || matched?.user || getSessionUser(session),
    } as DeviceSessionItem;
  });
};

const getActionConfirmation = (
  session: DeviceSessionItem,
  action: "block" | "mark_safe" | "force_logout" | "trust",
  isTrusted?: boolean,
): PendingConfirmation => {
  const clientName = getClientName(session);
  if (action === "trust") {
    return isTrusted
      ? {
          session,
          action,
          isTrusted,
          title: "Trust device",
          message: `${session.deviceName} will be marked as trusted for ${clientName}.`,
          tone: "violet",
        }
      : {
          session,
          action,
          isTrusted,
          title: "Remove trust",
          message: `${session.deviceName} will no longer stay trusted for ${clientName}.`,
          tone: "violet",
        };
  }
  if (action === "block")
    return {
      session,
      action,
      title: "Block device",
      message: `${session.deviceName} will be prevented from logging in for ${clientName} until it is marked safe.`,
      tone: "rose",
    };
  if (action === "mark_safe")
    return {
      session,
      action,
      title: "Unblock device",
      message: `${session.deviceName} will be marked safe and allowed again for ${clientName}.`,
      tone: "emerald",
    };
  return {
    session,
    action,
    title: "Force logout",
    message: `${session.deviceName} will be signed out immediately for ${clientName}.`,
    tone: "amber",
  };
};

const deviceIconMap = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
  bot: ShieldAlert,
  unknown: Globe,
} as const;

const statusConfig = {
  active: {
    label: "Active",
    dot: "#4f8664",
    text: "#3f6f53",
    bg: "rgba(79,134,100,0.10)",
    border: "rgba(79,134,100,0.22)",
  },
  logged_out: {
    label: "Logged out",
    dot: "#8d816c",
    text: "#6f6556",
    bg: "rgba(141,129,108,0.09)",
    border: "rgba(141,129,108,0.2)",
  },
  forced_logout: {
    label: "Forced logout",
    dot: "#b78932",
    text: "#8b6a2d",
    bg: "rgba(183,137,50,0.10)",
    border: "rgba(183,137,50,0.22)",
  },
  blocked: {
    label: "Blocked",
    dot: "#a85f56",
    text: "#8b4f49",
    bg: "rgba(168,95,86,0.10)",
    border: "rgba(168,95,86,0.22)",
  },
  expired: {
    label: "Expired",
    dot: "#587796",
    text: "#4a607a",
    bg: "rgba(88,119,150,0.09)",
    border: "rgba(88,119,150,0.2)",
  },
} as const;

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

const formatTimeAgo = (value?: string | null) => {
  if (!value) return "N/A";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

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
  if (!response.ok) throw new Error(payload?.message || "Request failed");
  return payload;
};

function getInitials(session: DeviceSessionItem) {
  const name = getClientName(session);
  if (!name || name === "this client") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.FC<{ className?: string; style?: CSSProperties }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-[rgba(200,150,60,0.28)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(246,236,219,0.9))] dark:border-border dark:bg-surface-strong dark:bg-none"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
        style={{ background: color + "18", borderColor: color + "35" }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-body">
          {label}
        </div>
        <div
          className="text-xl font-black tracking-tight text-heading"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Session Detail Popup ─────────────────────────────────────────────────────
function SessionDetailPopup({
  session,
  busy,
  onClose,
  onAction,
}: {
  session: DeviceSessionItem;
  busy: boolean;
  onClose: () => void;
  onAction: (
    action: "block" | "mark_safe" | "force_logout" | "trust",
    trusted?: boolean,
  ) => void;
}) {
  const DeviceIcon = deviceIconMap[session.deviceType] || Globe;
  const sc = statusConfig[session.status];
  const user = getSessionUser(session);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      style={{ background: "rgba(20,14,6,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[26px] border shadow-2xl"
        style={{
          borderColor: "rgba(200,150,60,0.45)",
          // Solid, not the translucent --surface-strong/--surface used for
          // in-page cards - this is the modal's own background and needs to
          // fully obscure whatever's behind it.
          background: "var(--app-bg)",
          boxShadow:
            "0 32px 80px rgba(116,93,56,0.28), 0 8px 20px rgba(116,93,56,0.14)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* top accent bar */}
        <div
          className="sticky top-0 inset-x-0 h-1 z-10 rounded-t-[26px]"
          style={{
            background: "linear-gradient(90deg,var(--accent-color),var(--surface),var(--accent-color))",
          }}
        />

        {/* ── Popup Header ── */}
        <div
          className="flex items-start gap-4 border-b px-5 py-5 sm:px-6"
          style={{ borderColor: "rgba(200,150,60,0.22)" }}
        >
          {/* device icon */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border shadow-sm"
            style={{
              background: "linear-gradient(135deg,var(--surface-strong),var(--surface))",
              borderColor: "rgba(200,150,60,0.35)",
            }}
          >
            <DeviceIcon className="h-5 w-5 text-heading" />
          </div>

          {/* title block */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-heading leading-tight truncate">
                {session.deviceName}
              </h3>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em] rounded-md px-2 py-0.5 border"
                style={{
                  color: sc.text,
                  background: sc.bg,
                  borderColor: sc.border,
                }}
              >
                {sc.label}
              </span>
              {session.isBlocked && (
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] rounded-md px-2 py-0.5 border border-[rgba(168,95,86,0.25)] bg-[rgba(168,95,86,0.08)] text-[#8b4f49]">
                  Blocked
                </span>
              )}
              {session.isTrusted && (
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] rounded-md px-2 py-0.5 border border-[rgba(89,82,129,0.25)] bg-[rgba(89,82,129,0.08)] text-[#595281]">
                  Trusted
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-body">
              {getClientName(session)} · {user.email || "No email"} ·{" "}
              {formatTimeAgo(session.lastActiveAt)}
            </p>
          </div>

          {/* close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-body transition hover:bg-surface-strong bg-[rgba(255,252,247,0.9)] dark:bg-surface-strong"
            style={{
              borderColor: "rgba(200,150,60,0.3)",
            }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Popup Body ── */}
        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          {/* ── Left: details ── */}
          <div className="space-y-3">
            {/* client avatar row */}
            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3 bg-[rgba(255,252,247,0.8)] dark:bg-surface-strong"
              style={{ borderColor: "rgba(200,150,60,0.2)", }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-sm text-heading border"
                style={{
                  background: "linear-gradient(135deg,var(--surface-strong),var(--accent-color))",
                  borderColor: "rgba(200,150,60,0.35)",
                }}
              >
                {getInitials(session)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-heading truncate">
                  {getClientName(session)}
                </div>
                <div className="text-xs text-body truncate">
                  {user.email || "No email"}
                </div>
              </div>
            </div>

            {/* detail chips grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: Monitor,
                  label: "Browser",
                  value: `${session.browser} / ${session.os}`,
                },
                {
                  icon: Wifi,
                  label: "IP Address",
                  value: session.ipAddress || "Unknown",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: session.location || "Unknown",
                },
                {
                  icon: Activity,
                  label: "Session ID",
                  value: session.sessionId.slice(0, 12) + "…",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border px-3 py-2.5 bg-[rgba(255,250,235,0.7)] dark:bg-surface-strong"
                  style={{ borderColor: "rgba(200,150,60,0.18)", }}
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-body">
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-heading truncate">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* timestamps */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: Clock,
                  label: "Last Active",
                  value: formatDateTime(session.lastActiveAt),
                },
                {
                  icon: Clock,
                  label: "Logged In",
                  value: formatDateTime(session.loggedInAt),
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border px-3 py-2.5 bg-[rgba(255,250,235,0.7)] dark:bg-surface-strong"
                  style={{ borderColor: "rgba(200,150,60,0.18)", }}
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-body">
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-heading">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {session.isBlocked && (
              <div className="flex items-start gap-2 rounded-xl border border-[rgba(168,95,86,0.25)] bg-[rgba(168,95,86,0.06)] px-3 py-2.5 text-xs text-[#8b4f49] font-medium">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                This device is blocked until marked safe.
              </div>
            )}
          </div>

          {/* ── Right: controls ── */}
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-body">
              Session Controls
            </div>

            {/* Trust toggle */}
            <button
              type="button"
              disabled={busy || session.isBlocked}
              onClick={() => onAction("trust", !session.isTrusted)}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: "rgba(89,82,129,0.3)",
                // Was a hardcoded near-white gradient with no dark-mode
                // variant - always rendered as a plain white card regardless
                // of theme. var(--surface-strong) matches the theme-aware
                // pattern the Block device button below already uses.
                background:
                  "linear-gradient(180deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(89,82,129,0.2)] bg-[rgba(89,82,129,0.08)]">
                <ShieldCheck className="h-4 w-4 text-[#595281] dark:text-[#9991ca]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#595281] dark:text-[#9991ca]">
                  {session.isTrusted ? "Remove trust" : "Trust device"}
                </div>
                <div className="text-xs text-[#8878b0] dark:text-[#a191ca]">
                  {session.isTrusted
                    ? "Revoke verified status"
                    : "Mark as verified & safe"}
                </div>
              </div>
              {busy && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin text-[#595281] dark:text-[#9991ca]" />
              )}
            </button>

            {/* Block / Unblock */}
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onAction(session.isBlocked ? "mark_safe" : "block")
              }
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              style={
                session.isBlocked
                  ? {
                      borderColor: "rgba(79,134,100,0.3)",
                      // Same fix as the Trust toggle above - was a hardcoded
                      // near-white gradient with no dark-mode variant.
                      background:
                        "linear-gradient(180deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
                    }
                  : {
                      borderColor: "rgba(168,95,86,0.3)",
                      background:
                        "linear-gradient(180deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
                    }
              }
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                style={
                  session.isBlocked
                    ? {
                        borderColor: "rgba(79,134,100,0.22)",
                        background: "rgba(79,134,100,0.08)",
                      }
                    : {
                        borderColor: "rgba(168,95,86,0.22)",
                        background: "rgba(168,95,86,0.08)",
                      }
                }
              >
                {session.isBlocked ? (
                  <Unlock className="h-4 w-4 text-[#3f6f53] dark:text-[#91caa9]" />
                ) : (
                  <Lock className="h-4 w-4 text-[#8b4f49] dark:text-[#ca9691]" />
                )}
              </div>
              <div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: session.isBlocked ? "#3f6f53" : "#8b4f49" }}
                >
                  {session.isBlocked ? "Mark safe" : "Block device"}
                </div>
                <div
                  className="text-xs"
                  style={{ color: session.isBlocked ? "#5f9e7a" : "#b07070" }}
                >
                  {session.isBlocked
                    ? "Restore login access"
                    : "Deny all login attempts"}
                </div>
              </div>
            </button>

            {/* Force logout */}
            <button
              type="button"
              disabled={busy || session.status !== "active"}
              onClick={() => onAction("force_logout")}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: "rgba(183,137,50,0.3)",
                background: "linear-gradient(180deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(183,137,50,0.22)] bg-[rgba(183,137,50,0.08)]">
                <LogOut className="h-4 w-4 text-body" />
              </div>
              <div>
                <div className="text-sm font-semibold text-body">
                  Force logout
                </div>
                <div className="text-xs text-accent">
                  {session.status !== "active"
                    ? "Session already inactive"
                    : "Terminate session immediately"}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Session Row ──────────────────────────────────────────────────────────────
function SessionRow({
  session,
  rank,
  busy,
  onOpen,
}: {
  session: DeviceSessionItem;
  rank: number;
  busy: boolean;
  onOpen: () => void;
}) {
  const DeviceIcon = deviceIconMap[session.deviceType] || Globe;
  const sc = statusConfig[session.status];

  return (
    <article
      className="rounded-[22px] border overflow-hidden transition-all duration-200 cursor-pointer border-[rgba(200,150,60,0.22)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(246,236,219,0.90))] dark:border-border dark:bg-surface-strong dark:bg-none"
      style={{
        boxShadow: "0 4px 12px rgba(116,93,56,0.06)",
      }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        const isDark = document.documentElement.dataset.themeMode === "dark";
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = isDark
          ? "0 8px 24px rgba(0,0,0,0.35)"
          : "0 8px 24px rgba(116,93,56,0.13)";
        if (!isDark) {
          el.style.borderColor = "rgba(200,150,60,0.45)";
          el.style.background = "linear-gradient(180deg,#fffef9 0%,#fdf5e0 100%)";
        }
      }}
      onMouseLeave={(e) => {
        const isDark = document.documentElement.dataset.themeMode === "dark";
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 4px 12px rgba(116,93,56,0.06)";
        if (!isDark) {
          el.style.borderColor = "rgba(200,150,60,0.22)";
          el.style.background =
            "linear-gradient(180deg,rgba(255,252,247,0.98),rgba(246,236,219,0.90))";
        } else {
          el.style.borderColor = "";
          el.style.background = "";
        }
      }}
    >
      <div className="px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3 min-w-0">
          {/* rank */}
          <div
            className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-body border"
            style={{
              background: "rgba(200,150,60,0.10)",
              borderColor: "rgba(200,150,60,0.22)",
            }}
          >
            {rank}
          </div>

          {/* device icon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border shadow-sm"
            style={{
              background: "linear-gradient(135deg,var(--surface-strong),var(--surface))",
              borderColor: "rgba(200,150,60,0.35)",
            }}
          >
            <DeviceIcon className="h-4.5 w-4.5 text-heading" />
          </div>

          {/* main info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-heading truncate leading-tight">
                {session.deviceName}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em] rounded-md px-2 py-0.5 border"
                style={{
                  color: sc.text,
                  background: sc.bg,
                  borderColor: sc.border,
                }}
              >
                {sc.label}
              </span>
              {session.isBlocked && (
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] rounded-md px-2 py-0.5 border border-[rgba(168,95,86,0.25)] bg-[rgba(168,95,86,0.08)] text-[#8b4f49]">
                  Blocked
                </span>
              )}
              {session.isTrusted && (
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] rounded-md px-2 py-0.5 border border-[rgba(89,82,129,0.25)] bg-[rgba(89,82,129,0.08)] text-[#595281]">
                  Trusted
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-body">
              <span className="truncate">{getClientName(session)}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline truncate">
                {getSessionUser(session).email}
              </span>
              <span>·</span>
              <span>{formatTimeAgo(session.lastActiveAt)}</span>
            </div>
          </div>

          {/* right: live dot + open hint */}
          <div className="flex items-center gap-2 shrink-0">
            {session.status === "active" && (
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: sc.dot }}
              />
            )}
            {busy && (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            )}
            <div
              className="text-[10px] font-semibold text-accent hidden sm:block"
              style={{ letterSpacing: "0.04em" }}
            >
              View ↗
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Confirmation Toast ────────────────────────────────────────────────────────
const confirmTone = {
  violet: {
    border: "#d8cbe8",
    bgClass:
      "bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(238,232,250,0.96))] dark:bg-surface-strong dark:bg-none",
    shadow: "0 22px 48px rgba(95,76,140,0.16)",
    bar: "linear-gradient(90deg,#b9a4ec,#8b72d1)",
    iconBgClass: "bg-[#f3efff] dark:bg-surface",
    iconBorder: "#d7caef",
    iconClass: "text-[#6d56aa] dark:text-[#9991ca]",
    confirmBg: "linear-gradient(135deg,#d9cdf7,#b49ae8)",
    confirmText: "#433264",
  },
  rose: {
    border: "var(--border)",
    bgClass:
      "bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(250,236,233,0.96))] dark:bg-surface-strong dark:bg-none",
    shadow: "0 22px 48px rgba(168,95,86,0.16)",
    bar: "linear-gradient(90deg,#df9c93,#b86b61)",
    iconBgClass: "bg-[#fff1ee] dark:bg-surface",
    iconBorder: "#ebd0ca",
    iconClass: "text-[#9a544b] dark:text-[#c47a7a]",
    confirmBg: "linear-gradient(135deg,#f3c0b8,#e18f83)",
    confirmText: "#5e2f2a",
  },
  emerald: {
    border: "#c9dbc8",
    bgClass:
      "bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(232,244,233,0.96))] dark:bg-surface-strong dark:bg-none",
    shadow: "0 22px 48px rgba(63,111,83,0.15)",
    bar: "linear-gradient(90deg,#95bf9e,#4f8664)",
    iconBgClass: "bg-[#eef8ef] dark:bg-surface",
    iconBorder: "#cfe4d0",
    iconClass: "text-[#437353] dark:text-[#8ab88a]",
    confirmBg: "linear-gradient(135deg,#bee2c3,#7fbc8b)",
    confirmText: "#244731",
  },
  amber: {
    border: "var(--border)",
    bgClass:
      "bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(252,243,214,0.98))] dark:bg-surface-strong dark:bg-none",
    shadow: "0 22px 48px rgba(183,137,50,0.16)",
    bar: "linear-gradient(90deg,#eed28a,#b78932)",
    iconBgClass: "bg-[#fff8df] dark:bg-surface",
    iconBorder: "#efdeae",
    iconClass: "text-[#936c27] dark:text-[#d99a7a]",
    confirmBg: "linear-gradient(135deg,#f5df9a,#e4be62)",
    confirmText: "#5a451f",
  },
} as const;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDeviceSessionsPanel() {
  const [sessions, setSessions] = useState<DeviceSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] =
    useState<DeviceSessionItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | DeviceSessionItem["status"]
  >("all");
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const payload = await fetchJson(
        `${API_BASE_URL}/admin/dashboard/device-sessions?limit=20`,
      );
      setSessions(mergeSessionsWithExistingUsers(payload.data || [], []));
    } catch (error: any) {
      addToast("error", error.message || "Failed to load device sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const stats = useMemo(
    () => ({
      total: sessions.length,
      active: sessions.filter((s) => s.status === "active").length,
      trusted: sessions.filter((s) => s.isTrusted).length,
      risky: sessions.filter(
        (s) => s.isBlocked || s.deviceType === "bot" || s.status === "blocked",
      ).length,
    }),
    [sessions],
  );

  const filtered = useMemo(
    () =>
      filterStatus === "all"
        ? sessions
        : sessions.filter((s) => s.status === filterStatus),
    [sessions, filterStatus],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / SESSIONS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * SESSIONS_PER_PAGE;
  const paginatedSessions = filtered.slice(
    startIndex,
    startIndex + SESSIONS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Sync selectedSession with updated sessions list (after actions)
  useEffect(() => {
    if (selectedSession) {
      const updated = sessions.find(
        (s) => s.sessionId === selectedSession.sessionId,
      );
      if (updated) setSelectedSession(updated);
    }
  }, [sessions]);

  const executeAction = async (
    session: DeviceSessionItem,
    action: "block" | "mark_safe" | "force_logout" | "trust",
    isTrusted?: boolean,
  ) => {
    const user = getSessionUser(session);
    if (!user.id) {
      addToast("error", "Missing client details");
      return;
    }
    setActionSessionId(session.sessionId);
    try {
      const payload = await fetchJson(
        `${API_BASE_URL}/clients/${user.id}/devices/${session.sessionId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ action, isTrusted }),
        },
      );
      if (Array.isArray(payload?.data)) {
        setSessions((prev) =>
          mergeSessionsWithExistingUsers(payload.data, prev),
        );
      } else {
        await loadSessions();
      }
      addToast("success", "Device session updated");
    } catch (error: any) {
      addToast("error", error.message || "Failed to update");
    } finally {
      setActionSessionId(null);
    }
  };

  const handleAction = (
    session: DeviceSessionItem,
    action: "block" | "mark_safe" | "force_logout" | "trust",
    isTrusted?: boolean,
  ) =>
    setPendingConfirmation(getActionConfirmation(session, action, isTrusted));

  const confirmPendingAction = async () => {
    if (!pendingConfirmation) return;
    const { session, action, isTrusted } = pendingConfirmation;
    setPendingConfirmation(null);
    await executeAction(session, action, isTrusted);
  };

  // ── Loading ──
  if (loading) {
    return (
      <section
        className="rounded-[26px] border p-6"
        style={{
          borderColor: "rgba(200,150,60,0.35)",
          background:
            "linear-gradient(135deg,var(--surface-strong) 0%,var(--surface-strong) 48%,var(--surface) 100%)",
        }}
      >
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl border shadow-md border-[rgba(200,150,60,0.35)] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(248,240,228,0.92))] dark:border-border dark:bg-surface-strong dark:bg-none"
          >
            <Loader2 className="h-7 w-7 animate-spin text-accent" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-heading">
              Loading device sessions
            </p>
            <p className="mt-1 text-sm text-body">
              Fetching the latest security activity.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className="relative overflow-hidden rounded-[26px] border"
        style={{
          borderColor: "rgba(200,150,60,0.35)",
          background:
            "linear-gradient(135deg,var(--surface-strong) 0%,var(--surface-strong) 45%,var(--surface) 100%)",
          boxShadow:
            "0 18px 34px rgba(116,93,56,0.08),0 30px 70px rgba(116,93,56,0.07)",
        }}
      >
        {/* top bar accent */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1"
          style={{
            background: "linear-gradient(90deg,var(--accent-color),var(--surface),var(--accent-color))",
          }}
        />

        {/* ── Header ── */}
        <div
          className="border-b px-5 py-5 sm:px-6"
          style={{ borderColor: "rgba(200,150,60,0.22)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-body"
                style={{
                  borderColor: "rgba(200,150,60,0.35)",
                  background: "var(--surface-strong)",
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Device Watchtower
              </div>
              <h2 className="mt-2.5 text-2xl font-black leading-tight tracking-tight text-heading sm:text-3xl">
                Session <span style={{ color: "var(--accent-color)" }}>Security</span>{" "}
                Ledger
              </h2>
              <p className="mt-1 text-sm text-body max-w-lg">
                Monitor, trust, block, and terminate client device sessions from
                a single live view.
              </p>
            </div>

            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-[#3f6f53] dark:text-[#91caa9]"
              style={{
                background: "rgba(79,134,100,0.08)",
                borderColor: "rgba(79,134,100,0.25)",
              }}
            >
              <span className="h-2 w-2 rounded-full bg-[#4f8664] animate-pulse" />
              Live monitoring
            </div>
          </div>

          {/* stat pills */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill
              icon={Activity}
              label="Total"
              value={stats.total}
              color="var(--accent-color)"
            />
            <StatPill
              icon={ShieldCheck}
              label="Active now"
              value={stats.active}
              color="#4f8664"
            />
            <StatPill
              icon={Lock}
              label="Trusted"
              value={stats.trusted}
              color="#595281"
            />
            <StatPill
              icon={AlertTriangle}
              label="Risk queue"
              value={stats.risky}
              color="#a85f56"
            />
          </div>
        </div>

        {/* ── Filter + pagination bar ── */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-6 bg-[rgba(255,250,235,0.6)] dark:bg-surface-strong"
          style={{
            borderColor: "rgba(200,150,60,0.18)",
          }}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <Filter className="h-3.5 w-3.5 shrink-0 text-body" />
            {(
              ["all", "active", "blocked", "logged_out", "expired"] as const
            ).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilterStatus(f);
                  setCurrentPage(1);
                }}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={
                  filterStatus === f
                    ? {
                        background: "linear-gradient(135deg,var(--surface-strong),var(--accent-color))",
                        color: "var(--heading)",
                      }
                    : {
                        background: "var(--surface)",
                        color: "var(--body)",
                        border: "1px solid rgba(200,150,60,0.2)",
                      }
                }
              >
                {f === "all" ? "All" : f.replace("_", " ")}
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border text-body transition hover:bg-surface-strong disabled:opacity-35 disabled:cursor-default"
                style={{
                  borderColor: "rgba(200,150,60,0.3)",
                  background: "var(--surface)",
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-medium text-body px-1">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg border text-body transition hover:bg-surface-strong disabled:opacity-35 disabled:cursor-default"
                style={{
                  borderColor: "rgba(200,150,60,0.3)",
                  background: "var(--surface)",
                }}
                aria-label="Next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Session List ── */}
        <div className="p-4 sm:p-5">
          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border py-12 text-center"
              style={{
                borderColor: "rgba(200,150,60,0.22)",
                background: "var(--surface)",
              }}
            >
              <ShieldCheck className="h-8 w-8 text-accent opacity-40" />
              <p className="text-base font-semibold text-heading">
                No sessions found
              </p>
              <p className="text-sm text-body max-w-xs">
                {filterStatus !== "all"
                  ? `No sessions match the "${filterStatus}" filter.`
                  : "Devices will appear here as clients sign in."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {paginatedSessions.map((session, i) => (
                <SessionRow
                  key={session.sessionId}
                  session={session}
                  rank={startIndex + i + 1}
                  busy={actionSessionId === session.sessionId}
                  onOpen={() => setSelectedSession(session)}
                />
              ))}
            </div>
          )}

          {/* footer showing count */}
          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-xs text-body">
              <span>
                Showing{" "}
                <strong className="text-heading">
                  {startIndex + 1}–
                  {Math.min(startIndex + SESSIONS_PER_PAGE, filtered.length)}
                </strong>{" "}
                of <strong className="text-heading">{filtered.length}</strong>{" "}
                sessions
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= safePage - 1 && page <= safePage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-7 rounded-lg px-2 py-1.5 text-xs font-semibold transition"
                            style={
                              safePage === page
                                ? {
                                    background:
                                      "linear-gradient(135deg,var(--surface-strong),var(--accent-color))",
                                    color: "var(--heading)",
                                  }
                                : {
                                    border: "1px solid rgba(200,150,60,0.25)",
                                    background: "var(--surface)",
                                    color: "var(--body)",
                                  }
                            }
                          >
                            {page}
                          </button>
                        );
                      }
                      if (page === safePage - 2 || page === safePage + 2) {
                        return (
                          <span key={page} className="px-1 text-body">
                            …
                          </span>
                        );
                      }
                      return null;
                    },
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Session Detail Popup ── */}
      {selectedSession && (
        <SessionDetailPopup
          session={selectedSession}
          busy={actionSessionId === selectedSession.sessionId}
          onClose={() => setSelectedSession(null)}
          onAction={(action, trusted) => {
            handleAction(selectedSession, action, trusted);
          }}
        />
      )}

      {/* ── Confirmation portal ── */}
      {pendingConfirmation &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-4 z-[140] flex justify-center px-4 sm:top-5">
            <div
              className={`pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-2xl border backdrop-blur-xl dark:border-border ${confirmTone[pendingConfirmation.tone].bgClass}`}
              style={{
                borderColor: confirmTone[pendingConfirmation.tone].border,
                boxShadow: confirmTone[pendingConfirmation.tone].shadow,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                style={{
                  background: confirmTone[pendingConfirmation.tone].bar,
                }}
              />
              <div className="flex gap-3 px-4 py-4 sm:px-5">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border dark:border-border ${confirmTone[pendingConfirmation.tone].iconBgClass}`}
                  style={{
                    borderColor:
                      confirmTone[pendingConfirmation.tone].iconBorder,
                  }}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${confirmTone[pendingConfirmation.tone].iconClass}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-body">
                    Confirm Security Action
                  </p>
                  <p className="mt-1 text-sm font-semibold text-heading">
                    {pendingConfirmation.title}
                  </p>
                  <p className="mt-1 text-sm text-heading">
                    {pendingConfirmation.message}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void confirmPendingAction()}
                      className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:brightness-105"
                      style={{
                        background:
                          confirmTone[pendingConfirmation.tone].confirmBg,
                        color:
                          confirmTone[pendingConfirmation.tone].confirmText,
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingConfirmation(null)}
                      className="rounded-xl border px-4 py-2 text-sm font-semibold text-body transition hover:bg-surface-strong"
                      style={{
                        borderColor: "rgba(200,150,60,0.3)",
                        background: "var(--surface-strong)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingConfirmation(null)}
                  className="h-fit rounded-xl border p-1.5 text-body transition hover:bg-surface-strong"
                  style={{
                    borderColor: "rgba(200,150,60,0.3)",
                    background: "var(--surface-strong)",
                  }}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
