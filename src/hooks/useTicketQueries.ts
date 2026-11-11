import { ticketService } from "@/services/ticket.service";
import { useTicketStore } from "@/Store/ticket.store";
import type { NewTicketForm } from "@/types/ticket.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Query keys
export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  details: () => [...ticketKeys.all, "detail"] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
};

export const useTicketsQuery = () => {
  const setTickets = useTicketStore((state) => state.setTickets);

const query = useQuery({
  queryKey: ticketKeys.lists(),
  queryFn: () => ticketService.fetchTickets(),
  enabled: true,
});

 useEffect(() => {
  if (query.data) {
    setTickets(query.data);
  }
}, [query.data, setTickets]);

return query;
};

export const useTicketDetailQuery = (ticketId: string | null) => {
  const setActiveTicket = useTicketStore((state) => state.setActiveTicket);

  const query = useQuery({
  queryKey: ticketKeys.detail(ticketId!),
  queryFn: () => ticketService.fetchTicketDetails(ticketId!),
  enabled:  !!ticketId,
});

useEffect(() => {
  if (query.data) {
    setActiveTicket(query.data);
  }
}, [query.data, setActiveTicket]);

return query;
};

export const useCreateTicketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketData: NewTicketForm) =>
      ticketService.createTicket(ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
};

export const useSendMessageMutation = () => {
  const addMessage = useTicketStore((state) => state.addMessage);
  const setIsSendingMessage = useTicketStore((state) => state.setIsSendingMessage);

  return useMutation({
    mutationFn: ({
      ticketId,
      content,
      attachment,
    }: {
      ticketId: string;
      content: string;
      attachment?: File | null;
    }) => ticketService.sendMessage(ticketId, content, attachment),
    onMutate: () => {
      setIsSendingMessage(true);
    },
    onSuccess: (data, variables) => {
      // Add the message to the store
      addMessage(variables.ticketId, data);
    },
    onSettled: () => {
      setIsSendingMessage(false);
    },
  });
};
