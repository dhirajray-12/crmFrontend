import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Mail,
  QrCode,
  Share2,
  UserPlus,
} from "lucide-react";
import type { PartnerConfig, DashboardSummary } from "@/types/partner.types";
import { usePartnerStore } from "@/Store/partner.store";
import { usePartnerShare } from "@/hooks/usePartnerShare";
import { partnerService } from "@/services/partner.service";
import { copyToClipboard } from "@/utils/clipboard";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface PartnerAccountDetailsProps {
  config: PartnerConfig;
  summary: DashboardSummary | null | undefined;
}

export const PartnerAccountDetails = ({
  config,
}: PartnerAccountDetailsProps) => {
  const { showQR, setShowQR, copiedField } = usePartnerStore();
  const { share } = usePartnerShare(config.referralCode);
  const [copiedId, setCopiedId] = useState(false);

  const referralLink = partnerService.generateReferralLink(config.referralCode);

  const copyAffiliateId = async () => {
    const success = await copyToClipboard(config.referralCode);
    if (success) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <AffiliateIdCard
        config={config}
        copiedId={copiedId}
        onCopy={copyAffiliateId}
      />

      <ReferralLinkCard
        referralLink={referralLink}
        onShare={share}
        onToggleQR={() => setShowQR(!showQR)}
        showQR={showQR}
        copiedLink={copiedField === "link"}
        emailCopied={copiedField === "email"}
      />

      <AnimatePresence>
        {showQR && (
          <QRCodeDisplay
            referralCode={config.referralCode}
            onClose={() => setShowQR(false)}
          />
        )}
      </AnimatePresence>

      {config.parentDetails && (
        <ParentReferralInfo details={config.parentDetails} />
      )}

      <CommissionInfo level={config.level} />

      <AccountStatus status={config.status} />
    </div>
  );
};

const AffiliateIdCard = ({ config, copiedId, onCopy }: any) => (
  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        Your Affiliate ID
      </span>
      <StatusBadge status={config.status} />
    </div>
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-lg border border-border bg-surface px-3 py-3">
        <p className="font-mono text-base font-bold text-heading">
          {config.referralCode}
        </p>
      </div>
      <button
        onClick={onCopy}
        className="rounded-lg border border-border bg-surface-strong/[0.04] p-3 transition-colors hover:bg-surface-strong/[0.08]"
      >
        {copiedId ? (
          <CheckCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        ) : (
          <Copy className="h-4 w-4 text-heading" />
        )}
      </button>
    </div>
    <p className="mt-2 text-xs text-subtle">
      Use this unique ID to track your referrals · One-time generated
    </p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === "active";
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        isActive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      }`}
    >
      {status}
    </span>
  );
};

const ReferralLinkCard = ({
  referralLink,
  onShare,
  onToggleQR,
  showQR,
  copiedLink,
  emailCopied,
}: any) => (
  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
    <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
      Your Referral Link
    </span>
    <div className="mb-3 flex items-center gap-2">
      <div className="flex-1 overflow-hidden rounded-lg border border-border bg-surface px-3 py-3">
        <p className="truncate text-xs text-heading sm:text-sm">{referralLink}</p>
      </div>
      <button
        onClick={() => onShare("copy")}
        className="rounded-lg border border-border bg-surface-strong/[0.04] p-3 transition-colors hover:bg-surface-strong/[0.08]"
      >
        {copiedLink ? (
          <CheckCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        ) : (
          <Copy className="h-4 w-4 text-heading" />
        )}
      </button>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <ShareButton
        icon={<Share2 className="h-4 w-4 text-heading" />}
        label="Share"
        onClick={() => onShare("social")}
      />
      <ShareButton
        icon={
          emailCopied ? (
            <CheckCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          ) : (
            <Mail className="h-4 w-4 text-heading" />
          )
        }
        label={emailCopied ? "Copied" : "Email"}
        onClick={() => onShare("email")}
        active={emailCopied}
      />
      <ShareButton
        icon={<QrCode className="h-4 w-4 text-heading" />}
        label="QR Code"
        onClick={onToggleQR}
        active={showQR}
      />
    </div>
  </div>
);

const ShareButton = ({ icon, label, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-colors ${
      active
        ? "border-accent/30 bg-accent/10"
        : "border-border bg-surface-strong/[0.04] hover:bg-surface-strong/[0.08]"
    }`}
  >
    {icon}
    <span className="text-xs text-heading">{label}</span>
  </button>
);

const ParentReferralInfo = ({ details }: any) => (
  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
      <UserPlus className="h-4 w-4 text-subtle" />
      Referred By
    </h3>
    <div className="space-y-2">
      <InfoRow label="Name" value={details.name} />
      <InfoRow label="Referral Code" value={details.referralCode} mono />
    </div>
  </div>
);

const CommissionInfo = ({ level }: { level: number }) => (
  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
    <h3 className="mb-3 text-sm font-semibold text-heading">
      Commission Structure
    </h3>
    <div className="space-y-2">
      <InfoRow label="Direct Referrals" value="Per Trade" />
      <InfoRow label="Account Level" value={`Level ${level}`} />
      <InfoRow label="Payout Frequency" value="On Request" />
    </div>
  </div>
);

const AccountStatus = ({ status }: { status: string }) => {
  const isActive = status === "active";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        Account Status
      </span>
      <div
        className={`flex items-center gap-3 rounded-lg border p-4 ${
          isActive
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-amber-500/30 bg-amber-500/10"
        }`}
      >
        {isActive ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-700 dark:text-emerald-300" />
        ) : (
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-300" />
        )}
        <div>
          <p className="text-sm font-semibold capitalize text-heading">
            {status}
          </p>
          <p className="text-xs text-subtle">
            {isActive
              ? "Your account is ready to earn commissions"
              : "Your account is pending activation"}
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono = false }: any) => (
  <div className="flex items-center justify-between rounded-lg bg-surface-strong/[0.03] p-3">
    <span className="text-xs text-subtle sm:text-sm">{label}</span>
    <span
      className={`text-sm font-bold text-heading ${mono ? "font-mono" : ""}`}
    >
      {value}
    </span>
  </div>
);
