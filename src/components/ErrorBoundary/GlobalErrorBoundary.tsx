// src/components/ErrorBoundary/GlobalErrorBoundary.tsx
import type { ErrorInfo, ReactNode } from "react";
import React, { Component } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);

    // You can send to error tracking service here
    // e.g., Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="client-theme-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-accent/18 blur-3xl" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/14 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-slate-400/10 blur-3xl" />
          <div className="client-theme-surface-strong relative w-full max-w-md rounded-3xl border border-border p-8 text-center shadow-[0_22px_54px_rgba(2,6,23,0.36)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-3xl">
              !
            </div>
            <h1 className="mb-2 text-2xl font-bold text-heading">
              Something went wrong
            </h1>
            <p className="mb-6 text-subtle">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-accent/30 bg-accent/[0.16] px-6 py-3 font-semibold text-accent shadow-[0_12px_30px_rgba(14,165,233,0.18)] transition hover:-translate-y-0.5 hover:bg-accent/[0.24]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper to use the error store
export const GlobalErrorBoundary: React.FC<Props> = (props) => {
  // You can pass the addError function to the boundary if needed
  return <GlobalErrorBoundaryClass {...props} />;
};

export default GlobalErrorBoundary;
