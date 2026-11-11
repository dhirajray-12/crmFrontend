import { X, ChevronLeft } from "lucide-react";
import { useDepositStore } from "@/Store/depositStore";

interface DepositModalHeaderProps {
    onClose: () => void;
}

export const DepositModalHeader: React.FC<DepositModalHeaderProps> = ({ onClose }) => {
    const { step, setStep, setSelectedBank, setSelectedWallet } = useDepositStore();

    const goBack = () => {
        if (step === "bankDetails") {
            setStep("bankSelect");
            setSelectedBank(null);
        } else if (step === "walletDetails") {
            setStep("walletSelect");
            setSelectedWallet(null);
        } else if (step === "bankSelect" || step === "walletSelect") {
            setStep("method");
        }
    };

    const getTitle = () => {
        switch (step) {
            case "method":
                return "Select Payment Method";
            case "bankSelect":
                return "Select Bank Account";
            case "bankDetails":
                return "Deposit Funds";
            case "walletSelect":
                return "Select Wallet";
            case "walletDetails":
                return "Deposit Funds";
            default:
                return "Deposit";
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-strong px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2">
                {step !== "method" && (
                    <button
                        onClick={goBack}
                        data-voice-target="deposit back"
                        className="flex-shrink-0 rounded-lg border border-border p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.06] hover:text-heading"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
                <h1 className="truncate text-base font-bold text-heading sm:text-lg">
                    {getTitle()}
                </h1>
            </div>
            <button
                onClick={onClose}
                data-voice-target="close deposit modal"
                className="flex-shrink-0 rounded-lg border border-border p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.06] hover:text-heading"
                aria-label="Close modal"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};
