import { Building2, CreditCard, Wallet } from "lucide-react";
import { withdrawalMethods } from "@/utils/constants";

interface MethodSelectorProps {
    selectedMethod: string;
    onSelect: (method: string) => void;
}

const METHOD_INFO: Record<string, { icon: typeof Building2; voice: string; time: string; fee: string }> = {
    "Bank Transfer": { icon: Building2, voice: "bank transfer", time: "1-3 business days", fee: "$5 flat fee" },
    "E-Wallet": { icon: Wallet, voice: "e wallet", time: "15 min - 2 hours", fee: "Varies by currency" },
    "Card (Stripe)": { icon: CreditCard, voice: "card", time: "5-10 business days", fee: "Back to the card you paid with" },
};

export const MethodSelector = ({ selectedMethod, onSelect }: MethodSelectorProps) => {
    return (
        <div>
            <label className="mb-3 block text-lg font-semibold text-heading">Withdrawal Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {withdrawalMethods.map((method) => {
                    const info = METHOD_INFO[method];
                    const Icon = info.icon;
                    return (
                        <button
                            key={method}
                            onClick={() => onSelect(method)}
                            data-voice-target={info.voice}
                            className={`min-w-0 rounded-xl border p-3 text-left transition-all duration-300 sm:rounded-2xl sm:p-4 ${selectedMethod === method
                                ? "border-accent/40 bg-accent/[0.14] shadow-[0_14px_36px_rgba(2,132,199,0.16)]"
                                : "border-border bg-surface-strong/[0.05] hover:border-border hover:bg-surface-strong/[0.08]"
                                }`}
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <Icon className="w-6 h-6 flex-shrink-0 text-accent" />
                                <span className="font-bold text-heading">{method}</span>
                            </div>
                            <div className="text-sm text-subtle">
                                <div>⏱️ {info.time}</div>
                                <div>💸 {info.fee}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
