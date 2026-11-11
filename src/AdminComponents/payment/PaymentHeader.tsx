import { Plus, CreditCard } from 'lucide-react';

interface PaymentHeaderProps {
    onAddClick: () => void;
}

export const PaymentHeader = ({ onAddClick }: PaymentHeaderProps) => {
    return (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface-strong/20 rounded-lg">
                        <CreditCard className="h-6 w-6 text-heading" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-heading">Payment Methods</h2>
                        <p className="text-blue-100 text-sm">Manage your payment accounts</p>
                    </div>
                </div>
                <button
                    onClick={onAddClick}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-strong text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                    <Plus className="h-4 w-4" /> Add Payment Method
                </button>
            </div>
        </div>
    );
};