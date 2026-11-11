import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send, Loader, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import type { Ticket, Message } from "@/types/ticket.types";
import { useTicketStore } from "@/Store/ticket.store";
import { useTicketSocket } from "@/hooks/useTicketSocket";
import { useSendMessageMutation } from "@/hooks/useTicketQueries";
import { useAuthStore } from "@/Store/auth.store";
import { MessageBubble } from "./MessageBubble";
import {
  getStatusColor,
  getPriorityColor,
  formatDate,
} from "@/utils/ticket.utils";
import {
  formatAttachmentSize,
  validateSupportAttachment,
} from "@/utils/supportAttachments";

interface ChatWindowProps {
  ticket: Ticket;
}

export const ChatWindow = ({ ticket }: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousMessageCountRef = useRef(ticket.messages?.length || 0);
  const { setActiveTicket, isSendingMessage } = useTicketStore();
  const { user } = useAuthStore();

  const { isConnected, sendMessage } = useTicketSocket({ userId: user?._id });
  const sendMessageMutation = useSendMessageMutation();

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
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  };

  // Keep chat pinned like a real messenger thread only when user is near bottom
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

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldStickToBottomRef.current = distanceFromBottom < 96;
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !attachment) || !ticket) return;

    const messageContent = message.trim();
    const messageAttachment = attachment;
    setMessage("");
    setAttachment(null);
    setAttachmentError("");
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }

    try {
      if (isConnected && !messageAttachment) {
        // Use WebSocket for real-time
        sendMessage(ticket._id, messageContent);
      } else {
        // Fallback to REST API
        await sendMessageMutation.mutateAsync({
          ticketId: ticket._id,
          content: messageContent,
          attachment: messageAttachment,
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageContent);
      setAttachment(messageAttachment);
      setAttachmentError("Failed to send the message. Please try again.");
      // Optionally show error toast
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isSendingMessage) {
      handleSendMessage();
    }
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

  const canSendMessage =
    ticket.status !== "closed" && ticket.status !== "resolved";

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] w-full flex-col overflow-hidden rounded-xl border border-border bg-surface lg:h-[640px]">
      <div className="border-b border-border bg-surface-strong/[0.03] p-3.5 sm:p-5">
        <button
          onClick={() => setActiveTicket(null)}
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-subtle transition hover:text-heading"
        >
          <ChevronLeft size={18} />
          Back to tickets
        </button>

        <div className="min-w-0">
          <h3 className="mb-1.5 line-clamp-1 text-base font-bold text-heading sm:text-lg">
            {ticket.subject}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-subtle">
              {ticket.ticketNumber}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusColor(
                ticket.status,
              )}`}
            >
              {ticket.status}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getPriorityColor(
                ticket.priority,
              )}`}
            >
              {ticket.priority}
            </span>
          </div>
          {ticket.assignedTo && (
            <p className="mt-1.5 text-xs font-medium text-subtle">
              Assigned to: {ticket.assignedTo.firstname}{" "}
              {ticket.assignedTo.lastname}
            </p>
          )}
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 space-y-4 overflow-y-auto p-3.5 scroll-smooth sm:p-5"
      >
        {ticket.messages?.map((msg: Message, idx: number) => {
          const isCurrentUser = msg.sender?._id === ticket.createdBy?._id;

          return (
            <MessageBubble
              key={msg._id || idx}
              message={msg}
              isCurrentUser={isCurrentUser}
              userInitial={
                isCurrentUser
                  ? ticket.createdBy?.firstname?.[0] || "Y"
                  : msg.sender?.firstname?.[0] || "A"
              }
              formatDate={formatDate}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {canSendMessage ? (
        <div className="border-t border-border bg-surface-strong/[0.03] p-3 sm:p-4">
          {attachment ? (
            <div className="mb-3 rounded-lg border border-border bg-surface-strong/[0.04] p-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {attachment.type.startsWith("image/") ? (
                    attachmentPreviewUrl ? (
                      <img
                        src={attachmentPreviewUrl}
                        alt={attachment.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-strong/[0.06]">
                        <ImageIcon size={20} className="text-subtle" />
                      </div>
                    )
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-strong/[0.06]">
                      <FileText size={20} className="text-subtle" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-heading">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-subtle">
                      {formatAttachmentSize(attachment.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="shrink-0 rounded-full border border-border p-1.5 text-subtle transition hover:bg-surface-strong/[0.08] hover:text-heading"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex items-end gap-2">
            <div className="relative flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-strong/[0.05] px-2 py-1">
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  disabled={isSendingMessage}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] text-subtle transition hover:bg-surface-strong/[0.08] disabled:opacity-50"
                >
                  <Paperclip size={16} />
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
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    isConnected
                      ? "Type a message..."
                      : "Connecting..."
                  }
                  disabled={isSendingMessage}
                  className="w-full min-w-0 bg-transparent px-1 py-2.5 text-sm text-heading placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              {attachmentError ? (
                <p className="px-1 text-xs text-rose-700 dark:text-rose-300">{attachmentError}</p>
              ) : null}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={isSendingMessage || (!message.trim() && !attachment)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSendingMessage ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          {!isConnected && (
            <p className="mt-2 text-xs text-subtle">
              Real-time messaging unavailable. Messages will be sent via
              standard delivery.
            </p>
          )}
        </div>
      ) : (
        <div className="border-t border-border bg-surface-strong/[0.03] p-4">
          <div className="text-center text-sm font-semibold text-subtle">
            This ticket is {ticket.status}. No new messages can be added.
          </div>
        </div>
      )}
    </div>
  );
};
