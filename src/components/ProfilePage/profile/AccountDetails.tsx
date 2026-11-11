import { useProfileStore } from '@/Store/profile.store';
import { useToastStore } from '@/Store/toast.store';
import { useUpdateAccount } from '@/hooks/useProfileQueries';

const accountFields = [
    { key: 'bankName', label: 'Bank Name', placeholder: 'Enter bank name', voiceField: 'bank name' },
    { key: 'accountNumber', label: 'Account Number', placeholder: 'Enter account number', voiceField: 'bank account number' },
    { key: 'accountHolderName', label: 'Account Holder Name', placeholder: 'Enter account holder name', voiceField: 'account holder name' },
    { key: 'ifscSwiftCode', label: 'IFSC / SWIFT Code', placeholder: 'Enter IFSC or SWIFT code', voiceField: 'ifsc code' },
] as const;

export const AccountDetails = () => {
    const { bankDetails, updateBankDetails } = useProfileStore();
    const updateAccountMutation = useUpdateAccount();
    const addToast = useToastStore((state) => state.addToast);

    const handleSubmit = async () => {
        try {
            await updateAccountMutation.mutateAsync(bankDetails);
            addToast('success', 'Account details updated successfully.');
        } catch (error) {
            addToast('error', 'Failed to update account details.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-5">
                <h2 className="mb-1 text-2xl font-semibold text-heading">Account Details</h2>
                <p className="text-sm text-subtle">Bank information used for withdrawal settlements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accountFields.map(({ key, label, placeholder, voiceField }) => (
                    <div key={key}>
                        <label className="mb-2 block text-sm font-medium text-heading">{label}</label>
                        <input
                            className="client-theme-input w-full rounded-xl p-3 text-heading placeholder:text-subtle focus:outline-none"
                            placeholder={placeholder}
                            data-voice-target={voiceField}
                            data-voice-field={voiceField}
                            value={bankDetails[key]}
                            onChange={(e) => updateBankDetails(key, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={updateAccountMutation.isPending}
                    data-voice-target="update account"
                    className="rounded-xl border border-accent/30 bg-accent/[0.16] px-6 py-3 font-semibold text-accent transition-all hover:bg-accent/[0.24] disabled:opacity-50"
                >
                    {updateAccountMutation.isPending ? 'Updating...' : 'Update Account'}
                </button>
            </div>
        </div>
    );
};
