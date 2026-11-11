import type { Attachment as SupportAttachment } from "@/types/support.types";
import type { Attachment as TicketAttachment } from "@/types/ticket.types";
import { normalizeAssetUrl } from "@/utils/assetUrl";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/pdf",
] as const;

export const supportAttachmentConfig = {
  maxSize: MAX_ATTACHMENT_SIZE,
  allowedTypes: ALLOWED_ATTACHMENT_TYPES,
};

export const validateSupportAttachment = (file: File) => {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number])) {
    return "Only JPG, PNG, GIF, and PDF files are allowed.";
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    return "Attachment must be 10MB or smaller.";
  }

  return null;
};

export const formatAttachmentSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImageAttachment = (
  attachment: Pick<SupportAttachment | TicketAttachment, "fileType">,
) => attachment.fileType.startsWith("image/");

export const getAttachmentUrl = (
  attachment: Pick<SupportAttachment | TicketAttachment, "filePath">,
) => {
  const normalizedPath = attachment.filePath.replace(/\\/g, "/");
  const uploadsIndex = normalizedPath.lastIndexOf("/uploads/");
  const publicPath =
    uploadsIndex >= 0
      ? normalizedPath.slice(uploadsIndex)
      : normalizedPath.startsWith("uploads/")
        ? `/${normalizedPath}`
        : normalizedPath;

  return normalizeAssetUrl(publicPath) || publicPath;
};
