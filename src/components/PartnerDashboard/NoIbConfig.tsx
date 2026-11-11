// components/NoIBConfig.tsx
import React from "react";
import { Share2 } from "lucide-react";

interface NoIBConfigProps {
  onCreateConfig: () => void;
}

export const NoIBConfig: React.FC<NoIBConfigProps> = ({ onCreateConfig }) => (
  <div className="client-theme-bg flex min-h-screen items-center justify-center p-4">
    <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
          <Share2 className="h-7 w-7 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-heading sm:text-2xl">
          Become a Partner
        </h2>
        <p className="mt-2 text-sm text-subtle">
          Create your IB referral code and start earning commissions
        </p>
      </div>
      <button
        onClick={onCreateConfig}
        className="w-full rounded-lg bg-accent/15 px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent/25"
      >
        Create My Referral Code
      </button>
    </div>
  </div>
);
