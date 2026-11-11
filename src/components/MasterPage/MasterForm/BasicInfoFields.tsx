import type { MasterFormData } from "@/types/MasterPage.type";

interface BasicInfoFieldsProps {
  formData: MasterFormData;
  mode: "create" | "update";
  accounts: any[];
  onChange: (field: keyof MasterFormData, value: string) => void;
}

export const BasicInfoFields = ({
  formData,
  mode,
  accounts,
  onChange,
}: BasicInfoFieldsProps) => {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-heading">
          Your Nickname *
        </label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => onChange("nickname", e.target.value)}
          placeholder="Enter your nickname"
          required
          className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-heading">
          Selected Account *
        </label>
        {mode === "create" ? (
          <select
            value={formData.accountId}
            onChange={(e) => onChange("accountId", e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-heading focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          >
            <option value="" className="bg-gray-800">
              Select an account
            </option>
            {accounts.map((account) => (
              <option
                key={account._id}
                value={account.mt5Account}
                className="bg-gray-800"
              >
                {account.mt5Account} - {account.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={formData.accountId}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-subtle opacity-70"
          />
        )}
      </div>
    </>
  );
};
