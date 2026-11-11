import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BackgroundElements } from "@/components/Auth/BackgroundElements";
import ReferralHandler from "@/components/Referral/ReferralHandler";

// Loading fallback for Suspense
function ReferralFallback() {
  return (
    <div className="client-theme-bg relative flex min-h-svh items-center justify-center overflow-hidden px-4 text-heading">
      <BackgroundElements />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_22%)]" />
      <div className="client-theme-surface-strong relative flex flex-col items-center gap-3 rounded-3xl border border-border px-8 py-10 shadow-[0_22px_54px_rgba(2,6,23,0.4)]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-xs text-subtle sm:text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function ReferralRouteHandler() {
  return (
    <Suspense fallback={<ReferralFallback />}>
      <ReferralHandler />
    </Suspense>
  );
}
