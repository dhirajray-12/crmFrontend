import { useProfileStore } from '@/Store/profile.store';
import { useToastStore } from '@/Store/toast.store';
import { useUpdateWallet } from '@/hooks/useProfileQueries';

const walletFields = [
    { key: 'tetherWalletAddress', label: 'USDT Wallet Address', placeholder: 'Enter USDT wallet address', voiceField: 'usdt wallet address' },
    { key: 'ethWalletAddress', label: 'ETH Wallet Address', placeholder: 'Enter ETH wallet address', voiceField: 'eth wallet address' },
    { key: 'trxWalletAddress', label: 'TRX Wallet Address', placeholder: 'Enter TRX wallet address', voiceField: 'trx wallet address' },
] as const;

export const WalletDetails = () => {
    const { walletDetails, updateWalletDetails } = useProfileStore();
    const updateWalletMutation = useUpdateWallet();
    const addToast = useToastStore((state) => state.addToast);

    const handleSubmit = async () => {
        try {
            await updateWalletMutation.mutateAsync(walletDetails);
            addToast('success', 'Wallet details updated successfully.');
        } catch (error) {
            addToast('error', 'Failed to update wallet details.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-5">
                <h2 className="mb-1 text-2xl font-semibold text-heading">Wallet Details</h2>
                <p className="text-sm text-subtle">Crypto payout addresses saved to your client profile.</p>
            </div>

            <div className="space-y-4">
                {walletFields.map(({ key, label, placeholder, voiceField }) => (
                    <div key={key}>
                        <label className="mb-2 block text-sm font-medium text-heading">{label}</label>
                        <input
                            className="client-theme-input w-full rounded-xl p-3 text-heading placeholder:text-subtle focus:outline-none"
                            placeholder={placeholder}
                            data-voice-target={voiceField}
                            data-voice-field={voiceField}
                            value={walletDetails[key]}
                            onChange={(e) => updateWalletDetails(key, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={updateWalletMutation.isPending}
                    data-voice-target="update wallet"
                    className="rounded-xl border border-accent/30 bg-accent/[0.16] px-6 py-3 font-semibold text-accent transition-all hover:bg-accent/[0.24] disabled:opacity-50"
                >
                    {updateWalletMutation.isPending ? 'Updating...' : 'Update Wallet'}
                </button>
            </div>
        </div>
    );
};
