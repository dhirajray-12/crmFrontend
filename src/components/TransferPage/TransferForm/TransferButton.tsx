import { ArrowRightLeft, Loader2 } from "lucide-react";

interface TransferButtonProps {
  isProcessing: boolean;
}

export const TransferButton = ({ isProcessing }: TransferButtonProps) => {
  return (
    <div className="md:col-span-2">
      <button
        type="submit"
        disabled={isProcessing}
        data-voice-target="transfer funds"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ArrowRightLeft className="h-4 w-4" />
            Transfer Funds
          </>
        )}
      </button>
    </div>
  );
};
