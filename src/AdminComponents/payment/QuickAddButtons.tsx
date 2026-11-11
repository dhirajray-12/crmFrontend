import { Building2, Bitcoin, Wallet } from 'lucide-react';

interface QuickAddButtonsProps {
    onBankAdd: () => void;
    onCryptoAdd: () => void;
    onOtherAdd: () => void;
}

export const QuickAddButtons = ({ onBankAdd, onCryptoAdd, onOtherAdd }: QuickAddButtonsProps) => {
    return (
        <div className="p-4 bg-surface border-t border-border">
            <div className="flex items-center gap-3 justify-center flex-wrap">
                <button
                    onClick={onBankAdd}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-strong hover:border-blue-300 transition-colors"
                >
                    <Building2 className="h-4 w-4" /> Add Bank
                </button>
                <button
                    onClick={onCryptoAdd}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-strong hover:border-orange-300 transition-colors"
                >
                    <Bitcoin className="h-4 w-4" /> Add Crypto
                </button>
                <button
                    onClick={onOtherAdd}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface-strong hover:border-purple-300 transition-colors"
                >
                    <Wallet className="h-4 w-4" /> Add Other
                </button>
            </div>
        </div>
    );
};