import { create } from "zustand";
import type { Ticket, TicketStatus, Message } from "@/types/ticket.types";

interface TicketStore {
  // State
  tickets: Ticket[];
  activeTicket: Ticket | null;
  connectionStatus: "connecting" | "connected" | "error" | "disconnected";
  agentOnline: boolean;
  isSendingMessage: boolean;

  // Actions
  setTickets: (tickets: Ticket[]) => void;
  setActiveTicket: (ticket: Ticket | null) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  addMessage: (
    ticketId: string,
    message: Message,
    newStatus?: TicketStatus,
  ) => void;
  setConnectionStatus: (status: TicketStore["connectionStatus"]) => void;
  setAgentOnline: (online: boolean) => void;
  setIsSendingMessage: (isSending: boolean) => void;
  clearStore: () => void;
}

export const useTicketStore = create<TicketStore>()((set) => ({
  // Initial state
  tickets: [],
  activeTicket: null,
  connectionStatus: "disconnected",
  agentOnline: false,
  isSendingMessage: false,

  // Actions
  setTickets: (tickets) =>
    set((state) => {
      if (!state.activeTicket) {
        return { tickets };
      }

      const matchingTicket = tickets.find(
        (ticket) => ticket._id === state.activeTicket?._id,
      );

      if (!matchingTicket) {
        return { tickets };
      }

      return {
        tickets,
        activeTicket: {
          ...matchingTicket,
          messages:
            (state.activeTicket.messages?.length ?? 0) > 0
              ? state.activeTicket.messages
              : matchingTicket.messages,
        },
      };
    }),

  setActiveTicket: (ticket) => set({ activeTicket: ticket }),

  updateTicket: (ticketId, updates) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, ...updates } : ticket,
      ),
      activeTicket:
        state.activeTicket?._id === ticketId
          ? { ...state.activeTicket, ...updates }
          : state.activeTicket,
    })),

  addMessage: (ticketId, message, newStatus) =>
    set((state) => {
      const appendMessage = (messages: Message[] = []) =>
        messages.some((existing) => existing._id === message._id)
          ? messages
          : [...messages, message];

      const nextUpdatedAt = new Date().toISOString();
      const nextTickets = state.tickets.map((ticket) =>
        ticket._id === ticketId
          ? {
              ...ticket,
              messages: appendMessage(ticket.messages || []),
              updatedAt: nextUpdatedAt,
              ...(newStatus && { status: newStatus }),
            }
          : ticket,
      );

      // Update messages in active ticket
      if (state.activeTicket?._id === ticketId) {
        const updatedTicket = {
          ...state.activeTicket,
          messages: appendMessage(state.activeTicket.messages || []),
          updatedAt: nextUpdatedAt,
          ...(newStatus && { status: newStatus }),
        };

        return {
          activeTicket: updatedTicket,
          tickets: nextTickets,
        };
      }

      // Just update the ticket in the list
      return {
        tickets: nextTickets,
      };
    }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setAgentOnline: (online) => set({ agentOnline: online }),

  setIsSendingMessage: (isSending) => set({ isSendingMessage: isSending }),

  clearStore: () =>
    set({
      tickets: [],
      activeTicket: null,
      connectionStatus: "disconnected",
      agentOnline: false,
      isSendingMessage: false,
    }),
}));
