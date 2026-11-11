import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface WithdrawalStatusIconProps {
    status: string;
}

export const WithdrawalStatusIcon = ({ status }: WithdrawalStatusIconProps) => {
    switch (status) {
        case 'approved':
        case 'completed':
            return <CheckCircle className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />;
        case 'rejected':
            return <XCircle className="h-3.5 w-3.5 text-red-700 dark:text-red-300" />;
        default:
            return <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />;
    }
};
