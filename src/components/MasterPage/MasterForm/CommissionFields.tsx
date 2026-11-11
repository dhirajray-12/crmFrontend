import type { MasterFormData } from "@/types/MasterPage.type";

interface CommissionFieldsProps {
  formData: MasterFormData;
  onChange: (field: keyof MasterFormData, value: string) => void;
}

export const CommissionFields = ({
  formData,
  onChange,
}: CommissionFieldsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-semibold text-heading">
          Commission (%) *
        </label>
        <input
          type="number"
          value={formData.commission}
          onChange={(e) => onChange("commission", e.target.value)}
          placeholder="0-50"
          min="0"
          max="50"
          step="0.1"
          required
          className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-heading">
          Min Investment *
        </label>
        <input
          type="number"
          value={formData.minimumInvestment}
          onChange={(e) => onChange("minimumInvestment", e.target.value)}
          placeholder="1000"
          required
          className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />
      </div>
    </div>
  );
};
