import SupportService from "@/services/support.service";
import type { AddAgentForm, CreateTicketForm } from "@/types/support.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const updateTicketInCollection = (
  tickets: any[] | undefined,
  nextTicket: any,
) => {
  if (!Array.isArray(tickets)) {
    return tickets;
  }

  const exists = tickets.some((ticket) => ticket._id === nextTicket._id);
  const nextTickets = exists
    ? tickets.map((ticket) =>
        ticket._id === nextTicket._id ? { ...ticket, ...nextTicket } : ticket,
      )
    : [nextTicket, ...tickets];

  return nextTickets.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
};

export const useTickets = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const service = new SupportService();
      return service.getTickets();
    },
    enabled: true,
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const service = new SupportService();
      return service.getTicket(id);
    },
    enabled: !!id,
  });
};

export const useClients = (enabled = true) => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const service = new SupportService();
      const clients = await service.getClients();
      return {
        all: clients,
        agents: clients.filter((c) => c.role === "admin" || c.role === "agent"),
        clients: clients.filter((c) => c.role === "client"),
      };
    },
    enabled,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateTicketForm) => {
      const service = new SupportService();
      return service.createTicket(formData);
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(["tickets"], (current: any[] | undefined) =>
        updateTicketInCollection(current, ticket),
      );
      queryClient.setQueryData(["ticket", ticket._id], ticket);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      updates,
    }: {
      ticketId: string;
      updates: any;
    }) => {
      const service = new SupportService();
      return service.updateTicket(ticketId, updates);
    },
    onSuccess: (ticket, variables) => {
      queryClient.setQueryData(["ticket", variables.ticketId], ticket);
      queryClient.setQueryData(["tickets"], (current: any[] | undefined) =>
        updateTicketInCollection(current, ticket),
      );
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      content,
      attachment,
    }: {
      ticketId: string;
      content: string;
      attachment?: File | null;
    }) => {
      const service = new SupportService();
      return service.sendMessage(ticketId, content, attachment);
    },
    onSuccess: (message, variables) => {
      queryClient.setQueryData(["ticket", variables.ticketId], (current: any) => {
        if (!current) {
          return current;
        }

        const messages = Array.isArray(current.messages) ? current.messages : [];
        const exists = messages.some((item: any) => item._id === message._id);

        return {
          ...current,
          messages: exists ? messages : [...messages, message],
          updatedAt: message.createdAt || new Date().toISOString(),
        };
      });
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });
};

export const useRegisterAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AddAgentForm) => {
      const service = new SupportService();
      return service.registerAgent(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string) => {
      const service = new SupportService();
      return service.deleteAgent(agentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
