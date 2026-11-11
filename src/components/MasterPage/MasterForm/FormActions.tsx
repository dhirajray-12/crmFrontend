interface FormActionsProps {
    mode: "create" | "update";
    loading: boolean;
    onCancel: () => void;
}

export const FormActions = ({ mode, loading, onCancel }: FormActionsProps) => {
    return (
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                data-voice-target="cancel master form"
                className="rounded-lg border border-border bg-surface-strong/[0.04] px-5 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-surface-strong/[0.08] disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                data-voice-target={mode === "create" ? "create master account" : "save master changes"}
                className="rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? "Processing..."
                    : mode === "create"
                        ? "Create Master Account"
                        : "Save Changes"}
            </button>
        </div>
    );
};
