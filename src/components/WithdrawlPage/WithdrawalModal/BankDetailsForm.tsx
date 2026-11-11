import type { SavedBankDetails } from "@/types/WithdrawalPage.types";
import { motion } from "framer-motion";
interface BankDetailsFormProps {
    formData: any;
    savedBankDetails: SavedBankDetails | null;
    onChange: (field: string, value: string) => void;
    onClearSavedDetails: () => void;
}

export const BankDetailsForm = ({
    formData,
    savedBankDetails,
    onChange,
    onClearSavedDetails,
}: BankDetailsFormProps) => {
    const hasSavedBankDetails = !!(
        savedBankDetails?.bankName ||
        savedBankDetails?.accountHolderName ||
        savedBankDetails?.accountNumber ||
        savedBankDetails?.ifscCode
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {hasSavedBankDetails && (
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-emerald-100">Saved bank details applied</p>
                        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200/80">
                            These values came from your profile. You can clear them here and enter different details only for this withdrawal.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClearSavedDetails}
                        data-voice-target="use other bank details"
                        className="shrink-0 rounded-xl border border-border bg-surface-strong/10 px-4 py-2 text-sm font-medium text-heading transition-colors hover:bg-surface-strong/15"
                    >
                        Use Other Bank Details
                    </button>
                </div>
            )}
            <div>
                <label className="mb-2 block text-sm font-semibold text-heading">Bank Name</label>
                <input
                    type="text"
                    value={formData.bankName || ""}
                    onChange={(e) => onChange("bankName", e.target.value)}
                    data-voice-target="bank name"
                    data-voice-field="bank name"
                    className="client-theme-input w-full rounded-xl px-4 py-3 text-heading placeholder:text-subtle [color-scheme:dark] focus:outline-none"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-heading">Account Holder Name</label>
                <input
                    type="text"
                    value={formData.accountHolderName || ""}
                    onChange={(e) => onChange("accountHolderName", e.target.value)}
                    data-voice-target="account holder name"
                    data-voice-field="account holder name"
                    className="client-theme-input w-full rounded-xl px-4 py-3 text-heading placeholder:text-subtle [color-scheme:dark] focus:outline-none"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-heading">Account Number</label>
                <input
                    type="text"
                    value={formData.accountNumber || ""}
                    onChange={(e) => onChange("accountNumber", e.target.value)}
                    data-voice-target="bank account number"
                    data-voice-field="bank account number"
                    className="client-theme-input w-full rounded-xl px-4 py-3 text-heading placeholder:text-subtle [color-scheme:dark] focus:outline-none"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-heading">IFSC Code</label>
                <input
                    type="text"
                    value={formData.ifscCode || ""}
                    onChange={(e) => onChange("ifscCode", e.target.value)}
                    data-voice-target="ifsc code"
                    data-voice-field="ifsc code"
                    className="client-theme-input w-full rounded-xl px-4 py-3 text-heading placeholder:text-subtle [color-scheme:dark] focus:outline-none"
                />
            </div>
        </motion.div>
    );
};
