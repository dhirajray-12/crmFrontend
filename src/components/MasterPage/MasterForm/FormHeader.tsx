import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
    mode: "create" | "update";
    onBack: () => void;
}

export const FormHeader = ({ mode, onBack }: FormHeaderProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border bg-surface-strong/[0.04] p-2.5 transition-colors hover:bg-surface-strong/[0.08]"
        >
          <ArrowLeft className="h-4 w-4 text-heading" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-heading sm:text-xl">
            {mode === "create"
              ? "Create Master Account"
              : "Update Master Account"}
          </h2>
          <p className="text-sm text-subtle">
            {mode === "create"
              ? "Set up your master trading account to start earning commissions."
              : "Update your master trading account settings."}
          </p>
        </div>
      </div>
    </div>
  );
};
