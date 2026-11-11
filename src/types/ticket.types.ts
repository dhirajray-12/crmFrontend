export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role?: string;
}

export interface Attachment {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
}

export interface Message {
  _id: string;
  ticketId: string;
  sender: User;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
}

export type TicketStatus = "new" | "open" | "closed" | "inProgress" | "resolved";
export type TicketPriority = "low" | "medium" | "high";
export type TicketCategory = "Technical Issue" | "Account" | "Billing" | "Other";

export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdBy: User;
  messages?: Message[];
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
}

export interface NewTicketForm {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  attachment: File | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
