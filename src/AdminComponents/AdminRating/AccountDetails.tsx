import type { MasterTrader } from "@/types/rating.types";

interface AccountDetailsProps {
  master: MasterTrader;
}

export const AccountDetails = ({ master }: AccountDetailsProps) => (
  <div className="bg-surface-strong rounded-3xl p-8 border border-border shadow-xl mb-6">
    <h3 className="text-2xl font-bold text-heading mb-6">
      Master's Account Details
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-surface rounded-xl p-4 border border-border">
        <p className="text-body text-sm mb-2">Unrealized Profit</p>
        <p className="text-2xl font-bold text-green-600">
          ${master.accountDetails?.unrealizedProfit?.toLocaleString() || "0"}
        </p>
      </div>
      <div className="bg-surface rounded-xl p-4 border border-border">
        <p className="text-body text-sm mb-2">Account Balance</p>
        <p className="text-2xl font-bold text-heading">
          ${master.accountDetails?.accountBalance || "0"}
        </p>
      </div>
      <div className="bg-surface rounded-xl p-4 border border-border">
        <p className="text-body text-sm mb-2">Master Trader Bonus</p>
        <p className="text-2xl font-bold text-yellow-600">
          ${master.accountDetails?.masterTraderBonus || "0"}
        </p>
      </div>
      <div className="bg-surface rounded-xl p-4 border border-border">
        <p className="text-body text-sm mb-2">Leverage</p>
        <p className="text-2xl font-bold text-purple-600">
          1:{master.accountDetails?.lever || "100"}
        </p>
      </div>
      <div className="bg-surface rounded-xl p-4 border border-border">
        <p className="text-body text-sm mb-2">Max Unrealized Loss</p>
        <p className="text-2xl font-bold text-red-600">
          ${master.riskManagement?.maxUnrealizedLoss?.toLocaleString() || "0"}
        </p>
      </div>
      <div className="bg-surface rounded-xl p-4 border border-border">
        <p className="text-body text-sm mb-2">Max Loss Duration</p>
        <p className="text-2xl font-bold text-orange-600">
          {master.riskManagement?.maxLossDuration || "N/A"}
        </p>
      </div>
    </div>
  </div>
);
