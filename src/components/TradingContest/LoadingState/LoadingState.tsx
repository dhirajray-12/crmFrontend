export const LoadingState = () => {
  return (
    <div className="client-theme-bg flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-10 py-10 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-accent/20 border-t-sky-400" />
        <p className="text-sm font-medium text-subtle">Loading trades…</p>
      </div>
    </div>
  );
};
