import { useWithdrawalStore } from '@/Store/Ibwithdrawal.store';
import { ChevronDown, Wallet } from 'lucide-react';

export const CryptoWalletForm = () => {
    const { formData, setFormData, showWalletOptions, setShowWalletOptions, getWalletOptions } =
        useWithdrawalStore();
    const walletOptions = getWalletOptions();

    const handleWalletSelect = (type: string, address: string) => {
        setFormData({
            walletType: type,
            walletAddress: address,
        });
        setShowWalletOptions(false);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-subtle">
                    Select Wallet
                </label>
                <button
                    type="button"
                    onClick={() => setShowWalletOptions(!showWalletOptions)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-left text-sm text-heading transition hover:bg-surface-strong/[0.06]"
                >
                    <span className={formData.walletType ? "text-heading" : "text-subtle"}>
                        {formData.walletType || 'Choose wallet type'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-subtle transition ${showWalletOptions ? "rotate-180" : ""}`} />
                </button>

                {showWalletOptions && (
                    <div className="mt-2 space-y-2">
                        {walletOptions.map((wallet) => (
                            <WalletOption
                                key={wallet.type}
                                wallet={wallet}
                                onSelect={handleWalletSelect}
                            />
                        ))}
                    </div>
                )}
            </div>

            {formData.walletType && (
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-subtle">
                        Wallet Address
                    </label>
                    <input
                        type="text"
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ walletAddress: e.target.value })}
                        placeholder="Enter wallet address"
                        className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading placeholder:text-subtle transition focus:border-accent/40 focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
};

interface WalletOptionProps {
    wallet: {
        type: string;
        address: string;
        network: string;
    };
    onSelect: (type: string, address: string) => void;
}

const WalletOption = ({ wallet, onSelect }: WalletOptionProps) => (
    <button
        type="button"
        onClick={() => onSelect(wallet.type, wallet.address)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] p-3 text-left transition hover:bg-surface-strong/[0.06]"
    >
        <div className="flex items-center gap-2.5 min-w-0">
            <Wallet className="h-4 w-4 shrink-0 text-subtle" />
            <div className="min-w-0">
                <p className="text-sm font-medium text-heading">{wallet.type}</p>
                <p className="truncate text-xs text-subtle">
                    {wallet.address ? `${wallet.address.slice(0, 20)}...` : 'Enter address manually'}
                </p>
            </div>
        </div>
        <span className="shrink-0 text-xs text-subtle">{wallet.network}</span>
    </button>
);
