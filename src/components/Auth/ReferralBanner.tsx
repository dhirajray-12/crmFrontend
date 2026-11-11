import React from 'react';
import { motion } from 'framer-motion';

interface ReferralBannerProps {
    validReferral: { code: string; referrerName: string } | null;
    referralError: string;
}

export const ReferralBanner: React.FC<ReferralBannerProps> = ({
    validReferral,
    referralError,
}) => {
    if (!validReferral && !referralError) return null;

    return (
        <>
            {validReferral && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl border border-accent/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(16,185,129,0.10))] p-3 text-xs text-accent shadow-[0_14px_34px_rgba(14,165,233,0.12)] sm:text-sm"
                >
                    You were referred by <strong>{validReferral.referrerName}</strong>
                    <br />
                    <span className="text-[10px] text-subtle sm:text-xs">
                        Your IB account will be created automatically after signup
                    </span>
                </motion.div>
            )}

            {referralError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-200 sm:text-sm"
                >
                    {referralError}
                </motion.div>
            )}
        </>
    );
};
