import { Building2, CreditCard, Wallet } from "lucide-react";

interface MethodCardProps {
    method: string;
    isSelected: boolean;
    onClick: () => void;
}

export const MethodCard: React.FC<MethodCardProps> = ({ method, isSelected, onClick }) => {
    const getMethodDetails = () => {
        if (method === "Bank Transfer") {
            return {
                icon: Building2,
                iconColor: "text-accent",
                details: [
                    "⏱️ 1-3 business days",
                    "💸 $5 flat fee"
                ]
            };
        }
        if (method === "Card (Stripe)") {
            return {
                icon: CreditCard,
                iconColor: "text-sky-700 dark:text-sky-300",
                details: [
                    "⏱️ 5-10 business days to your card",
                    "💳 Up to what you deposited by card"
                ]
            };
        }
        return {
            icon: Wallet,
            iconColor: "text-accent",
            details: [
                "⏱️ 15 min - 2 hours",
                "💸 Varies by currency"
            ]
        };
    };

    const { icon: Icon, iconColor, details } = getMethodDetails();

    return (
        <button
            onClick={onClick}
            className={`rounded-2xl border p-4 text-left transition-all duration-300 ${isSelected
                ? "border-accent/40 bg-accent/[0.14] shadow-[0_14px_36px_rgba(2,132,199,0.16)]"
                : "border-border bg-surface-strong/[0.05] hover:border-border hover:bg-surface-strong/[0.08]"
                }`}
        >
            <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-6 h-6 ${iconColor}`} />
                <span className="font-bold text-heading">{method}</span>
            </div>
            <div className="text-sm text-subtle">
                {details.map((detail, index) => (
                    <div key={index}>{detail}</div>
                ))}
            </div>
        </button>
    );
};
