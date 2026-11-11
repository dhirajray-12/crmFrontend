import type { Agent, Ticket } from "@/types/support.types";
import {
  formatAttachmentSize,
  getAttachmentUrl,
  isImageAttachment,
  supportAttachmentConfig,
  validateSupportAttachment,
} from "@/utils/supportAttachments";
import {
  ArrowLeft,
  Clock3,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

interface TicketDetailViewProps {
  ticket: Ticket;
  agents: Agent[];
  socket: any | null;
  onBack: () => void;
  onSendMessage: (
    ticketId: string,
    content: string,
    attachment?: File | null,
  ) => Promise<void>;
  onUpdateTicket: (ticketId: string, updates: any) => Promise<void>;
}

interface AdminMessageBubbleProps {
  message: Ticket["messages"][number];
  formatDate: (dateString: string) => string;
}

const statusStyles: Record<string, string> = {
  new: "border-[#e7d2f3] bg-[#f7ecff] text-[#7c4c9f]",
  open: "border-[#cfe1c7] bg-[#edf8e7] text-[#567d34]",
  inProgress: "border-border bg-surface-strong text-body",
  resolved: "border-[#c9ddd4] bg-[#ebf7f1] text-[#2c7a5e]",
  closed: "border-border bg-surface-strong text-body",
};

const panelClassName =
  "rounded-[28px] border border-border bg-surface-strong shadow-[0_18px_34px_rgba(116,93,56,0.08)]";

const inputClassName =
  "w-full rounded-2xl border border-border bg-surface-strong/85 px-4 py-3 text-sm text-heading outline-none transition focus:border-accent focus:bg-surface-strong";

const getStatusLabel = (status: string) =>
  status === "inProgress"
    ? "In Progress"
    : status.charAt(0).toUpperCase() + status.slice(1);

const AdminMessageBubble = memo(
  ({ message, formatDate }: AdminMessageBubbleProps) => {
    if (!message.sender) {
      return (
        <div className="flex justify-center">
          <div className="max-w-md rounded-2xl border border-border bg-surface-strong p-4 text-center shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-body">
              System Message
            </p>
            <p className="text-sm text-body">{message.content}</p>
            <p className="mt-2 text-xs text-subtle">
              {formatDate(message.createdAt)}
            </p>
          </div>
        </div>
      );
    }

    const isAgent =
      message.sender.role === "admin" ||
      message.sender.role === "agent" ||
      message.sender.role === "superadmin";

    return (
      <div className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-2xl rounded-[24px] p-4 shadow-sm ${
            isAgent
              ? "border border-border bg-linear-to-br from-accent to-accent-hover text-heading"
              : "border border-border bg-surface-strong text-heading"
          }`}
        >
          <p
            className={`mb-1 text-xs font-medium ${
              isAgent ? "text-heading" : "text-subtle"
            }`}
          >
            {message.sender.firstname} {message.sender.lastname}
          </p>

          {message.content ? <p className="text-sm leading-6">{message.content}</p> : null}

          {Array.isArray(message.attachments) && message.attachments.length > 0 ? (
            <div className={`${message.content ? "mt-3" : ""} space-y-3`}>
              {message.attachments.map((attachment) => {
                const attachmentUrl = getAttachmentUrl(attachment);

                return isImageAttachment(attachment) ? (
                  <a
                    key={attachment._id}
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`block overflow-hidden rounded-2xl border ${
                      isAgent
                        ? "border-accent bg-surface-strong/50"
                        : "border-border bg-surface-strong"
                    }`}
                  >
                    <img
                      src={attachmentUrl}
                      alt={attachment.fileName}
                      className="max-h-72 w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                      <span
                        className={`truncate ${
                          isAgent ? "text-heading" : "text-body"
                        }`}
                      >
                        {attachment.fileName}
                      </span>
                      <span
                        className={isAgent ? "text-heading" : "text-subtle"}
                      >
                        {formatAttachmentSize(attachment.fileSize)}
                      </span>
                    </div>
                  </a>
                ) : (
                  <a
                    key={attachment._id}
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      isAgent
                        ? "border-accent bg-surface-strong/50 text-heading"
                        : "border-border bg-surface-strong text-heading"
                    }`}
                  >
                    <span className="truncate">{attachment.fileName}</span>
                    <span
                      className={`shrink-0 text-xs ${
                        isAgent ? "text-heading" : "text-subtle"
                      }`}
                    >
                      {formatAttachmentSize(attachment.fileSize)}
                    </span>
                  </a>
                );
              })}
            </div>
          ) : null}

          <p
            className={`mt-2 text-xs ${
              isAgent ? "text-heading" : "text-subtle"
            }`}
          >
            {formatDate(message.createdAt)}
          </p>
        </div>
      </div>
    );
  },
);

