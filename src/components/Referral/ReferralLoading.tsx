import { Loader2 } from "lucide-react";
import { BackgroundElements } from "@/components/Auth/BackgroundElements";

interface ReferralLoadingProps {
    referralCode: string;
}

export default function ReferralLoading({ referralCode }: ReferralLoadingProps) {
    return (
        <div className="client-theme-bg relative flex min-h-svh items-center justify-center overflow-hidden px-4 text-heading">
            <BackgroundElements />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_22%)]" />
            <div className="client-theme-surface-strong relative flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-border px-8 py-10 text-center shadow-[0_22px_54px_rgba(2,6,23,0.4)]">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-xs text-subtle sm:text-sm">
                    Checking referral code{" "}
                    <span className="font-medium text-accent">{referralCode}</span>
                </p>
            </div>
        </div>
    );
}
