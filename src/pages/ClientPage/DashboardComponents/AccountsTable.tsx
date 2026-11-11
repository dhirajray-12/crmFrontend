import { useAccountsStore } from "@/Store/accountsStore";
import { useToastStore } from "@/Store/toast.store";
import { AccountsTableContent } from "@/components/AccountsTable/AccountsTableContent";
import { DepositModalWrapper } from "@/components/AccountsTable/Modals/DepositModalWrapper";
import { WithdrawModalWrapper } from "@/components/AccountsTable/Modals/WithdrawModalWrapper";
import {
  useAccountsList,
  useAvailableBalances,
  useProfileWallets,
} from "@/hooks/useAccountsData";
import React, { useCallback, useEffect } from "react";

const AccountsTable: React.FC = () => {
  const {
    setAvailableBalances,
    setSavedWallets,
    availableBalances,
    savedWallets,
  } = useAccountsStore();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch main accounts list
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    error: accountsError,
  } = useAccountsList();

  // Fetch available balances for withdrawal
  const {
    data: balancesData,
    isLoading: balancesLoading,
    error: balancesError,
  } = useAvailableBalances();

  // Fetch profile wallets
  const {
    data: walletsData,
    isLoading: walletsLoading,
    error: walletsError,
  } = useProfileWallets();

  // ✅ WRAP WITH useCallback - prevents recreation on every render
  const handleSetAvailableBalances = useCallback(
    (data: any) => {
      if (data) setAvailableBalances(data);
    },
    [setAvailableBalances],
  );

  const handleSetSavedWallets = useCallback(
    (data: any) => {
      if (data) setSavedWallets(data);
    },
    [setSavedWallets],
  );
  // Update store when data is fetched
  useEffect(() => {
    handleSetAvailableBalances(balancesData);
  }, [balancesData, handleSetAvailableBalances]);

  useEffect(() => {
    handleSetSavedWallets(walletsData);
  }, [walletsData, handleSetSavedWallets]);

  useEffect(() => {
    if (!walletsError) return;

    const message =
      walletsError instanceof Error
        ? walletsError.message
        : "Failed to load profile wallet details.";

    if (message.includes('["profileWallets"] data is undefined')) {
      console.warn("Profile wallets are missing from the profile payload.");
      return;
    }

    addToast("error", message);
  }, [walletsError, addToast]);

  // Handle errors (you can add proper error handling UI)
  if (accountsError || balancesError || walletsError) {
    console.error("Error fetching data:", {
      accountsError,
      balancesError,
      walletsError,
    });
  }

  const isLoading = accountsLoading || balancesLoading || walletsLoading;

  return (
    <>
      <AccountsTableContent accounts={accounts} isLoading={isLoading} />

      <DepositModalWrapper />

      <WithdrawModalWrapper
        savedWallets={savedWallets}
        availableBalances={availableBalances}
      />
    </>
  );
};

export default AccountsTable;
