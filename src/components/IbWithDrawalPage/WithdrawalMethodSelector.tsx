import { Building2, Wallet } from 'lucide-react';

interface WithdrawalMethodSelectorProps {
    selectedMethod: 'bank' | 'wallet';
    onChange: (method: 'bank' | 'wallet') => void;
}

export const WithdrawalMethodSelector = ({ selectedMethod, onChange }: WithdrawalMethodSelectorProps) => (
    <div>
        <label className="mb-1.5 block text-sm font-medium text-subtle">
            Withdrawal Method
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <MethodOption
                method="bank"
                selectedMethod={selectedMethod}
                icon={<Building2 className="h-4 w-4" />}
                label="Bank Transfer"
                onChange={onChange}
            />
            <MethodOption
                method="wallet"
                selectedMethod={selectedMethod}
                icon={<Wallet className="h-4 w-4" />}
                label="Crypto Wallet"
                onChange={onChange}
            />
        </div>
    </div>
);

interface MethodOptionProps {
    method: 'bank' | 'wallet';
    selectedMethod: string;
    icon: React.ReactNode;
    label: string;
    onChange: (method: 'bank' | 'wallet') => void;
}

const MethodOption = ({ method, selectedMethod, icon, label, onChange }: MethodOptionProps) => {
    const active = selectedMethod === method;
    return (
        <button
            type="button"
            onClick={() => onChange(method)}
            data-voice-target={`select ${label} withdrawal method`}
            className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${active
                ? "border-accent/30 bg-accent/10 text-heading"
                : "border-border bg-surface-strong/[0.03] text-subtle hover:bg-surface-strong/[0.06]"
                }`}
        >
            <span className={active ? "text-accent" : "text-subtle"}>{icon}</span>
            {label}
        </button>
    );
};
