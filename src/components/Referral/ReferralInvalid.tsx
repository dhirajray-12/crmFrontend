import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackgroundElements } from "@/components/Auth/BackgroundElements";

interface ReferralInvalidProps {
    error: string;
}

export default function ReferralInvalid({ error }: ReferralInvalidProps) {
    const navigate = useNavigate();

    return (
        <div className="client-theme-bg relative flex min-h-svh items-center justify-center overflow-hidden px-4">
            <BackgroundElements />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_22%)]" />
            <div className="client-theme-surface-strong relative w-full max-w-sm rounded-3xl border border-rose-400/20 p-6 text-center shadow-[0_22px_54px_rgba(2,6,23,0.4)]">
                <XCircle className="mx-auto mb-3 h-10 w-10 text-rose-700 dark:text-rose-300" />

                <h2 className="text-base sm:text-lg font-semibold text-heading mb-1">
                    Invalid Referral Link
                </h2>

                <p className="mb-5 text-xs text-subtle sm:text-sm">{error}</p>

                <button
                    onClick={() => navigate("/create-account")}
                    className="w-full rounded-xl border border-accent/30 bg-linear-to-br from-accent to-accent-hover py-2.5 text-sm font-medium text-accent-foreground shadow-[0_18px_40px_rgba(14,165,233,0.24)] transition hover:brightness-110 sm:py-2"
                >
                    Continue Without Referral
                </button>
            </div>
        </div>
    );
}
