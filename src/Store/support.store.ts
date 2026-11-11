import { create } from "zustand";
import type { Ticket, Agent, Client, Message } from "@/types/support.types";

const areEntityArraysEqual = (
  current: Array<{ _id?: string; email?: string }> = [],
  next: Array<{ _id?: string; email?: string }> = [],
) => {
  if (current === next) return true;
  if (current.length !== next.length) return false;

  return current.every((item, index) => {
    const nextItem = next[index];

    return (
      item?._id === nextItem?._id &&
      item?.email === nextItem?.email
    );
  });
};

const areTicketsEqual = (current: Ticket[] = [], next: Ticket[] = []) => {
  if (current === next) return true;
  if (current.length !== next.length) return false;

  return current.every((ticket, index) => {
    const nextTicket = next[index];

    return (
      ticket?._id === nextTicket?._id &&
      ticket?.status === nextTicket?.status &&
      ticket?.updatedAt === nextTicket?.updatedAt &&
      ticket?.assignedTo?._id === nextTicket?.assignedTo?._id &&
      ticket?.messages?.length === nextTicket?.messages?.length
    );
  });
};

interface SupportStore {
  // View states
  activeTab: "tickets" | "agents";
  selectedTicket: Ticket | null;
  showCreateTicket: boolean;
  showAddAgent: boolean;

  // Data states
  tickets: Ticket[];
  agents: Agent[];
  clients: Client[];

  // Filter states
  searchTerm: string;
  filterStatus: string;

  // UI states
  loading: boolean;

  // Socket state
  socket: any | null;

  // Actions
  setActiveTab: (tab: "tickets" | "agents") => void;
  setSelectedTicket: (ticket: Ticket | null) => void;
  setShowCreateTicket: (show: boolean) => void;
  setShowAddAgent: (show: boolean) => void;
  setTickets: (tickets: Ticket[]) => void;
  setAgents: (agents: Agent[]) => void;
  setClients: (clients: Client[]) => void;
  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: string) => void;
  setLoading: (loading: boolean) => void;
  setSocket: (socket: any | null) => void;

  // Message actions
  addMessageToTicket: (
    ticketId: string,
    message: Message,
    status?: string,
  ) => void;

  // Reset actions
  resetFilters: () => void;
}

export const useSupportStore = create<SupportStore>((set) => ({
  // Initial states
  activeTab: "tickets",
  selectedTicket: null,
  showCreateTicket: false,
  showAddAgent: false,
  tickets: [],
  agents: [],
  clients: [],
  searchTerm: "",
  filterStatus: "all",
  loading: false,
  socket: null,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedTicket: (ticket) =>
    set((state) => {
      if (!ticket || state.selectedTicket?._id !== ticket._id) {
        return { selectedTicket: ticket };
      }

      return {
        selectedTicket: {
          ...ticket,
          messages:
            (state.selectedTicket.messages?.length ?? 0) >
            (ticket.messages?.length ?? 0)
              ? state.selectedTicket.messages
              : ticket.messages,
        },
      };
    }),
  setShowCreateTicket: (show) => set({ showCreateTicket: show }),
  setShowAddAgent: (show) => set({ showAddAgent: show }),
  setTickets: (tickets) =>
    set((state) => {
      if (areTicketsEqual(state.tickets, tickets)) {
        return state;
      }

      if (!state.selectedTicket) {
        return { tickets };
      }

      const matchingTicket = tickets.find(
        (ticket) => ticket._id === state.selectedTicket?._id,
      );

      return {
        tickets,
        selectedTicket: matchingTicket
          ? {
              ...matchingTicket,
              messages:
                (state.selectedTicket.messages?.length ?? 0) >
                (matchingTicket.messages?.length ?? 0)
                  ? state.selectedTicket.messages
                  : matchingTicket.messages,
            }
          : state.selectedTicket,
      };
    }),
  setAgents: (agents) =>
    set((state) =>
      areEntityArraysEqual(state.agents, agents) ? state : { agents },
    ),
  setClients: (clients) =>
    set((state) =>
      areEntityArraysEqual(state.clients, clients) ? state : { clients },
    ),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setLoading: (loading) => set({ loading }),
  setSocket: (socket) =>
    set((state) => (state.socket === socket ? state : { socket })),

  addMessageToTicket: (ticketId, message, status) =>
    set((state) => {
      const normalizedMessage = {
        ...message,
        sender: message?.sender
          ? {
              ...message.sender,
              ...(message.sender as { firstName?: string; lastName?: string }),
              firstname:
                message.sender.firstname ||
                (message.sender as { firstName?: string }).firstName ||
                "",
              lastname:
                message.sender.lastname ||
                (message.sender as { lastName?: string }).lastName ||
                "",
            }
          : undefined,
        createdAt: message?.createdAt
          ? new Date(message.createdAt).toISOString()
          : new Date().toISOString(),
      };

      const appendMessage = (messages: Message[] = []) =>
        messages.some((existing) => existing._id === normalizedMessage._id)
          ? messages
          : [...messages, normalizedMessage];
      const updatedAt = new Date().toISOString();

      return {
        tickets: state.tickets
          .map((ticket) =>
          ticket._id === ticketId
            ? {
                ...ticket,
                messages: appendMessage(ticket.messages),
                updatedAt,
                ...(status ? { status } : {}),
              }
            : ticket,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        selectedTicket:
          state.selectedTicket?._id === ticketId
            ? {
                ...state.selectedTicket,
                messages: appendMessage(state.selectedTicket.messages),
                updatedAt,
                ...(status ? { status } : {}),
              }
            : state.selectedTicket,
      };
    }),

  resetFilters: () => set({ searchTerm: "", filterStatus: "all" }),
}));
