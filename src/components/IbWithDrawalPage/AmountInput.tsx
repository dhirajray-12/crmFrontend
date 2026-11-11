interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
    maxAmount: number;
}

export const AmountInput = ({ value, onChange, maxAmount }: AmountInputProps) => (
    <div>
        <label className="mb-1.5 block text-sm font-medium text-subtle">
            Withdrawal Amount ($)
        </label>
        <div className="relative">
            <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter amount"
                data-voice-target="withdrawal amount"
                data-voice-field="withdrawal amount"
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 pr-28 text-sm text-heading placeholder:text-subtle transition focus:border-accent/40 focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.1em] text-subtle">
                Max: ${maxAmount.toFixed(2)}
            </div>
        </div>
    </div>
);
