interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const AmountInput = ({ value, onChange }: AmountInputProps) => {
  return (
    <div className="md:col-span-2">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        Amount ($)
      </label>
      <input
        type="number"
        min={10}
        data-voice-target="transfer amount"
        data-voice-field="transfer amount"
        className="client-theme-input w-full rounded-lg px-3.5 py-3 text-lg font-semibold text-heading placeholder:text-subtle [color-scheme:dark] outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        placeholder="Enter amount"
      />
      <p className="mt-2 text-xs text-subtle">
        Minimum transfer $10 &middot; processed instantly
      </p>
    </div>
  );
};
