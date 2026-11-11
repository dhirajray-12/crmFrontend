import type { MasterFormData } from "@/types/MasterPage.type";

interface StrategyFieldsProps {
  formData: MasterFormData;
  onChange: (field: keyof MasterFormData, value: string) => void;
}

export const StrategyFields = ({ formData, onChange }: StrategyFieldsProps) => {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-heading">
          Public Chat Link (Optional)
        </label>
        <input
          type="url"
          value={formData.publicChatLink}
          onChange={(e) => onChange("publicChatLink", e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-heading">
          Strategy Description
        </label>
        <textarea
          value={formData.strategyDescription}
          onChange={(e) => onChange("strategyDescription", e.target.value)}
          placeholder="Describe your trading strategy..."
          rows={6}
          className="w-full resize-none rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        ></textarea>
      </div>
    </>
  );
};
