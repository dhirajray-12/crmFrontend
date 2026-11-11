import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateAccount } from "@/hooks/useCreateAccountData";
import { useCreateAccountStore } from "@/Store/createAccountStore";
import { getColorScheme } from "@/Constants/accountColors";
import { LeverageDropdown } from "@/components/CreateAccountModal/account/LeverageDropdown";
import { InfoBox } from "@/components/CreateAccountModal/Shared/vInfoBox";

interface Step2Props {
    onBack: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
}

export const Step2_AccountConfiguration: React.FC<Step2Props> = ({
    onBack,
    onSuccess,
    onError,
}) => {
    const { selectedType, selectedLeverage, setSelectedLeverage } = useCreateAccountStore();
    const createAccount = useCreateAccount();
    const [loading, setLoading] = useState(false);

    if (!selectedType) return null;

    const colorScheme = getColorScheme(selectedType._id);
    const Icon = colorScheme.icon;

    const handleCreateAccount = async () => {
        if (!selectedType || !selectedLeverage) {
            onError("Please select all required fields");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                leverage: selectedLeverage,
                accountType: selectedType.value,
                platform: selectedType.platforms || "MetaTrader 5",
            };

            await createAccount.mutateAsync(payload);
            onSuccess();
        } catch (err: any) {
            onError(
                err.response?.data?.message ||
                "Failed to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-8">
            <div className="rounded-[28px] border border-border bg-surface-strong/[0.04] p-5 text-center sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
                    Step 02
                </p>
                <p className="mt-3 text-base sm:text-lg text-subtle leading-relaxed">
                    Configure your account settings and trading parameters.
                </p>
            </div>

            <div className="rounded-[28px] border border-border bg-surface-strong p-5 text-center sm:p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-subtle sm:mb-4">
                    Selected Account Type:
                </p>
                <div
                    className={`inline-flex items-center gap-2 sm:gap-3 ${colorScheme.color} px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg`}
                >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span
                        className={`font-bold text-base sm:text-lg ${colorScheme.textColor}`}
                    >
                        {selectedType.name}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-8">
                {/* Leverage */}
                <LeverageDropdown
                    leverages={selectedType.leverages}
                    selectedLeverage={selectedLeverage}
                    onSelect={setSelectedLeverage}
                    disabled={loading}
                />

                {/* Platform */}
                <div className="space-y-2 rounded-[28px] border border-border bg-surface-strong/[0.04] p-5 sm:space-y-3 sm:p-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-heading">
                        <span className="text-base sm:text-lg">💻</span>
                        Trading Platform
                    </label>
                    <input
                        type="text"
                        className="w-full rounded-xl border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading transition-all focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20 sm:px-4 sm:py-3 sm:text-base"
                        value={selectedType.platforms || "MetaTrader 5"}
                        readOnly
                    />
                </div>
            </div>

            <InfoBox
                Icon="ℹ️"
                title="Account Creation Process:"
                className="border border-accent/15 bg-accent/[0.08]"
            >
                Your new trading account will be created instantly
                upon submission. You can fund it from your existing
                accounts or make a new deposit once the account is
                active.
            </InfoBox>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
                <button
                    onClick={onBack}
                    className="w-full rounded-2xl border border-border bg-surface-strong/[0.04] px-6 py-3 text-sm font-semibold text-heading transition-all hover:bg-surface-strong/[0.08] sm:w-auto sm:px-8 sm:text-base"
                    disabled={loading}
                >
                    ← Back
                </button>
                <button
                    onClick={handleCreateAccount}
                    disabled={loading || !selectedLeverage}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${loading || !selectedLeverage
                        ? "cursor-not-allowed border border-border bg-surface-strong/[0.04] text-subtle"
                        : "border border-accent/20 bg-gradient-to-r from-accent via-accent to-amber-400 text-heading shadow-[0_18px_40px_rgba(14,165,233,0.24)] hover:brightness-110"
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>✨ Create Trading Account</>
                    )}
                </button>
            </div>
        </div>
    );
};
