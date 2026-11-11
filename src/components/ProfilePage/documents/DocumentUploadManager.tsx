import { useMemo, useState } from "react";
import { useDocumentStore } from "@/Store/document.store";
import { useToastStore } from "@/Store/toast.store";
import { useReverifyKyc, useUploadDocument } from "@/hooks/useProfileQueries";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { documentConfigs } from "./DocumentConfig";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  BadgeCheck,
  Clock3,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

interface DocumentUploadManagerProps {
  profile?: any;
}

export const DocumentUploadManager = ({
  profile,
}: DocumentUploadManagerProps) => {
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const {
    documents,
    overallProgress,
    setDocumentUploaded,
    setUploadProgress,
    setIsUploading,
    clearAllDocuments,
  } = useDocumentStore();
  const addToast = useToastStore((state) => state.addToast);
  const uploadMutation = useUploadDocument();
  const reverifyMutation = useReverifyKyc();

  const uploadedDocumentCount = useMemo(
    () =>
      [
        profile?.idDocument,
        profile?.address1Document,
        profile?.address2Document,
      ].filter(Boolean).length,
    [profile],
  );

  const hasExistingSubmission = uploadedDocumentCount > 0;
  const currentKycStatus = profile?.kycStatus || "unverified";

  const pendingDocuments = Object.entries(documents).filter(
    ([_, doc]) => doc.file && !doc.uploaded,
  );

  const uploadedCount = Object.values(documents).filter(
    (doc) => doc.uploaded,
  ).length;
  const totalCount = Object.keys(documents).length;

  const statusConfig = {
    verified: {
      title: "Your KYC is approved",
      description:
        "Your documents were approved by admin. Use re-verify only if you need to replace the submitted KYC documents.",
      badgeClass:
        "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-100",
      iconClass: "text-emerald-700 dark:text-emerald-300",
      icon: BadgeCheck,
      label: "Approved",
    },
    rejected: {
      title: "Your KYC was rejected",
      description:
        profile?.kycRejectReason ||
        "Your documents need to be submitted again for review.",
      badgeClass: "border-rose-400/20 bg-rose-500/[0.08] text-rose-100",
      iconClass: "text-rose-700 dark:text-rose-300",
      icon: ShieldAlert,
      label: "Rejected",
    },
    unverified: {
      title: "Your KYC is pending",
      description:
        "Your uploaded documents are under admin review. You can re-verify if you want to replace the submitted files.",
      badgeClass: "border-amber-400/20 bg-amber-500/[0.08] text-amber-100",
      iconClass: "text-amber-700 dark:text-amber-300",
      icon: Clock3,
      label: "Pending",
    },
  } as const;

  const activeStatus =
    statusConfig[currentKycStatus as keyof typeof statusConfig] ||
    statusConfig.unverified;

  const handleReverify = async () => {
    try {
      await reverifyMutation.mutateAsync();
      clearAllDocuments();
      addToast("success", "KYC reset. Please upload your documents again.");
    } catch (error: any) {
      addToast(
        "error",
        error?.response?.data?.message || "Failed to reset KYC documents.",
      );
    }
  };

  const handleUploadAll = async () => {
    setIsUploadingAll(true);
    setIsUploading(true);

    for (const [type, doc] of Object.entries(documents)) {
      if (doc.file && !doc.uploaded) {
        try {
          // Simulate progress
          for (let progress = 0; progress <= 100; progress += 10) {
            setUploadProgress(type as any, progress);
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          await uploadMutation.mutateAsync({
            type: type as any,
            file: doc.file,
          });

          setDocumentUploaded(type as any, true);
        } catch (error) {
          console.error(`Failed to upload ${type}:`, error);
        }
      }
    }

    setIsUploadingAll(false);
    setIsUploading(false);
  };

  if (hasExistingSubmission) {
    const StatusIcon = activeStatus.icon;

    return (
      <div className="space-y-4 border-t border-border pt-6">
        <div
          className={`rounded-3xl border p-5 sm:p-6 ${activeStatus.badgeClass}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-surface-strong/10 p-3">
                <StatusIcon className={`h-6 w-6 ${activeStatus.iconClass}`} />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-heading">
                    {activeStatus.title}
                  </h3>
                  <span className="rounded-full border border-border bg-surface-strong/10 px-2.5 py-1 text-xs font-medium text-heading/90">
                    {activeStatus.label}
                  </span>
                </div>
                <p className="max-w-2xl text-sm text-heading">
                  {activeStatus.description}
                </p>
                <p className="text-xs text-subtle">
                  {uploadedDocumentCount} document(s) currently saved
                </p>
              </div>
            </div>

            <button
              onClick={handleReverify}
              disabled={reverifyMutation.isPending}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-border bg-surface-strong/10 px-4 py-2 text-sm font-medium text-heading transition-all hover:bg-surface-strong/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {reverifyMutation.isPending ? "Resetting..." : "Re-verify KYC"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-heading">
            Document Verification
          </h3>
          <p className="mt-1 text-sm text-subtle">
            Uploaded {uploadedCount} of {totalCount} documents
          </p>
        </div>

        {/* Overall Progress */}
        {overallProgress > 0 && overallProgress < 100 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-surface-strong/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-accent to-accent-hover"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-sm text-subtle">
              {Math.round(overallProgress)}%
            </span>
          </div>
        )}
      </div>

      {/* Document Sections */}
      <div className="space-y-4">
        {documentConfigs.map((config) => (
          <DocumentUploadSection key={config.type} {...config} />
        ))}
      </div>

      {/* Upload All Button */}
      {pendingDocuments.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/[0.08] p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            <span className="text-sm text-accent">
              {pendingDocuments.length} document(s) pending upload
            </span>
          </div>

          <button
            onClick={handleUploadAll}
            disabled={isUploadingAll}
            className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.16] px-6 py-2 text-accent transition-all hover:bg-accent/[0.24] disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isUploadingAll ? "Uploading..." : "Upload All"}
          </button>
        </div>
      )}

      {/* All Uploaded Message */}
      {uploadedCount === totalCount && totalCount > 0 && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4">
          <CheckCircle className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
          <span className="text-sm text-emerald-100">
            All documents have been uploaded successfully. Your KYC is pending review.
          </span>
        </div>
      )}
    </div>
  );
};
