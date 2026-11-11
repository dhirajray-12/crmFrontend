import { useWithdrawalStore } from '@/Store/Ibwithdrawal.store';

export const BankDetailsForm = () => {
    const { formData, setFormData } = useWithdrawalStore();

    const fields = [
        {
            name: 'bankName',
            label: 'Bank Name',
            placeholder: 'Enter bank name',
            value: formData.bankName,
            voiceField: 'bank name',
        },
        {
            name: 'accountHolderName',
            label: 'Account Holder Name',
            placeholder: 'Enter account holder name',
            value: formData.accountHolderName,
            voiceField: 'account holder name',
        },
        {
            name: 'accountNumber',
            label: 'Account Number',
            placeholder: 'Enter account number',
            value: formData.accountNumber,
            voiceField: 'bank account number',
        },
        {
            name: 'ifscCode',
            label: 'IFSC Code',
            placeholder: 'Enter IFSC code',
            value: formData.ifscCode,
            voiceField: 'ifsc code',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
                <div key={field.name}>
                    <label className="mb-1.5 block text-sm font-medium text-subtle">
                        {field.label}
                    </label>
                    <input
                        type="text"
                        name={field.name}
                        value={field.value}
                        onChange={(e) => setFormData({ [field.name]: e.target.value })}
                        placeholder={field.placeholder}
                        data-voice-target={field.voiceField}
                        data-voice-field={field.voiceField}
                        className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading placeholder:text-subtle transition focus:border-accent/40 focus:outline-none"
                    />
                </div>
            ))}
        </div>
    );
};
