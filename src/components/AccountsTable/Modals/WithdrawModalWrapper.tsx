import { useRefreshAccounts } from "@/hooks/useAccountsData";
import WithdrawalForm from "@/pages/ClientPage/DashboardComponents/WithdrawalForm";
import { useAccountsStore } from "@/Store/accountsStore";
import React from "react";

interface WithdrawModalWrapperProps {
  savedWallets: any | null;
  availableBalances: any[];
}

export const WithdrawModalWrapper: React.FC<WithdrawModalWrapperProps> = ({
  savedWallets,
  availableBalances,
}) => {
  const { openWithdrawModal, setOpenWithdrawModal } = useAccountsStore();
  const refreshAccounts = useRefreshAccounts();

  return (
    <WithdrawalForm
      isOpen={openWithdrawModal}
      onClose={() => setOpenWithdrawModal(false)}
      availableBalances={availableBalances}
      onSuccess={refreshAccounts}
      savedWallets={savedWallets}
    />
  );
};
