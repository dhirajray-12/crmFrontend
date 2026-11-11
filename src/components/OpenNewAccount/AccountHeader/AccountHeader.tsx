import { Check } from "lucide-react";
import type { UserInfo } from "@/types/OpenAccount.type";

interface AccountHeaderProps {
  user: UserInfo | null;
  step: 1 | 2;
}

const StepPill = ({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) => (
  <div className="flex items-center gap-2">
    <span
      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
        done
          ? "bg-emerald-400 text-accent-foreground"
          : active
            ? "bg-accent text-accent-foreground"
            : "border border-border text-subtle"
      }`}
    >
      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : number}
    </span>
    <span
      className={`text-sm font-medium ${
        active || done ? "text-heading" : "text-subtle"
      }`}
    >
      {label}
    </span>
  </div>
);

export const AccountHeader = ({ user, step }: AccountHeaderProps) => {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/80">
          Account launchpad
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
          Open a new trading account
        </h1>
        <p className="mt-1.5 text-sm text-subtle">
          {user
            ? `Setting up a new account for ${user.firstName} ${user.lastName}.`
            : "Pick an account type and configure it in two quick steps."}
        </p>
      </div>

      <div className="flex items-center gap-3 self-start rounded-full border border-border bg-surface-strong/[0.03] px-4 py-2.5 sm:self-auto">
        <StepPill number={1} label="Select" active={step === 1} done={step > 1} />
        <span className="h-px w-5 bg-surface-strong/15" />
        <StepPill number={2} label="Configure" active={step === 2} done={false} />
      </div>
    </header>
  );
};
