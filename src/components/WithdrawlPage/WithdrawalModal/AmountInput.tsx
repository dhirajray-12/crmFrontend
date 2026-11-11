interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const AmountInput = ({ value, onChange }: AmountInputProps) => {
    return (
        <div>
            <label className="mb-2 block text-base font-semibold text-heading sm:mb-3 sm:text-lg">
                Withdrawal Amount ($)
            </label>
            <input
                type="number"
                min="1"
                data-voice-target="withdrawal amount"
                data-voice-field="withdrawal amount"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter amount to withdraw"
                className="client-theme-input w-full rounded-xl px-4 py-3 text-base text-heading placeholder:text-subtle [color-scheme:dark] sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg focus:outline-none"
            />
            <p className="mt-2 text-sm text-subtle">Minimum withdrawal: $1.00</p>
        </div>
    );
};
