import { memo } from "react";
import type { Message } from "@/types/ticket.types";
import {
  formatAttachmentSize,
  getAttachmentUrl,
  isImageAttachment,
} from "@/utils/supportAttachments";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  userInitial: string;
  formatDate: (date: string) => string;
}

export const MessageBubble = memo(({
  message,
  isCurrentUser,
  userInitial,
  formatDate,
}: MessageBubbleProps) => {
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];

  return (
    <div
      className={`flex gap-2.5 animate-fade-in ${isCurrentUser ? "justify-end" : ""}`}
    >
      {!isCurrentUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-strong/[0.06] text-xs font-bold text-heading">
          {userInitial}
        </div>
      )}
      <div className={`min-w-0 flex-1 ${isCurrentUser ? "max-w-[80%] sm:max-w-md" : "max-w-[80%] sm:max-w-md"}`}>
        <div
          className={`rounded-lg border p-3 ${
            isCurrentUser
              ? "border-accent/20 bg-accent/10 rounded-tr-sm"
              : "border-border bg-surface-strong/[0.04] rounded-tl-sm"
          }`}
        >
          {message.content ? (
            <p className="whitespace-pre-wrap break-words text-sm text-heading">
              {message.content}
            </p>
          ) : null}
          {attachments.length > 0 ? (
            <div className={`${message.content ? "mt-2.5" : ""} space-y-2`}>
              {attachments.map((attachment) => {
                const attachmentUrl = getAttachmentUrl(attachment);

                return isImageAttachment(attachment) ? (
                  <a
                    key={attachment._id}
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg border border-border bg-field"
                  >
                    <img
                      src={attachmentUrl}
                      alt={attachment.fileName}
                      className="max-h-56 w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-subtle">
                      <span className="truncate">{attachment.fileName}</span>
                      <span className="shrink-0">{formatAttachmentSize(attachment.fileSize)}</span>
                    </div>
                  </a>
                ) : (
                  <a
                    key={attachment._id}
                    href={attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-field px-3 py-2 text-sm text-heading transition hover:bg-surface-strong"
                  >
                    <span className="truncate">{attachment.fileName}</span>
                    <span className="shrink-0 text-xs text-subtle">
                      {formatAttachmentSize(attachment.fileSize)}
                    </span>
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
        <p
          className={`mt-1 text-[11px] font-medium text-subtle ${
            isCurrentUser ? "text-right" : ""
          }`}
        >
          {isCurrentUser ? "You" : `${message.sender?.firstname || "Admin"}`} •{" "}
          {formatDate(message.createdAt)}
        </p>
      </div>
      {isCurrentUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-xs font-bold text-accent">
          {userInitial}
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";
