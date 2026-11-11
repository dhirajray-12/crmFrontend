import type { ReactNode } from "react";

type IconTone = "sky" | "amber" | "rose" | "emerald";

interface GradientIconProps {
  tone: IconTone;
  icon: ReactNode;
}

const TONE_CLASSES: Record<IconTone, string> = {
  sky: "border-accent/20 bg-accent/10 text-accent",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-200",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200",
};

export const GradientIcon = ({ tone, icon }: GradientIconProps) => {
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border sm:h-10 sm:w-10 ${TONE_CLASSES[tone]}`}
    >
      {icon}
    </div>
  );
};
