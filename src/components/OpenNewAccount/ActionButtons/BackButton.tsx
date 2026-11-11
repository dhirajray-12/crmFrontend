import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/[0.03] px-4 py-2 text-sm font-medium text-subtle transition-all duration-200 hover:border-border hover:bg-surface-strong/[0.06] hover:text-heading"
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      Back to account types
    </button>
  );
};
