import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { useCommissionStore } from '@/Store/commission.store';

export const Toast = () => {
    const { toastMessage, clearToast } = useCommissionStore();

    if (!toastMessage) return null;

    const { type, message } = toastMessage;

    const icons = {
        success: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />,
        error: <XCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />,
        info: <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />,
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 left-4 sm:left-auto z-[100] px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center gap-3 ${colors[type]} text-heading`}
        >
            {icons[type]}
            <span className="font-semibold text-sm sm:text-base flex-1">{message}</span>
            <button onClick={clearToast} className="ml-2 hover:opacity-80 flex-shrink-0">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};