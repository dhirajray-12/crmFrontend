import { WithdrawalHero } from "@/components/WithdrawlPage/WithdrawalHero/WithdrawalHero";
import { WithdrawalModal } from "@/components/WithdrawlPage/WithdrawalModal/WithdrawalModal";
import {
  WithdrawalsTable,
  MobileWithdrawalsList,
} from "@/components/WithdrawlPage/WithdrawalsTable/WithdrawalsTable";
import { TableHeader } from "@/components/WithdrawlPage/WithdrawalsTable/TableHeader";
import { MobileFilterDrawer } from "@/components/WithdrawlPage/MobileFilterDrawer/MobileFilterDrawer";
import { Pagination } from "@/components/DepositPage/common/Pagination";
import { useOTP } from "@/hooks/useOTP";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { useWithdrawalForm } from "@/hooks/useWithdrawalForm";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useFilters } from "@/hooks/useWithDrawalsFilters";
import { withdrawalApi } from "@/services/withdrawal.service";
import { useToastStore } from "@/Store/toast.store";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import {
  applyRealtimeTransactionUpdate,
  captureRealtimeSnapshots,
  restoreRealtimeSnapshots,
} from "@/utils/clientDashboardRealtime";
import "@/utils/animations.css";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function WithdrawalPage() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const addToast = useToastStore((state) => state.addToast);
  const itemsPerPage = 5;

  const {
    withdrawals,
    accounts,
    savedPayoutDetails,
    dynamicAccountTypes,
    totalBalance,
  } = useWithdrawals();

  const {
    filters,
    filteredData,
    activeFiltersCount,
    toggleAccountType,
    toggleStatus,
    updateDate,
    clearAllFilters,
    clearCategory,
  } = useFilters(withdrawals);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const withdrawalActivity = [
    {
      label: "Requests",
      value: filteredData.length,
      icon: Clock3,
      accentColor: "bg-rose-400",
      iconColor: "text-rose-700 dark:text-rose-300",
    },
    {
      label: "Approved",
      value: filteredData.filter(
        (item) => item.status.toLowerCase() === "approved",
      ).length,
      icon: CheckCircle2,
      accentColor: "bg-emerald-400",
      iconColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Pending",
      value: filteredData.filter(
        (item) => item.status.toLowerCase() === "pending",
      ).length,
      icon: ShieldAlert,
      accentColor: "bg-amber-400",
      iconColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  const {
    selectedAccount,
    formData,
    selectedMethod,
    showEWalletOptions,
    selectedWalletType,
    handleAccountSelect,
    handleMethodSelect,
    handleInputChange,
    handleWalletTypeSelect,
    handleWalletInput,
    setShowEWalletOptions,
    resetForm,
    validateForm,
    getWithdrawalRequestBody,
    clearBankDetails,
    clearWalletDetails,
  } = useWithdrawalForm(savedPayoutDetails);

  const { otpState, setOtpState, sendOTP, verifyOTP, resendOTP, resetOTP } =
    useOTP();
  const sendOtpGuard = useActionGuard({
    isBusy: otpState.isSendingOTP,
    warningMessage:
      "OTP delivery is already in progress. Please wait before requesting another code.",
  });
  const verifyOtpGuard = useActionGuard({
    isBusy: otpState.isVerifyingOTP,
    warningMessage:
      "OTP verification is already in progress. Please wait for the current check to complete.",
  });
  const withdrawalSubmitGuard = useActionGuard({
    isBusy: isProcessing,
    warningMessage:
      "A withdrawal request is already being processed. Please wait before submitting again.",
  });

  const submitWithdrawalMutation = useOptimisticMutation({
    mutationFn: async (requestBody: any) => withdrawalApi.submitWithdrawal(requestBody),
    invalidateKeys: [
      "withdrawals",
      "dashboardData",
      "transactions",
      "withdrawalAccounts",
    ],
    optimisticUpdate: (requestBody, queryClientInstance) => {
      const tempId = `temp-withdrawal-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const methodLabel =
        requestBody.paymentMethod === "bank"
          ? "Bank Transfer"
          : requestBody.paymentMethod === "stripe_card"
            ? "Card (Stripe)"
            : `E-Wallet (${String(
              requestBody.eWalletDetails?.type || requestBody.paymentMethod || "",
            ).toUpperCase()})`;

      const timeZone = getConfiguredTimezone();
      const optimisticWithdrawal = {
        id: tempId,
        rawDate: new Date(createdAt).toLocaleDateString("en-CA", { timeZone }),
        dateInitiated: new Date(createdAt).toLocaleDateString(undefined, { timeZone }),
        processedDate: "",
        initiatedtime: new Date(createdAt).toLocaleTimeString(undefined, { timeZone }),
        processedtime: "",
        method: methodLabel,
        amount: `$${requestBody.amount}`,
        account: requestBody.accountNumber || "N/A",
        accounttype: requestBody.accountType || "N/A",
        status: "Pending",
        timetaken: "-",
      };

      queryClientInstance.setQueryData(["withdrawals"], (old: any) => {
        if (!Array.isArray(old)) {
          return [optimisticWithdrawal];
        }

        return [optimisticWithdrawal, ...old];
      });

      const realtimeSnapshots = captureRealtimeSnapshots(queryClientInstance);
      applyRealtimeTransactionUpdate(queryClientInstance, {
        id: tempId,
        type: "withdrawal",
        amount: Number(requestBody.amount) || 0,
        account: requestBody.accountNumber || "N/A",
        accountType: requestBody.accountType || "N/A",
        method: methodLabel,
        createdAt,
      });

      return {
        realtimeSnapshots,
      };
    },
    onSuccess: async () => {
      addToast("success", "Withdrawal request submitted successfully!");
      setOpenModal(false);
      resetForm();
      resetOTP();
    },
    onError: async (error: any, _variables, context: any) => {
      restoreRealtimeSnapshots(queryClient, context?.realtimeSnapshots);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit withdrawal.";
      addToast("error", msg);
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpenModal(false);
      }
    }

    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSendOTP = async () => {
    await sendOtpGuard.run(async () => {
      const validation = validateForm();
      if (!validation.isValid) {
        addToast("error", validation.error!);
        return;
      }

      const requestBody = getWithdrawalRequestBody();
      const result = await sendOTP(requestBody);

      if (result.success) {
        addToast("success", "OTP sent to your email! Please check your inbox.");
      } else {
        addToast("error", result.error!);
      }
    });
  };

  const handleVerifyOTP = async () => {
    await verifyOtpGuard.run(async () => {
      const result = await verifyOTP(otpState.otp);

      if (result.success) {
        addToast(
          "success",
          "OTP verified successfully! You can now submit your withdrawal.",
        );
      } else {
        addToast("error", result.error!);
      }
    });
  };

  const handleResendOTP = async () => {
    await sendOtpGuard.run(async () => {
      const result = await resendOTP();

      if (result.success) {
        addToast("success", "New OTP sent to your email!");
      } else {
        addToast("error", result.error!);
      }
    });
  };

  const handleSubmit = async () => {
    await withdrawalSubmitGuard.run(async () => {
      if (!otpState.isOTPVerified) {
        addToast("error", "Please verify OTP before submitting withdrawal");
        return;
      }

      const validation = validateForm();
      if (!validation.isValid) {
        addToast("error", validation.error!);
        return;
      }

      try {
        setIsProcessing(true);
        addToast("info", "Processing your withdrawal request...");

        const requestBody = {
          ...getWithdrawalRequestBody(),
          otpVerified: true,
        };

        await submitWithdrawalMutation.mutateAsync(requestBody);
      } catch (err: any) {
        return;
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleModalClose = () => {
    setOpenModal(false);
    resetForm();
    resetOTP();
  };

  const handleWalletSelect = (wallet: any) => {
    handleWalletTypeSelect(wallet.name);
    if (wallet.address) {
      handleInputChange("walletAddress", wallet.address);
      handleInputChange("walletType", wallet.name);
    }
  };

  return (
    <div className="client-theme-bg relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <WithdrawalHero
          totalBalance={totalBalance}
          activeFiltersCount={activeFiltersCount}
          onOpenFilters={() => setFilterOpen(true)}
          onNewWithdrawal={() => setOpenModal(true)}
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3">
          {withdrawalActivity.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5"
              >
                <div className={`absolute inset-y-0 left-0 w-1 ${card.accentColor}`} />
                <div className="flex items-center justify-between gap-2 pl-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                    {card.label}
                  </span>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
                <p className="mt-3 pl-2 text-2xl font-bold text-heading sm:text-[28px]">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="mt-5 overflow-hidden rounded-xl border border-border bg-surface sm:mt-6"
          data-tour-anchor="withdrawal-ledger"
        >
          <div className="hidden overflow-x-auto xl:block">
            <table className="min-w-full text-left">
              <TableHeader />
              <tbody className="divide-y divide-border">
                <WithdrawalsTable data={paginatedData} />
              </tbody>
            </table>
          </div>

          <div className="xl:hidden">
            <MobileWithdrawalsList data={paginatedData} />
          </div>

          {filteredData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        <MobileFilterDrawer
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          activeFiltersCount={activeFiltersCount}
          accountTypeOptions={dynamicAccountTypes}
          onToggleAccountType={toggleAccountType}
          onToggleStatus={toggleStatus}
          onUpdateDate={updateDate}
          onClearAll={clearAllFilters}
          onClearCategory={clearCategory}
        />

        <WithdrawalModal
          isOpen={openModal}
          onClose={handleModalClose}
          accounts={accounts}
          savedWallets={savedPayoutDetails?.wallets || null}
          savedBankDetails={savedPayoutDetails?.bankDetails || null}
          selectedAccount={selectedAccount}
          formData={formData}
          selectedMethod={selectedMethod}
          selectedWalletType={selectedWalletType}
          showEWalletOptions={showEWalletOptions}
          otpState={otpState}
          isProcessing={isProcessing}
          onAccountSelect={handleAccountSelect}
          onAmountChange={(value) => handleInputChange("amount", value)}
          onMethodSelect={handleMethodSelect}
          onInputChange={(field, value) =>
            handleInputChange(field as keyof typeof formData, value)
          }
          onWalletTypeSelect={handleWalletTypeSelect}
          onWalletAddressChange={handleWalletInput}
          onToggleEWalletOptions={() =>
            setShowEWalletOptions(!showEWalletOptions)
          }
          onClearBankDetails={clearBankDetails}
          onClearWalletDetails={clearWalletDetails}
          onWalletSelect={handleWalletSelect}
          onSendOTP={handleSendOTP}
          onVerifyOTP={handleVerifyOTP}
          onResendOTP={handleResendOTP}
          onOtpChange={(otp) => setOtpState((prev) => ({ ...prev, otp }))}
          onSubmit={handleSubmit}
          modalRef={modalRef}
        />
      </div>
    </div>
  );
}
