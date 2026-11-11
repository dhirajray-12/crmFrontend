import type { TicketStatus, TicketPriority } from "@/types/ticket.types";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const getPriorityColor = (priority: TicketPriority): string => {
  switch (priority) {
    case "high":
      return "bg-rose-500/10 border-rose-400/20 text-rose-300";
    case "medium":
      return "bg-amber-500/10 border-amber-400/20 text-amber-300";
    case "low":
      return "bg-emerald-500/10 border-emerald-400/20 text-emerald-300";
    default:
      return "bg-white/[0.04] border-white/10 text-slate-300";
  }
};

export const getStatusColor = (status: TicketStatus): string => {
  const statusMap: Record<TicketStatus, string> = {
    new: "bg-violet-500/10 border-violet-400/20 text-violet-300",
    open: "bg-sky-500/10 border-sky-400/20 text-sky-300",
    closed: "bg-slate-500/10 border-slate-400/20 text-slate-400",
    inProgress: "bg-amber-500/10 border-amber-400/20 text-amber-300",
    resolved: "bg-emerald-500/10 border-emerald-400/20 text-emerald-300",
  };
  return statusMap[status] || statusMap.open;
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString(undefined, { timeZone: getConfiguredTimezone() });
};