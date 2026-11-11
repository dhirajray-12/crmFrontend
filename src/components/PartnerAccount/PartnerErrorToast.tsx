import { AlertCircle } from "lucide-react";
import { usePartnerStore } from "@/Store/partner.store";

interface PartnerErrorToastProps {
  message: string;
}

export const PartnerErrorToast = ({ message }: PartnerErrorToastProps) => {
  const { setError } = usePartnerStore();

  return (
    <div className="fixed right-4 top-4 z-50 animate-fade-in">
      <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/90 px-4 py-3 text-sm text-heading shadow-2xl backdrop-blur-xl">
        <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-700 dark:text-red-300" />
        <span>{message}</span>
        <button
          onClick={() => setError(null)}
          className="ml-2 text-lg leading-none text-heading/70 hover:text-heading"
        >
          ×
        </button>
      </div>
    </div>
  );
};
