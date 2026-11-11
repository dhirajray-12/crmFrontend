import { Loader, MessageCircle } from "lucide-react";
import { useTicketStore } from "@/Store/ticket.store";
import type { Ticket } from "@/types/ticket.types";
import { TicketCard } from "@/components/MyEnquire/TicketCard";

interface TicketListProps {
  onTicketSelect: (ticket: Ticket) => void;
  isLoading: boolean;
}

export const TicketList = ({ onTicketSelect, isLoading }: TicketListProps) => {
  const { tickets, activeTicket } = useTicketStore();

  return (
    <div
      className="rounded-xl border border-border bg-surface p-4 sm:p-5"
      data-voice-scope="ticket list"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg border border-accent/20 bg-accent/10 p-2">
          <MessageCircle className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-heading">Your Tickets</h2>
          <p className="text-xs uppercase tracking-[0.14em] text-subtle">
            {tickets.length} active conversations
          </p>
        </div>
      </div>

      {isLoading && tickets.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-subtle" size={28} />
        </div>
      ) : tickets.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">
          No tickets yet. Create one to get started.
        </p>
      ) : (
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1 lg:max-h-[600px]">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              isActive={activeTicket?._id === ticket._id}
              onClick={() => onTicketSelect(ticket)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
