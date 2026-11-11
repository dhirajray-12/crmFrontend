import { motion } from "framer-motion";
import { InputField } from "@/components/WithdrawalForm/Shared/InputField";
import type { WithdrawalFormData } from "@/types/withdrawal.types";

interface BankTransferFormProps {
  formData: WithdrawalFormData;
  onUpdateForm: (data: Partial<WithdrawalFormData>) => void;
}

export const BankTransferForm: React.FC<BankTransferFormProps> = ({
  formData,
  onUpdateForm,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <InputField
        label="Bank Name"
        type="text"
        value={formData.bankName || ""}
        onChange={(e) => onUpdateForm({ bankName: e.target.value })}
      />
      <InputField
        label="Account Holder Name"
        type="text"
        value={formData.accountHolderName || ""}
        onChange={(e) => onUpdateForm({ accountHolderName: e.target.value })}
      />
      <InputField
        label="Account Number"
        type="text"
        value={formData.accountNumber || ""}
        onChange={(e) => onUpdateForm({ accountNumber: e.target.value })}
      />
      <InputField
        label="IFSC Code"
        type="text"
        value={formData.ifscCode || ""}
        onChange={(e) => onUpdateForm({ ifscCode: e.target.value })}
      />
    </motion.div>
  );
};
