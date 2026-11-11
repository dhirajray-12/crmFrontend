import { Loader2 } from "lucide-react";

export const PartnerLoadingState = () => {
  return (
    <div className="client-theme-bg relative flex min-h-screen items-center justify-center p-4">
      <div className="rounded-xl border border-border bg-surface px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
          <Loader2 className="h-7 w-7 animate-spin text-accent" />
        </div>
        <p className="text-sm font-medium text-subtle sm:text-base">
          Loading your partner account...
        </p>
      </div>
    </div>
  );
};
