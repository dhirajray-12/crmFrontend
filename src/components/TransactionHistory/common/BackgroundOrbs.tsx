export const BackgroundOrbs = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-accent/18 blur-3xl animate-blob sm:h-80 sm:w-80" />
            <div className="absolute top-40 right-10 h-48 w-48 rounded-full bg-accent/18 blur-3xl animate-blob animation-delay-2000 sm:h-96 sm:w-96" />
            <div className="absolute bottom-10 left-1/3 h-36 w-36 rounded-full bg-slate-400/14 blur-3xl animate-blob sm:h-72 sm:w-72" />
        </div>
    );
};
