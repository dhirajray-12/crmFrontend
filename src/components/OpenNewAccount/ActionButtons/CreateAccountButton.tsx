import { RotateCcw, Zap } from "lucide-react";

interface CreateAccountButtonProps {
  loading: boolean;
  onReset: () => void;
  onCreate: () => void;
}

export const CreateAccountButton = ({
  loading,
  onReset,
  onCreate,
}: CreateAccountButtonProps) => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-heading sm:text-base">
        Ready to create
      </h3>
      <p className="mt-1 text-xs text-subtle">
        Double-check the leverage and credential preferences, then submit.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          data-voice-target="reset account"
          className="group inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-medium text-heading transition-all duration-200 hover:border-border hover:bg-surface-strong/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />
          Reset
        </button>
        <button
          type="button"
          onClick={onCreate}
          disabled={loading}
          data-voice-target="create trading account"
          className="ona-shine group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[0_12px_28px_rgba(56,189,248,0.35)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating account...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
              Create trading account
            </>
          )}
        </button>
      </div>
    </div>
  );
};
