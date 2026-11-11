import React from 'react';
import { STATS } from '@/Constants/auth.constants';

export const MobileStats: React.FC = () => {
    return (
        <div className="lg:hidden grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
            {STATS.map((stat, index) => (
                <div key={index} className="text-center">
                    <div className="bg-gradient-to-r from-accent to-teal-200 bg-clip-text text-base font-bold text-transparent sm:text-xl">
                        {stat.number}
                    </div>
                    <div className="text-[10px] text-subtle sm:text-xs">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};
