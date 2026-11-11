export const WarningNotice = () => {
  return (
    <>
      <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.08] p-3 sm:rounded-2xl sm:p-4">
        <p className="text-center text-xs text-amber-100 sm:text-sm">
          <strong>Important:</strong> Save these credentials securely. You
          won't be able to see them again.
        </p>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/[0.08] p-3 sm:rounded-2xl sm:p-4">
        <p className="text-center text-xs text-accent sm:text-sm">
          <strong>Tip:</strong> Click outside this modal or the X button to go
          to your Account List.
        </p>
      </div>
    </>
  );
};
