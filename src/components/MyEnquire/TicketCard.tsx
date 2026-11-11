import type { Ticket } from "@/types/ticket.types";
import { getPriorityColor, getStatusColor } from "@/utils/ticket.utils";

interface TicketCardProps {
  ticket: Ticket;
  isActive: boolean;
  onClick: () => void;
}

export const TicketCard = ({ ticket, isActive, onClick }: TicketCardProps) => {
  return (
    <div
      onClick={onClick}
      data-voice-target={`ticket ${ticket.ticketNumber}`}
      data-voice-value={`${ticket.ticketNumber} ${ticket.subject} ${ticket.category} ${ticket.priority} ${ticket.status}`}
      data-voice-scope={`ticket ${ticket.ticketNumber}`}
      className={`relative cursor-pointer overflow-hidden rounded-lg border p-3.5 transition-colors ${
        isActive
          ? "border-accent/30 bg-accent/[0.08]"
          : "border-border bg-surface-strong/[0.03] hover:bg-surface-strong/[0.06]"
      }`}
    >
      {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-accent" />}

      <div
        className={`flex items-start justify-between gap-3 ${isActive ? "pl-2" : ""}`}
      >
        <h3 className="line-clamp-1 text-sm font-semibold text-heading">
          {ticket.subject}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusColor(
            ticket.status,
          )}`}
        >
          {ticket.status}
        </span>
      </div>

      <p
        className={`mt-1.5 text-xs font-medium uppercase tracking-[0.12em] text-subtle ${isActive ? "pl-2" : ""}`}
      >
        {ticket.ticketNumber}
      </p>

      <div className={`mt-2.5 flex flex-wrap items-center gap-2 ${isActive ? "pl-2" : ""}`}>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getPriorityColor(
            ticket.priority,
          )}`}
        >
          {ticket.priority}
        </span>
        <span className="rounded-full border border-border bg-surface-strong/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-subtle">
          {ticket.category}
        </span>
      </div>
    </div>
  );
};
