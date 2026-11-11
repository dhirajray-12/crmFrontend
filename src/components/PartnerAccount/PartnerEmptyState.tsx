import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, TrendingUp, UserPlus, Users } from "lucide-react";
import { useCreatePartnerMutation } from "@/hooks/usePartnerQueries";
import { usePartnerStore } from "@/Store/partner.store";

export const PartnerEmptyState = () => {
  const createPartnerMutation = useCreatePartnerMutation();
  const { isCreating, error } = usePartnerStore();

  const handleCreatePartner = () => {
    createPartnerMutation.mutate();
  };

  return (
    <div className="client-theme-bg relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-border bg-surface p-5 text-center sm:p-8"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
            <UserPlus className="h-7 w-7 text-accent" />
          </div>

          <h2 className="text-xl font-bold text-heading sm:text-2xl">
            Become a Partner
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-subtle">
            Start earning commissions by referring new traders. Generate your
            unique referral code and share it with your network.
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleCreatePartner}
            disabled={isCreating}
            data-voice-target="create partner account"
            className="mx-auto mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/15 px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Your Code...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Generate My Referral Code
              </>
            )}
          </button>

          <BenefitCards />
        </motion.div>
      </div>
    </div>
  );
};

const BenefitCards = () => (
  <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
    <BenefitCard
      icon={TrendingUp}
      iconColor="text-emerald-700 dark:text-emerald-300"
      accentColor="bg-emerald-400"
      title="Earn Commissions"
      description="Get paid for every trade your referrals make"
    />
    <BenefitCard
      icon={Users}
      iconColor="text-accent"
      accentColor="bg-accent"
      title="Track Performance"
      description="Monitor your earnings in real-time dashboard"
    />
    <BenefitCard
      icon={UserPlus}
      iconColor="text-purple-700 dark:text-purple-300"
      accentColor="bg-purple-400"
      title="Unlimited Network"
      description="No limit on the number of referrals you can make"
    />
  </div>
);

const BenefitCard = ({
  icon: Icon,
  iconColor,
  accentColor,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  accentColor: string;
  title: string;
  description: string;
}) => (
  <div className="relative overflow-hidden rounded-xl border border-border bg-surface-strong/[0.03] p-4">
    <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} />
    <div className="pl-2">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <h3 className="mt-3 text-sm font-semibold text-heading">{title}</h3>
      <p className="mt-1 text-xs text-subtle">{description}</p>
    </div>
  </div>
);
