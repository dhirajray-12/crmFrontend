import {
  useTicketDetailQuery,
  useTicketsQuery,
} from "@/hooks/useTicketQueries";
import { useTicketSocket } from "@/hooks/useTicketSocket";
import { useAuthStore } from "@/Store/auth.store";
import { useTicketStore } from "@/Store/ticket.store";
import type { Ticket } from "@/types/ticket.types";
import { useEffect, useState } from "react";

// Import components
import { ChatWindow } from "@/components/MyEnquire/ChatWindow";
import { ConnectionStatus } from "@/components/MyEnquire/ConnectionStatus";
import { EmptyState } from "@/components/MyEnquire/EmptyState";
import { NewTicketForm } from "@/components/MyEnquire/NewTicketForm";
import { NotificationToast } from "@/components/MyEnquire/NotificationToast";
import { TicketList } from "@/components/MyEnquire/TicketList";
import { Headphones, Plus, Radio, ShieldCheck } from "lucide-react";

const MyEnquiryPage = () => {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Get user from auth store
  const { user } = useAuthStore();
  const { activeTicket, setActiveTicket, connectionStatus } = useTicketStore();

  // Initialize socket connection - will automatically get userId from auth store
  const { socketError, agentOnline } = useTicketSocket({
    subscribeToMessages: false,
    manageActiveTicketRoom: false,
  });

  // Fetch tickets
  const {
    isLoading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets,
  } = useTicketsQuery();

  // Fetch ticket details when active ticket changes
  useTicketDetailQuery(activeTicket?._id || null);

  // Handle notifications
  useEffect(() => {
    if (ticketsError) {
      setNotification({ type: "error", message: ticketsError.message });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [ticketsError]);

  useEffect(() => {
    if (socketError) {
      setNotification({ type: "error", message: socketError });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [socketError]);

  const handleTicketSelect = (ticket: Ticket) => {
    if (activeTicket?._id === ticket._id) {
      setActiveTicket(null);
      return;
    }

    setActiveTicket(ticket);
    setShowNewTicket(false);
  };

  const handleTicketCreated = () => {
    setShowNewTicket(false);
    setNotification({
      type: "success",
      message: "Ticket created successfully!",
    });
    refetchTickets();
    setTimeout(() => setNotification(null), 3000);
  };

  const showDetailPane = showNewTicket || Boolean(activeTicket);

  // Don't render if user is not authenticated
  if (!user) {
    return (
      <div className="client-theme-bg flex min-h-screen items-center justify-center px-4">
        <p className="text-heading">Please log in to view your tickets.</p>
      </div>
    );
  }

  return (
    <div className="client-theme-bg min-h-screen">
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="mx-auto max-w-7xl px-3 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6">
        <ConnectionStatus status={connectionStatus} agentOnline={agentOnline} />

        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-accent" />

          <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-end sm:justify-between">
            <HeaderContent isConnected={connectionStatus === "connected"} />
            <NewTicketButton onClick={() => setShowNewTicket(!showNewTicket)} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 pl-2 sm:grid-cols-3 sm:pl-0">
            <InfoTile
              icon={<Headphones className="h-4 w-4 text-accent" />}
              label="Support Desk"
              value="Live assistance channel"
              accentColor="bg-accent"
            />
            <InfoTile
              icon={<ShieldCheck className="h-4 w-4 text-accent" />}
              label="Session"
              value={agentOnline ? "Agent available" : "Queue monitoring active"}
              accentColor="bg-accent"
            />
            <InfoTile
              icon={<Radio className="h-4 w-4 text-amber-700 dark:text-amber-300" />}
              label="Status"
              value={
                connectionStatus === "connected"
                  ? "Realtime connected"
                  : "Fallback delivery ready"
              }
              accentColor="bg-amber-400"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 lg:grid-cols-3">
          <div className={showDetailPane ? "hidden lg:block" : ""}>
            <TicketList
              onTicketSelect={handleTicketSelect}
              isLoading={ticketsLoading}
            />
          </div>

          <div
            className={`${showDetailPane ? "" : "hidden lg:flex"} lg:col-span-2`}
          >
            {showNewTicket ? (
              <NewTicketForm
                onCancel={() => setShowNewTicket(false)}
                onSuccess={handleTicketCreated}
              />
            ) : activeTicket ? (
              <ChatWindow ticket={activeTicket} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
};

// Sub-components for better organization
const HeaderContent = ({ isConnected }: { isConnected: boolean }) => (
  <div className="min-w-0">
    <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
      <Radio className="h-3.5 w-3.5" />
      Client Support Desk
    </div>
    <h1 className="mt-3 text-xl font-bold text-heading sm:text-2xl">
      My Enquiries
    </h1>
    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-subtle">
      Track open tickets, start new conversations, and stay in sync with
      support.
      {isConnected && (
        <span className="flex items-center gap-1 text-accent">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          Live
        </span>
      )}
    </p>
  </div>
);

const NewTicketButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    data-voice-target="new ticket"
    className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 hover:text-heading sm:self-start"
  >
    <Plus size={18} />
    New Ticket
  </button>
);

interface InfoTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor: string;
}

const InfoTile = ({ icon, label, value, accentColor }: InfoTileProps) => (
  <div className="relative overflow-hidden rounded-lg border border-border bg-surface-strong/[0.03] p-3.5">
    <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} />
    <div className="flex items-center gap-2 pl-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
      {icon}
      {label}
    </div>
    <p className="mt-1.5 truncate pl-2 text-sm font-semibold text-heading">
      {value}
    </p>
  </div>
);

const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export default MyEnquiryPage;
