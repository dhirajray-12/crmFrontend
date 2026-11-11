import React from 'react';

export const BackgroundElements: React.FC = () => {
    return (
        <>
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] md:bg-[size:50px_50px]" />

            {/* Static Gradient Orbs to keep mobile rendering stable */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-accent/70 blur-[50px] md:-top-40 md:-left-40 md:h-96 md:w-96 md:blur-[120px]" />
                <div className="absolute top-1/2 -right-20 h-48 w-48 rounded-full bg-accent/60 blur-[80px] md:-right-40 md:h-96 md:w-96 md:blur-[120px]" />
                <div className="absolute bottom-10 left-1/4 h-48 w-48 rounded-full bg-slate-300/25 blur-[80px] md:bottom-20 md:left-1/3 md:h-96 md:w-96 md:blur-[120px]" />
            </div>

            <style>{`
        .bg-grid-white\\/\\[0\\.02\\] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
      `}</style>
        </>
    );
};
