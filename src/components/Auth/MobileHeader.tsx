import React from 'react';
import { Shield } from 'lucide-react';

interface MobileHeaderProps {
    headerText: string;
    subText: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ headerText, subText }) => {
    return (
        <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.12] px-3 py-1.5 backdrop-blur-sm">
                <Shield className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">Secure Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white via-accent to-teal-200 bg-clip-text text-transparent">
                    {headerText}
                </span>
            </h1>
            <p className="text-sm text-subtle">{subText}</p>
        </div>
    );
};
