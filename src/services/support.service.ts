import type {
  Ticket,
  Agent,
  Client,
  ApiResponse,
  CreateTicketForm,
  AddAgentForm,
  Message,
} from "@/types/support.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

class SupportService {
  async getTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch tickets");
    const data: ApiResponse<Ticket[]> = await response.json();
    return Array.isArray(data.data) ? data.data.map(normalizeTicket) : [];
  }

  async getTicket(id: string): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch ticket");
    const data: ApiResponse<Ticket> = await response.json();
    return normalizeTicket(data.data);
  }

  async getClients(): Promise<Client[]> {
    const response = await fetch(`${API_BASE_URL}/admin/clients`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch clients");
    const data: ApiResponse<Client[]> = await response.json();
    return data.data || [];
  }

  async createTicket(formData: CreateTicketForm): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
      body: JSON.stringify({
        clientId: formData.clientId || undefined,
        subject: formData.subject,
        category: formData.category,
        description: formData.description,
      }),
    });
    if (!response.ok) throw new Error("Failed to create ticket");
    const data: ApiResponse<Ticket> = await response.json();
    return normalizeTicket(data.data);
  }

  async updateTicket(
    ticketId: string,
    updates: Partial<Ticket>,
  ): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: "PUT",
      
      credentials: "include",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update ticket");
    const data: ApiResponse<Ticket> = await response.json();
    return normalizeTicket(data.data);
  }

  async assignTicket(
    ticketId: string,
    agentId: string | null,
  ): Promise<Ticket> {
    return this.updateTicket(ticketId, {
      assignedTo: agentId ? ({ _id: agentId } as any) : undefined,
    });
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

    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/messages`,
      {
        method: "POST",
        credentials: "include",
        headers:{
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        body: formData,
      },
    );
    if (!response.ok) throw new Error("Failed to send message");
    const data: ApiResponse<Message> = await response.json();
    return normalizeMessage(data.data);
  }

  async registerAgent(formData: AddAgentForm): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/auth/agent/signup`, {
      method: "POST",
      credentials: "include",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      body: JSON.stringify({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        dateofbirth: formData.dateofbirth,
      }),
    });
    if (!response.ok) throw new Error("Failed to register agent");
    const data: ApiResponse<Agent> = await response.json();
    return data.data;
  }

  async deleteAgent(agentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/clients/${agentId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-active-role": sessionStorage.getItem("active_role") || "",
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || "Failed to delete agent");
    }
  }
}

export default SupportService;
