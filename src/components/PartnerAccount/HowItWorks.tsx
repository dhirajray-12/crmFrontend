import type { ComponentType } from "react";
import { MessageSquare, Share2, UserPlus2, Wallet } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Share Your Link",
      description: "Send your unique referral link to friends and contacts",
      icon: Share2,
      iconColor: "text-accent",
    },
    {
      number: 2,
      title: "They Sign Up",
      description: "When they register using your link, they join your network",
      icon: UserPlus2,
      iconColor: "text-accent",
    },
    {
      number: 3,
      title: "Earn Commissions",
      description: "You earn from their trades automatically",
      icon: Wallet,
      iconColor: "text-emerald-700 dark:text-emerald-300",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-heading">
          How It Works
        </h3>
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <StepItem key={step.number} {...step} />
        ))}
      </div>
    </div>
  );
};

const StepItem = ({
  number,
  title,
  description,
  icon: Icon,
  iconColor,
}: {
  number: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
}) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-strong/[0.03] p-3">
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] text-sm font-bold text-heading">
      {number}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-heading">{title}</p>
        <Icon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
      </div>
      <p className="mt-1 text-xs text-subtle">{description}</p>
    </div>
  </div>
);
