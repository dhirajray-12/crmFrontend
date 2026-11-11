import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div
    className="min-h-screen flex items-center justify-center p-6 font-['Lato',_sans-serif]"
    style={{
      background: `
        radial-gradient(circle at top left, rgba(239,227,202,0.55), transparent 28%),
        linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
      `,
    }}
  >
    <div
      className="w-full max-w-md rounded-2xl border border-[#e0b0b0] overflow-hidden"
      style={{
        background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
        boxShadow: "0 20px 60px rgba(44,31,14,0.25)",
      }}
    >
      {/* header */}
      <div
        className="px-6 py-5 border-b border-[#e0b0b0]"
        style={{ background: "linear-gradient(135deg, #3a1010, #7a2a2a)" }}
      >
        <p
          className="text-[#c47a7a] text-[10px] tracking-[0.3em] uppercase mb-1"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          System Error
        </p>
        <h2
          className="text-xl font-light text-heading"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Failed to Load Data
        </h2>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-[#e0b0b0] bg-surface-strong p-4">
          <AlertCircle className="w-5 h-5 text-[#8a3a3a] dark:text-[#cf8c8c] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#7a2a2a] dark:text-[#d58686]">{error}</p>
        </div>

        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-85"
          style={{
            background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
            color: "var(--heading)",
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);