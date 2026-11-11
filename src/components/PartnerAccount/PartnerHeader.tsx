import { motion } from "framer-motion";
import { RefreshCw, UserPlus } from "lucide-react";

interface PartnerHeaderProps {
  onRefresh: () => void;
}

export const PartnerHeader = ({ onRefresh }: PartnerHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-accent" />

      <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            <UserPlus className="h-3.5 w-3.5" />
            Partner desk
          </div>
          <h1 className="mt-3 text-xl font-bold text-heading sm:text-2xl">
            Partner Account
          </h1>
          <p className="mt-1 max-w-xl text-sm text-subtle">
            Manage your referral code, share your link, and track partner
            performance.
          </p>
        </div>

        <button
          onClick={onRefresh}
          data-voice-target="refresh partner account"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08] hover:text-heading sm:self-start"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    </motion.div>
  );
};
