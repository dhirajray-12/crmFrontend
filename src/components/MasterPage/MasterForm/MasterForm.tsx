import type { MasterAccount, Account } from "@/types/MasterPage.type";
import { useMasterForm } from "@/hooks/useMasterPageForm";
import { FormHeader } from "./FormHeader";
import { BasicInfoFields } from "./BasicInfoFields";
import { CommissionFields } from "./CommissionFields";
import { StrategyFields } from "./StrategyFields";
import { FormTips } from "./FormTips";
import { FormActions } from "./FormActions";

interface MasterFormProps {
  mode: "create" | "update";
  master?: MasterAccount;
  accounts: Account[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const MasterForm = ({
  mode,
  master,
  accounts,
  onSubmit,
  onCancel,
}: MasterFormProps) => {
  const { formData, formLoading, formError, handleChange, handleSubmit } =
    useMasterForm({
      mode,
      master,
      accounts,
      onSubmit,
      onCancel,
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <FormHeader mode={mode} onBack={onCancel} />

      {formError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{formError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5 lg:col-span-2">
          <BasicInfoFields
            formData={formData}
            mode={mode}
            accounts={accounts}
            onChange={handleChange}
          />
          <CommissionFields formData={formData} onChange={handleChange} />
          <StrategyFields formData={formData} onChange={handleChange} />
          <FormActions mode={mode} loading={formLoading} onCancel={onCancel} />
        </div>

        <div>
          <FormTips />
        </div>
      </div>
    </form>
  );
};
