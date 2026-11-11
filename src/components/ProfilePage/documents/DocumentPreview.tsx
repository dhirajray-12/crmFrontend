import {
  Download,
  Eye,
  File,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface DocumentPreviewProps {
  file: File | null;
  previewUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  fileSize: number | null;
  onClear: () => void;
}

export const DocumentPreview = ({
  previewUrl,
  fileType,
  fileName,
  fileSize,
  onClear,
}: DocumentPreviewProps) => {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = () => {
    if (fileType?.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    if (fileType === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
      return <File className="w-8 h-8 text-subtle" />;
  };

  const handleDownload = () => {
    if (previewUrl && fileName) {
      const link = document.createElement("a");
      link.href = previewUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-strong/[0.05] p-4">
      <div className="flex items-start gap-4">
        {/* File Icon/Thumbnail */}
        <div className="flex-shrink-0">
          {fileType?.startsWith("image/") && previewUrl ? (
            <div className="h-16 w-16 overflow-hidden rounded-lg border border-border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-strong">
              {getFileIcon()}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-heading">
            {fileName || "Unnamed file"}
          </p>
          <p className="mt-1 text-xs text-subtle">
            {formatFileSize(fileSize)}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePreview}
              className="inline-flex items-center gap-1 text-xs text-accent transition-colors hover:text-accent"
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 transition-colors hover:text-emerald-200"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={onClear}
          className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-surface-strong/[0.08]"
          title="Remove file"
        >
          <X className="w-4 h-4 text-subtle" />
        </button>
      </div>
    </div>
  );
};
