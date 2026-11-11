import { Building2, CreditCard, Wallet, type LucideIcon } from "lucide-react";
import { useDepositStore } from "@/Store/depositStore";

interface MethodOption {
    key: "bankSelect" | "walletSelect" | "card";
    icon: LucideIcon;
    iconColor: string;
    accentColor: string;
    title: string;
    description: string;
    badge: string;
    voiceTarget: string;
}

const METHODS: MethodOption[] = [
    {
        key: "bankSelect",
        icon: Building2,
        iconColor: "text-accent",
        accentColor: "bg-accent",
        title: "Bank Transfer",
        description: "Secure direct bank transfer with instant processing and low fees",
        badge: "1-3 Business Days",
        voiceTarget: "bank transfer",
    },
    {
        key: "walletSelect",
        icon: Wallet,
        iconColor: "text-violet-700 dark:text-violet-300",
        accentColor: "bg-violet-400",
        title: "E-Wallet",
        description: "Fast and secure crypto wallet deposits with instant confirmation",
        badge: "Instant Transfer",
        voiceTarget: "e wallet",
    },
    {
        key: "card",
        icon: CreditCard,
        iconColor: "text-sky-700 dark:text-sky-300",
        accentColor: "bg-sky-400",
        title: "Card (Stripe)",
        description: "Pay by debit or credit card on Stripe's secure page; credited automatically",
        badge: "Instant, automatic",
        voiceTarget: "card payment",
    },
];

export const MethodSelection: React.FC = () => {
    const { setStep } = useDepositStore();

    return (
        <div className="space-y-5">
            <p className="text-sm text-subtle">
                Choose your preferred deposit method to get started
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                        <button
                            key={method.key}
                            onClick={() => setStep(method.key)}
                            data-voice-target={method.voiceTarget}
                            className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:bg-surface-strong/[0.04] sm:p-6"
                        >
                            <div className={`absolute inset-y-0 left-0 w-1 ${method.accentColor}`} />
                            <div className="pl-2">
                                <div className="mb-4 inline-flex rounded-xl border border-border bg-surface-strong/[0.04] p-3">
                                    <Icon className={`h-7 w-7 ${method.iconColor}`} />
                                </div>
                                <h3 className="text-lg font-bold text-heading">
                                    {method.title}
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                                    {method.description}
                                </p>
                                <span className="mt-4 inline-block rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1 text-xs font-semibold text-subtle">
                                    {method.badge}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
