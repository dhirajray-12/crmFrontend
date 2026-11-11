import React from 'react';

export const BackgroundEffects: React.FC = () => {
    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-accent/6 to-slate-200/5 animate-gradientShift"></div>
            <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent/70 to-transparent animate-progressGlow"></div>
            <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-accent/12 blur-3xl animate-blob"></div>
            <div
                className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl animate-blob"
                style={{ animationDelay: "2s" }}
            ></div>
        </>
    );
};