AdminMessageBubble.displayName = "AdminMessageBubble";

export const TicketDetailView = ({
  ticket,
  agents,
  socket,
  onBack,
  onSendMessage,
  onUpdateTicket,
}: TicketDetailViewProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState(ticket.status);
  const [assignedAgent, setAssignedAgent] = useState(ticket.assignedTo?._id || "");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousMessageCountRef = useRef(ticket.messages?.length || 0);

  useEffect(() => {
    if (socket && ticket) {
      socket.emit("joinTicket", { ticketId: ticket._id });
      return () => {
        socket.emit("leaveTicket", { ticketId: ticket._id });
      };
    }
  }, [ticket, socket]);

  useEffect(() => {
    setTicketStatus(ticket.status);
    setAssignedAgent(ticket.assignedTo?._id || "");
  }, [ticket]);

  useEffect(() => {
    if (!attachment || !attachment.type.startsWith("image/")) {
      setAttachmentPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(attachment);
    setAttachmentPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [attachment]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    const currentMessageCount = ticket.messages?.length || 0;
    const messageCountIncreased =
      currentMessageCount > previousMessageCountRef.current;

    if (messageCountIncreased && shouldStickToBottomRef.current) {
      scrollToBottom("smooth");
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [ticket.messages?.length]);

  useEffect(() => {
    previousMessageCountRef.current = ticket.messages?.length || 0;
    shouldStickToBottomRef.current = true;
    setAttachment(null);
    setAttachmentError("");
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [ticket._id]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !ticket) return;

    const messageContent = newMessage.trim();
    const messageAttachment = attachment;

    try {
      setSending(true);
      setNewMessage("");
      setAttachment(null);
      setAttachmentError("");
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
      }

      await onSendMessage(ticket._id, messageContent, messageAttachment);
    } catch (error) {
      console.error("Failed to send admin support message:", error);
      setNewMessage(messageContent);
      setAttachment(messageAttachment);
      setAttachmentError("Failed to send the message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      setUpdating(true);
      await onUpdateTicket(ticket._id, {
        status: ticketStatus,
        assignedTo: assignedAgent || null,
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleString();
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldStickToBottomRef.current = distanceFromBottom < 96;
  };

  const handleAttachmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const validationError = validateSupportAttachment(selectedFile);

    if (validationError) {
      setAttachment(null);
      setAttachmentError(validationError);
      e.target.value = "";
      return;
    }

    setAttachment(selectedFile);
    setAttachmentError("");
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentError("");
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const isReadOnlyTicket =
    ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div
      className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239,227,202,0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222,204,168,0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <section className={`${panelClassName} p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={onBack}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-strong text-body transition hover:bg-surface-strong"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ticket Conversation
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-heading">
                  {ticket.subject}
                </h1>
                <p className="mt-2 text-sm text-body">
                  {ticket.ticketNumber} created {formatDate(ticket.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex rounded-full border px-3 py-2 text-xs font-semibold ${
                  statusStyles[ticket.status] || statusStyles.closed
                }`}
              >
                {getStatusLabel(ticket.status)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-body">
                <Clock3 className="h-3.5 w-3.5" />
                Last update {formatDate(ticket.updatedAt)}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className={`${panelClassName} p-5`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                Client Profile
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-hover text-accent-foreground shadow-[0_10px_20px_rgba(74,50,24,0.16)]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-heading">
                    {ticket.createdBy?.firstname} {ticket.createdBy?.lastname}
                  </h3>
                  <p className="text-sm text-body">
                    {ticket.createdBy?.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-body">
                    Category
                  </div>
                  <div className="mt-1 text-sm font-semibold text-heading">
                    {ticket.category}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-body">
                    Description
                  </div>
                  <p className="mt-1 text-sm leading-6 text-body">
                    {ticket.description}
                  </p>
                </div>
              </div>
            </section>

            <section className={`${panelClassName} p-5`}>
              <div className="flex items-center gap-2 text-body">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Ticket Management
                </p>
              </div>

              {isReadOnlyTicket ? (
                <div className="mt-4 rounded-2xl border border-border bg-surface-strong p-4">
                  <p className="text-sm font-semibold text-heading">
                    This ticket is {ticket.status}.
                  </p>
                  <p className="mt-1 text-sm text-heading">
                    Messaging and status edits are locked. This view remains
                    available for conversation history and audit context.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                      Status
                    </label>
                    <select
                      value={ticketStatus}
                      onChange={(e) => setTicketStatus(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="new">New</option>
                      <option value="open">Open</option>
                      <option value="inProgress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-body">
                      Assigned To
                    </label>
                    <select
                      value={assignedAgent}
                      onChange={(e) => setAssignedAgent(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.firstname} {agent.lastname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateTicket}
                    className="w-full rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition hover:opacity-90 disabled:opacity-50"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update Ticket"}
                  </button>
                </div>
              )}
            </section>
          </aside>

          <section className={`${panelClassName} flex min-h-[720px] flex-col overflow-hidden`}>
            <div className="border-b border-border bg-surface-strong px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
                    Conversation Feed
                  </p>
                  <p className="mt-1 text-sm text-body">
                    {ticket.messages.length} message
                    {ticket.messages.length === 1 ? "" : "s"} in this thread
                  </p>
                </div>
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="flex-1 space-y-4 overflow-auto bg-surface-strong p-5"
            >
              {ticket.messages.length === 0 ? (
                <div className="mt-24 text-center text-subtle">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-accent" />
                  <p className="text-base font-medium text-body">
                    No messages yet
                  </p>
                  <p className="mt-1 text-sm text-subtle">
                    Start the conversation from the composer below.
                  </p>
                </div>
              ) : (
                ticket.messages.map((msg) => (
                  <AdminMessageBubble
                    key={msg._id}
                    message={msg}
                    formatDate={formatDate}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border bg-surface-strong/90 p-4 sm:p-5">
              {isReadOnlyTicket ? (
                <div className="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-body">
                  This ticket is {ticket.status}. Messaging has ended and only the
                  conversation history remains available.
                </div>
              ) : (
                <>
                  {attachment ? (
                    <div className="mb-3 rounded-2xl border border-border bg-surface-strong p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {attachment.type.startsWith("image/") ? (
                            attachmentPreviewUrl ? (
                              <img
                                src={attachmentPreviewUrl}
                                alt={attachment.name}
                                className="h-16 w-16 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface">
                                <ImageIcon className="h-5 w-5 text-body" />
                              </div>
                            )
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface">
                              <FileText className="h-5 w-5 text-body" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-heading">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-subtle">
                              {formatAttachmentSize(attachment.size)}
                            </p>
                            <p className="mt-1 text-xs text-subtle">
                              Allowed: JPG, PNG, GIF, PDF up to{" "}
                              {formatAttachmentSize(supportAttachmentConfig.maxSize)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearAttachment}
                          className="rounded-full border border-border p-2 text-subtle transition hover:bg-surface-strong"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="flex flex-1 items-center gap-2 rounded-[22px] border border-border bg-surface-strong px-3">
                      <button
                        type="button"
                        onClick={() => attachmentInputRef.current?.click()}
                        disabled={sending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-body transition hover:bg-surface-strong disabled:opacity-50"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <input
                        ref={attachmentInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,image/jpeg,image/png,image/gif,application/pdf"
                        onChange={handleAttachmentChange}
                        className="hidden"
                      />
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          !sending &&
                          handleSendMessage()
                        }
                        placeholder="Type a message or attach a file..."
                        className="flex-1 bg-transparent px-1 py-4 text-sm text-heading outline-none"
                        disabled={sending}
                      />
                    </div>

                    <button
                      onClick={handleSendMessage}
                      className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-accent bg-linear-to-br from-accent to-accent-hover px-6 py-4 text-sm font-semibold text-accent-foreground shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition hover:opacity-90 disabled:opacity-50"
                      disabled={sending || (!newMessage.trim() && !attachment)}
                    >
                      <Send className="h-4 w-4" />
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>

                  {attachmentError ? (
                    <p className="mt-2 text-xs text-[#9a4d40] dark:text-[#cf958c]">{attachmentError}</p>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
