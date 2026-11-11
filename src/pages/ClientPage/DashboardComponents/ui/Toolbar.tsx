import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function ToolbarButton({ active, className, ...props }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-accent/40 bg-accent text-accent-foreground"
          : "border-border bg-transparent text-subtle hover:border-border hover:text-heading",
        className,
      )}
      {...props}
    />
  );
}

export function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-1.5", className)} {...props} />;
}
