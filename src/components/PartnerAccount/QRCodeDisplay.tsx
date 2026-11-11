import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, Copy, QrCode, X } from "lucide-react";
import { partnerService } from "@/services/partner.service";
import { copyToClipboard } from "@/utils/clipboard";

interface QRCodeDisplayProps {
  referralCode: string;
  onClose: () => void;
}

export const QRCodeDisplay = ({ referralCode, onClose }: QRCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const referralLink = partnerService.generateReferralLink(referralCode);

  const handleCopy = async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-lg border border-border bg-surface-strong/[0.04] p-1.5 transition-colors hover:bg-surface-strong/[0.08]"
      >
        <X className="h-4 w-4 text-heading" />
      </button>

      <div className="mb-4 flex items-center gap-2">
        <QrCode className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-heading">
          QR Code
        </h3>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-4">
        <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-surface-strong p-3 sm:h-48 sm:w-48">
          <QRCodeSVG
            value={referralLink}
            size={176}
            level="M"
            className="h-full w-full"
          />
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-subtle sm:text-sm">
        Scan to access your referral link
      </p>

      <button
        onClick={handleCopy}
        className="mx-auto mt-3 flex items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2 text-xs text-heading transition-colors hover:bg-surface-strong/[0.08]"
      >
        {copied ? (
          <>
            <CheckCircle className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy Link
          </>
        )}
      </button>
    </motion.div>
  );
};
