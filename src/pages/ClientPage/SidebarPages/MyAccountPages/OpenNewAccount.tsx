import { useAuthStore } from "@/Store/auth.store";
import type { AccountData } from "@/types/OpenAccount.type";
import { AccountDetailsPreview } from "@/components/OpenNewAccount/AccountConfiguration/AccountDetailsPreview";
import { CustomSettings } from "@/components/OpenNewAccount/AccountConfiguration/CustomSettings";
import { LeverageSelector } from "@/components/OpenNewAccount/AccountConfiguration/LeverageSelector";
import { ServerInfo } from "@/components/OpenNewAccount/AccountConfiguration/ServerInfo";
import { AccountHeader } from "@/components/OpenNewAccount/AccountHeader/AccountHeader";
import { AccountTypeGrid } from "@/components/OpenNewAccount/AccountTypeSelection/AccountTypeGrid";
import { BackButton } from "@/components/OpenNewAccount/ActionButtons/BackButton";
import { CreateAccountButton } from "@/components/OpenNewAccount/ActionButtons/CreateAccountButton";
import { AnimatedBackground } from "@/components/OpenNewAccount/Background/AnimatedBackground";
import { SuccessModal } from "@/components/OpenNewAccount/SuccessModal/SuccessModal";
import { LoadingSpinner } from "@/components/OpenNewAccount/common/LoadingSpinner";
import { useAccountCreation } from "@/hooks/useAccountCreation";
import { useGroups } from "@/hooks/useOpenAccountGroups";
import { useLeverage } from "@/hooks/useOpenAccountLeverage";
import { getDefaultLeverage } from "@/utils/OpenAccount.Helper";
import "@/utils/OpenNewAccountAnimation.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OpenNewAccount() {
  const { user } = useAuthStore();
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAccountData, setSuccessAccountData] =
    useState<AccountData | null>(null);

  const { groups, accountTypes, loading, error } = useGroups();
  const navigate = useNavigate();
  const selectedGroup = groups.find((g) => g._id === selectedUserType);
  const selectedAccountType = accountTypes.find(
    (ut) => ut.id === selectedUserType,
  );

  const { leverageOpen, leverageOptions, setLeverageOpen, selectLeverage } =
    useLeverage(selectedGroup);

  const {
    loading: isCreating,
    formData,
    updateFormData,
    resetForm,
    createAccount,
  } = useAccountCreation(selectedGroup, user, (data: any) => {
    setSuccessAccountData(data);
    setShowSuccessModal(true);
    handleBackToSelection();
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (leverageOpen && !target.closest(".leverage-dropdown-container")) {
        setLeverageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [leverageOpen]);

  useEffect(() => {
    if (selectedGroup) {
      updateFormData("leverage", getDefaultLeverage(selectedGroup));
    }
  }, [selectedGroup]);

  const handleCardClick = (userTypeId: string) => {
    setSelectedUserType(userTypeId);
    setShowConfigForm(true);
  };

  const handleBackToSelection = () => {
    setShowConfigForm(false);
    setSelectedUserType(null);
    resetForm();
  };

  const handleNavigateToAccountList = () => {
    setShowSuccessModal(false);
    navigate("/client/account-list");
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="client-theme-bg flex min-h-screen items-center justify-center px-4 py-20">
        <div className="client-theme-surface-strong rounded-2xl px-8 py-6 text-center text-rose-700 dark:text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="client-theme-bg relative min-h-screen">
      <AnimatedBackground />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNavigateToAccountList={handleNavigateToAccountList}
        accountData={successAccountData}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <AccountHeader user={user} step={showConfigForm ? 2 : 1} />

        {!showConfigForm ? (
          <div className="ona-fade-up" data-tour-anchor="open-account-types">
            <AccountTypeGrid
              accountTypes={accountTypes}
              selectedUserType={selectedUserType}
              onSelect={handleCardClick}
            />
          </div>
        ) : (
          <div className="ona-fade-up space-y-5">
            <BackButton onClick={handleBackToSelection} />

            <div
              className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"
              data-tour-anchor="open-account-config"
            >
              <div className="space-y-5">
                <ServerInfo server={selectedAccountType?.server || ""} />

                <LeverageSelector
                  leverage={formData.leverage}
                  leverageOpen={leverageOpen}
                  leverageOptions={leverageOptions}
                  onToggle={() => setLeverageOpen(!leverageOpen)}
                  onSelect={(option) =>
                    selectLeverage(option, (value) =>
                      updateFormData("leverage", value),
                    )
                  }
                />

                <CustomSettings
                  customMT5Account={formData.customMT5Account}
                  masterPassword={formData.masterPassword}
                  investorPassword={formData.investorPassword}
                  onCustomMT5Change={(value) =>
                    updateFormData("customMT5Account", value)
                  }
                  onMasterPasswordChange={(value) =>
                    updateFormData("masterPassword", value)
                  }
                  onInvestorPasswordChange={(value) =>
                    updateFormData("investorPassword", value)
                  }
                />

                <CreateAccountButton
                  loading={isCreating}
                  onReset={() => {
                    updateFormData(
                      "leverage",
                      getDefaultLeverage(selectedGroup),
                    );
                    updateFormData("customMT5Account", "");
                    updateFormData("masterPassword", "");
                    updateFormData("investorPassword", "");
                  }}
                  onCreate={createAccount}
                />
              </div>

              {selectedAccountType && (
                <div className="lg:sticky lg:top-6 lg:self-start">
                  <AccountDetailsPreview
                    accountType={selectedAccountType}
                    user={user}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
