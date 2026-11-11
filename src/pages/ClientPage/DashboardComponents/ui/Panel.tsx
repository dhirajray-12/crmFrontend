import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { className, strong, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        strong ? "client-theme-surface-strong" : "client-theme-surface",
        "rounded-2xl",
        className,
      )}
      {...props}
    />
  );
});
