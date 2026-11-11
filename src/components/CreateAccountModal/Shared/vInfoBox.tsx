import type { ReactNode } from "react";
interface InfoBoxProps {
    Icon: ReactNode;
    title: string;
    children: ReactNode;
    className?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
    Icon,
    title,
    children,
    className = "border border-accent/15 bg-accent/[0.08]",
}) => {
    return (
        <div className={`rounded-[28px] p-4 shadow-inner sm:p-6 ${className}`}>
            <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">{Icon}</span>
                <div className="flex-1 min-w-0">
                    <strong className="mb-1 block text-base text-accent sm:mb-2 sm:text-lg">
                        {title}
                    </strong>
                    <div className="text-xs leading-relaxed text-subtle sm:text-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
