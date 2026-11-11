import type { Ticket, Message, NewTicketForm, ApiResponse } from "@/types/ticket.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => {
  const activeRole = sessionStorage.getItem("active_role");

  return activeRole ? { "x-active-role": activeRole } : undefined;
};

const normalizeUser = (user: any) => {
  if (!user) return user;

  return {
    ...user,
    firstname: user.firstname || user.firstName || "",
    lastname: user.lastname || user.lastName || "",
  };
};

const normalizeMessage = (message: any): Message => ({
  ...message,
  sender: normalizeUser(message?.sender),
  attachments: Array.isArray(message?.attachments) ? message.attachments : [],
  createdAt: message?.createdAt
    ? new Date(message.createdAt).toISOString()
    : new Date().toISOString(),
});

const normalizeTicket = (ticket: any): Ticket => ({
  ...ticket,
  createdBy: normalizeUser(ticket?.createdBy),
  assignedTo: normalizeUser(ticket?.assignedTo),
  messages: Array.isArray(ticket?.messages)
    ? ticket.messages.map(normalizeMessage)
    : [],
});

class TicketService {

  

  async fetchTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      headers: getHeaders(),
      credentials: "include",
    });

    const data: ApiResponse<Ticket[]> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load tickets");
    }

    return Array.isArray(data.data) ? data.data.map(normalizeTicket) : [];
  }

  async fetchTicketDetails( ticketId: string): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      headers: getHeaders(),
      credentials: "include",
    });

    const data: ApiResponse<Ticket> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load ticket details");
    }

    return normalizeTicket(data.data);
  }

  async createTicket( ticketData: NewTicketForm): Promise<Ticket> {
    const formData = new FormData();
    formData.append("subject", ticketData.subject);
    formData.append("category", ticketData.category);
    formData.append("priority", ticketData.priority);
    formData.append("description", ticketData.description);

    if (ticketData.attachment) {
      formData.append("attachment", ticketData.attachment);
    }

    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: formData,
    });

    const data: ApiResponse<Ticket> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to create ticket");
    }

    return normalizeTicket(data.data);
  }

  async sendMessage(
    ticketId: string,
    content: string,
    attachment?: File | null,
  ): Promise<Message> {
    const formData = new FormData();
    formData.append("content", content);

    if (attachment) {
      formData.append("attachment", attachment);
    }

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: formData,
    });

    const data: ApiResponse<Message> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to send message");
    }

    return normalizeMessage(data.data);
  }
}

export const ticketService = new TicketService();
