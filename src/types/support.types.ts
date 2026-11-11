export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email?: string;
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
  sender?: User;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  category: string;
  createdBy?: User;
  assignedTo?: User;
  updatedAt: string;
  createdAt: string;
  description: string;
  messages: Message[];
}

export interface Agent extends User {
  ticketCount?: number;
}

export interface Client extends User {}

export interface CreateTicketForm {
  clientId: string;
  subject: string;
  category: string;
  description: string;
  assignedTo: string;
}

export interface AddAgentForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  dateofbirth: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
