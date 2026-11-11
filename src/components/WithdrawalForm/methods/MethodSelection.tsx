import { MethodCard } from "./MethodCard";

interface MethodSelectionProps {
    selectedMethod: string;
    onSelectMethod: (method: string) => void;
}

export const MethodSelection: React.FC<MethodSelectionProps> = ({
    selectedMethod,
    onSelectMethod,
}) => {
    const methods = ["Bank Transfer", "E-Wallet", "Card (Stripe)"];

    return (
        <div>
            <label className="mb-3 block text-lg font-semibold text-heading">
                Withdrawal Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {methods.map((method) => (
                    <MethodCard
                        key={method}
                        method={method}
                        isSelected={selectedMethod === method}
                        onClick={() => onSelectMethod(method)}
                    />
                ))}
            </div>
        </div>
    );
};
