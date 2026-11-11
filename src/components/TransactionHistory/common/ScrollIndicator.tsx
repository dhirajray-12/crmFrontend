import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
    show: boolean;
}

export const ScrollIndicator = ({ show }: ScrollIndicatorProps) => {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
        >
            <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.14] px-4 py-2 text-heading shadow-[0_12px_30px_rgba(14,165,233,0.18)] animate-bounce">
                <ChevronDown className="w-4 h-4" />
                <span className="text-sm font-semibold">Scroll for more</span>
                <ChevronDown className="w-4 h-4" />
            </div>
        </motion.div>
    );
};
