import { AccountCard } from "@/components/AccountList/AccountCard/AccountCard";
import { AccountDetails } from "@/components/AccountList/AccountDetails/AccountDetails";
import { AccountHeader } from "@/components/AccountList/AccountHeader/AccountHeader";
import { BackgroundOrbs } from "@/components/AccountList/common/BackgroundOrbs";
import { EmptyState } from "@/components/AccountList/common/EmptyState";
import { PasswordModal } from "@/components/AccountList/PasswordModal/PasswordModal";
import { SummaryCards } from "@/components/AccountList/SummaryCards/SummaryCards";
import { useAccounts } from "@/hooks/useAccountList";
import { useFilters } from "@/hooks/useAccountListFilters";
import { usePasswordUpdate } from "@/hooks/useAccountListPasswordUpdate";
import { useTransactions } from "@/hooks/useAccountListTransactions";
import { useToastStore } from "@/Store/toast.store";
import type { Account } from "@/types/Accountlist.type";
import "@/utils/AccountListAnimation.css";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListSkeleton } from "@/components/Common/LoadingSkeleton";

export default function AccountList() {
  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  const { accounts, summary, fetchAccounts, loading } = useAccounts();

  const {
    accountTransactions,
    transactionStats,
    loadingTransactions,
    fetchAccountTransactions,
  } = useTransactions();

  const {
    selectedAccountType,
    showAccountTypeFilter,
    accountTypes,
    filteredAccounts,
    setSelectedAccountType,
    setShowAccountTypeFilter,
  } = useFilters(accounts);

  const {
    isUpdating,
    showInvestor,
    showMaster,
    newInvestorPassword,
    newMasterPassword,
    setShowInvestor,
    setShowMaster,
    setNewInvestorPassword,
    setNewMasterPassword,
    updatePasswords,
    resetPasswords,
  } = usePasswordUpdate(fetchAccounts);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactionAccount, setTransactionAccount] =
    useState<Account | null>(null);

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      addToast("success", "Copied to clipboard!");
    },
    [addToast],
  );

  const handleEdit = useCallback((account: Account) => {
    setSelectedAccount(account);
  }, []);

  const handleDeposit = useCallback(() => {
    navigate("/client/deposit");
  }, [navigate]);

  const handleWithdrawal = useCallback(() => {
    navigate("/client/withdrawal");
  }, [navigate]);

  const handleCloseModal = useCallback(() => {
    setSelectedAccount(null);
    resetPasswords();
  }, [resetPasswords]);

  const handleSavePasswords = useCallback(async () => {
    if (!selectedAccount) {
      return;
    }

    const result = await updatePasswords(
      selectedAccount._id || String(selectedAccount.id),
    );

    if (result.success) {
      setSelectedAccount((prev) =>
        prev
          ? {
              ...prev,
              investorPassword:
                result.updatedPasswords?.investorPassword ??
                prev.investorPassword,
              masterPassword:
                result.updatedPasswords?.masterPassword ?? prev.masterPassword,
            }
          : prev,
      );
    }
  }, [selectedAccount, updatePasswords]);

  const handleOpenTransactions = useCallback(
    (account: Account) => {
      setTransactionAccount(account);
      void fetchAccountTransactions(account.accountNumber);
    },
    [fetchAccountTransactions],
  );

  const handleCloseTransactions = useCallback(() => {
    setTransactionAccount(null);
  }, []);

  const handleRefreshTransactions = useCallback(() => {
    if (transactionAccount) {
      void fetchAccountTransactions(transactionAccount.accountNumber);
    }
  }, [transactionAccount, fetchAccountTransactions]);

  const hasAccounts = useMemo(
    () => filteredAccounts.length > 0,
    [filteredAccounts],
  );

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div className="client-theme-bg relative min-h-screen overflow-hidden">
      <BackgroundOrbs />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AccountHeader
          selectedAccountType={selectedAccountType}
          showAccountTypeFilter={showAccountTypeFilter}
          accountTypes={accountTypes}
          filterRef={filterRef}
          onFilterToggle={() => setShowAccountTypeFilter((prev) => !prev)}
          onFilterSelect={setSelectedAccountType}
        />

        <div data-tour-anchor="account-list-summary">
          <SummaryCards
            totalBalance={summary.totalBalance}
            totalEquity={summary.totalEquity}
            totalProfitLoss={summary.totalProfitLoss}
          />
        </div>

        {!hasAccounts ? (
          <EmptyState selectedAccountType={selectedAccountType} />
        ) : (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
            data-tour-anchor="account-list-cards"
          >
            {filteredAccounts.map((account, index) => (
              <AccountCard
                key={account.id}
                account={account}
                index={index}
                onOpenTransactions={handleOpenTransactions}
                onDeposit={handleDeposit}
                onWithdrawal={handleWithdrawal}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      <AccountDetails
        account={transactionAccount}
        transactionStats={transactionStats}
        accountTransactions={accountTransactions}
        loadingTransactions={
          transactionAccount
            ? loadingTransactions[transactionAccount.accountNumber]
            : false
        }
        onClose={handleCloseTransactions}
        onRefresh={handleRefreshTransactions}
      />

      {selectedAccount && (
        <PasswordModal
          account={selectedAccount}
          isUpdating={isUpdating}
          showInvestor={showInvestor}
          showMaster={showMaster}
          newInvestorPassword={newInvestorPassword}
          newMasterPassword={newMasterPassword}
          onClose={handleCloseModal}
          onCopy={handleCopy}
          onToggleInvestor={() => setShowInvestor((prev) => !prev)}
          onToggleMaster={() => setShowMaster((prev) => !prev)}
          onInvestorChange={setNewInvestorPassword}
          onMasterChange={setNewMasterPassword}
          onSave={() => void handleSavePasswords()}
        />
      )}
    </div>
  );
}
