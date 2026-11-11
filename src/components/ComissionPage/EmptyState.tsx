import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div className="rounded-xl border border-border bg-surface-strong/[0.04] p-4">{icon}</div>
    <span className="text-base font-semibold text-heading sm:text-lg">
      {title}
    </span>
    {description && (
      <span className="px-4 text-center text-sm text-subtle">
        {description}
      </span>
    )}
  </div>
);
