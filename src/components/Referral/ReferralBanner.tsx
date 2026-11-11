import { CheckCircle } from "lucide-react";

interface ReferralBannerProps {
    referrerName: string;
}

export default function ReferralBanner({ referrerName }: ReferralBannerProps) {
    return (
        <div className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 px-3">
            <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),rgba(16,185,129,0.12))] px-3 py-2 text-xs text-accent shadow-[0_14px_34px_rgba(14,165,233,0.14)] sm:px-4 sm:text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                Referred by <span className="font-semibold">{referrerName}</span>
            </div>
        </div>
    );
}
