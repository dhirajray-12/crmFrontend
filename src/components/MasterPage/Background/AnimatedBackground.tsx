export const AnimatedBackground = () => {
    return (
        <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#4facfe] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div
                className="absolute top-0 right-0 w-96 h-96 bg-[#00f2fe] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                style={{ animationDelay: "2s" }}
            ></div>
            <div
                className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#f093fb] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                style={{ animationDelay: "4s" }}
            ></div>
        </>
    );
};