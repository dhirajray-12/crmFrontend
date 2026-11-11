import type { LucideIcon } from "lucide-react";

interface GradientIconProps {
    gradient: string;
    Icon: LucideIcon;
    size?: "sm" | "md" | "lg";
}

export const GradientIcon = ({ gradient, Icon, size = "md" }: GradientIconProps) => {
    const sizeClasses = {
        sm: "p-1 w-6 h-6",
        md: "p-2 w-8 h-8",
        lg: "p-3 w-10 h-10",
    };

    return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
            <Icon className="w-full h-full text-heading" />
        </div>
    );
};