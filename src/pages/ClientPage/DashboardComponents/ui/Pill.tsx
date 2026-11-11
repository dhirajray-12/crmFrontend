import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type PillTone = "sky" | "emerald" | "rose" | "amber" | "neutral";

const toneClasses: Record<PillTone, string> = {
  sky: "border-accent/25 bg-accent/10 text-accent",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200",
  rose: "border-rose-400/25 bg-rose-400/10 text-rose-700 dark:text-rose-200",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-700 dark:text-amber-200",
  neutral: "border-border bg-surface-strong/[0.06] text-subtle",
};

const dotClasses: Record<PillTone, string> = {
  sky: "bg-accent",
  emerald: "bg-emerald-300",
  rose: "bg-rose-300",
  amber: "bg-amber-300",
  neutral: "bg-slate-300",
};

interface PillProps {
  tone?: PillTone;
  icon?: LucideIcon;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Pill({ tone = "neutral", icon: Icon, dot, className, children }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        toneClasses[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full motion-safe:animate-pulse", dotClasses[tone])} />
      )}
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}
