// components/Partners/PartnersEmptyState.tsx
import React from "react";
import { Users } from "lucide-react";

export const PartnersEmptyState: React.FC = () => (
  <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
    <h2 className="flex items-center gap-2 text-lg font-bold text-heading sm:text-xl">
      <Users className="h-5 w-5 text-accent" />
      Your Partners (0)
    </h2>
    <div className="py-12 text-center">
      <Users className="mx-auto mb-4 h-12 w-12 text-heading/20" />
      <p className="text-base font-medium text-heading/70">No partners yet</p>
      <p className="mt-2 text-sm text-subtle">
        Share your referral code to start building your network
      </p>
    </div>
  </div>
);
